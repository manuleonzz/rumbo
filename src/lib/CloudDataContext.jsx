import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "./AuthContext";

const CloudDataContext = createContext(null);

export function CloudDataProvider({ children }) {
  const { user } = useAuth();
  const [cache, setCache] = useState(null); // null = todavía cargando
  const [error, setError] = useState(null);
  const timers = useRef({});

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
        if (err) {
          setError(err.message);
          setCache({});
          return;
        }
        const inicial = {};
        (data || []).forEach((fila) => {
          inicial[fila.key] = fila.value;
        });
        setCache(inicial);
      });

    return () => {
      cancelado = true;
    };
  }, [user]);

  // Guarda en la nube con un pequeño retraso, para no mandar una petición
  // por cada tecla que se pulsa en un campo numérico.
  const setKey = (key, value) => {
    setCache((prev) => ({ ...(prev || {}), [key]: value }));
    if (!user) return;

    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(async () => {
      const { error: err } = await supabase
        .from("user_data")
        .upsert({ user_id: user.id, key, value, updated_at: new Date().toISOString() });
      if (err) {
        console.warn(`Rumbo: no se pudo guardar "${key}" en Supabase`, err);
      }
    }, 500);
  };

  return (
    <CloudDataContext.Provider value={{ cache, setKey, error }}>
      {children}
    </CloudDataContext.Provider>
  );
}

export function useCloudData() {
  const ctx = useContext(CloudDataContext);
  if (!ctx) throw new Error("useCloudData debe usarse dentro de <CloudDataProvider>");
  return ctx;
}
