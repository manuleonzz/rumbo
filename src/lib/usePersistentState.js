import { useState, useEffect, useRef } from "react";
import { useCloudData } from "./CloudDataContext";

// Funciona igual que useState para el resto de la app (mismo nombre, misma
// firma), pero por dentro lee y guarda en Supabase a través de CloudDataContext,
// para que los datos te sigan entre dispositivos una vez inicias sesión.
//
// Importante: esto solo debe usarse dentro de <CloudDataProvider>, que ya
// se encarga de haber cargado todos los datos del usuario antes de mostrar
// la app (por eso "cache" ya tiene el valor real la primera vez que se lee).
export function usePersistentState(key, initialValue) {
  const { cache, setKey } = useCloudData();
  const [value, setValue] = useState(() =>
    cache && key in cache ? cache[key] : initialValue
  );
  const primerRender = useRef(true);

  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    setKey(key, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return [value, setValue];
}
