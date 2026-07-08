import { useState, useEffect, useRef } from "react";
import { getItem, setItem } from "./storage";

// Como useState, pero se guarda solo en localStorage (a través de storage.js)
// cada vez que cambia, y se recupera al abrir la página de nuevo.
export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => getItem(key, initialValue));
  const primerRender = useRef(true);

  useEffect(() => {
    // Evita escribir de vuelta el mismo valor que acabamos de leer al montar.
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    setItem(key, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return [value, setValue];
}
