// Capa de almacenamiento de Rumbo.
//
// Hoy mismo, todo se guarda en el navegador con localStorage. El día que
// quieras cuentas reales (Supabase, Firebase...), solo hay que cambiar las
// funciones de este archivo por llamadas a esa base de datos: el resto de
// la app llama siempre a getItem/setItem y no le importa de dónde vienen
// los datos.

const PREFIX = "rumbo:";

export function getItem(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Rumbo: no se pudo leer "${key}" de localStorage`, err);
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Rumbo: no se pudo guardar "${key}" en localStorage`, err);
  }
}

export function removeItem(key) {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch (err) {
    console.warn(`Rumbo: no se pudo borrar "${key}" de localStorage`, err);
  }
}

export function clearAll() {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch (err) {
    console.warn("Rumbo: no se pudo limpiar localStorage", err);
  }
}
