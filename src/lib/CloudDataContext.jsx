import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "./AuthContext";

const CloudDataContext = createContext(null);

export function CloudDataProvider({ children }) {
  const { user } = useAuth();
  const [cache, setCache] = useState(null); // null = todavía cargando
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const timers = useRef({});

  const localKey = user ? `rumbo-cloud-${user.id}` : null;

  const leerRespaldoLocal = () => {
    if (!localKey) return {};
    try {
      return JSON.parse(localStorage.getItem(localKey) || "{}") || {};
    } catch {
      return {};
    }
  };

  const guardarRespaldoLocal = (datos) => {
    if (!localKey) return;
    try {
      localStorage.setItem(localKey, JSON.stringify(datos));
    } catch {
      // Si el navegador bloquea el almacenamiento local, Supabase sigue siendo
      // la fuente principal y la aplicación puede continuar normalmente.
    }
  };

  useEffect(() => {
    let cancelado = false;
    if (!user) return;

    setCache(null);
    supabase
      .from("user_data")
      .select("key, value")
      .eq("user_id", user.id)
      .then(({ data, error: err }) => {
        if (cancelado) return;
        const respaldoLocal = leerRespaldoLocal();
        if (err) {
          setError(err.message);
          setCache(respaldoLocal);
          return;
        }
        const inicial = { ...respaldoLocal };
        (data || []).forEach((fila) => {
          inicial[fila.key] = fila.value;
        });
        guardarRespaldoLocal(inicial);
        setCache(inicial);
      });

    return () => {
      cancelado = true;
    };
  }, [user, reloadToken]);

  // Guarda en la nube con un pequeño retraso, para no mandar una petición
  // por cada tecla que se pulsa en un campo numérico.
  const guardarEnSupabase = async (key, value) => {
    if (!user) return null;
    const { error: err } = await supabase
      .from("user_data")
      .upsert({ user_id: user.id, key, value, updated_at: new Date().toISOString() });
    if (err) {
      setError(err.message);
      console.warn(`Rumbo: no se pudo guardar "${key}" en Supabase`, err);
    } else {
      setError(null);
    }
    return err;
  };

  const setKey = (key, value, options = {}) => {
    setCache((prev) => {
      const siguiente = { ...(prev || {}), [key]: value };
      guardarRespaldoLocal(siguiente);
      return siguiente;
    });
    if (!user) return Promise.resolve(null);

    clearTimeout(timers.current[key]);
    if (options.immediate) return guardarEnSupabase(key, value);

    timers.current[key] = setTimeout(() => {
      guardarEnSupabase(key, value);
    }, 500);
    return Promise.resolve(null);
  };

  return (
    <CloudDataContext.Provider value={{ cache, setKey, error, reload: () => setReloadToken((token) => token + 1) }}>
      {children}
    </CloudDataContext.Provider>
  );
}

export function useCloudData() {
  const ctx = useContext(CloudDataContext);
  if (!ctx) throw new Error("useCloudData debe usarse dentro de <CloudDataProvider>");
  return ctx;
}
