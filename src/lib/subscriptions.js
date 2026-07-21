export const SERVICIOS_CATALOGO = [
  { id: "netflix", nombre: "Netflix", precio: 13.99, sigla: "N", color: "#e50914", tipo: "video" },
  { id: "spotify", nombre: "Spotify", precio: 11.99, sigla: "S", color: "#1db954", tipo: "musica" },
  { id: "prime", nombre: "Amazon Prime", precio: 4.99, sigla: "P", color: "#159bd7", tipo: "video" },
  { id: "youtube", nombre: "YouTube Premium", precio: 13.99, sigla: "Y", color: "#ff0033", tipo: "video" },
  { id: "chatgpt", nombre: "ChatGPT", precio: 22.99, sigla: "AI", color: "#10a37f", tipo: "software" },
  { id: "gimnasio", nombre: "Gimnasio", precio: 29.99, sigla: "G", color: "#6f7a86", tipo: "bienestar" },
  { id: "icloud", nombre: "iCloud+", precio: 2.99, sigla: "iC", color: "#5b9df1", tipo: "software" },
  { id: "disney", nombre: "Disney+", precio: 10.99, sigla: "D+", color: "#173cc4", tipo: "video" },
  { id: "hbomax", nombre: "HBO Max", precio: 9.99, sigla: "H", color: "#5b2dd8", tipo: "video" },
  { id: "appletv", nombre: "Apple TV+", precio: 9.99, sigla: "TV", color: "#20242a", tipo: "video" },
  { id: "applemusic", nombre: "Apple Music", precio: 10.99, sigla: "AM", color: "#fa5060", tipo: "musica" },
  { id: "amazonmusic", nombre: "Amazon Music", precio: 10.99, sigla: "aM", color: "#13a9dd", tipo: "musica" },
  { id: "crunchyroll", nombre: "Crunchyroll", precio: 6.99, sigla: "C", color: "#f47521", tipo: "video" },
  { id: "playstation", nombre: "PlayStation Plus", precio: 8.99, sigla: "PS", color: "#1f59c4", tipo: "gaming" },
  { id: "xbox", nombre: "Xbox Game Pass", precio: 14.99, sigla: "X", color: "#107c10", tipo: "gaming" },
  { id: "nintendo", nombre: "Nintendo Switch Online", precio: 3.99, sigla: "NS", color: "#e60012", tipo: "gaming" },
  { id: "twitch", nombre: "Twitch", precio: 4.99, sigla: "T", color: "#9146ff", tipo: "video" },
  { id: "googleone", nombre: "Google One", precio: 2.99, sigla: "1", color: "#4285f4", tipo: "software" },
  { id: "microsoft", nombre: "Microsoft 365", precio: 9.99, sigla: "M", color: "#f25022", tipo: "software" },
  { id: "adobe", nombre: "Adobe Creative Cloud", precio: 29.99, sigla: "A", color: "#ed2224", tipo: "software" },
  { id: "audible", nombre: "Audible", precio: 9.99, sigla: "Au", color: "#f7991c", tipo: "musica" },
];

function claveNombre(valor) {
  return String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function servicioValido(servicio) {
  return servicio && servicio.activo !== false && String(servicio.nombre || "").trim() && Number(servicio.precio) > 0;
}

export function recuperarServiciosGuardados({ servicios = [], pagosPrevistos = [], movimientos = [] } = {}) {
  const recuperados = new Map();
  const agregar = (servicio) => {
    if (!servicioValido(servicio)) return;
    const clave = claveNombre(servicio.nombre);
    if (!clave || clave === "suscripciones" || recuperados.has(clave)) return;
    const catalogo = SERVICIOS_CATALOGO.find((item) => claveNombre(item.nombre) === clave);
    recuperados.set(clave, {
      ...(catalogo || {}),
      ...servicio,
      id: servicio.id || catalogo?.id || `recuperada-${clave}`,
      nombre: String(servicio.nombre).trim(),
      precio: Number(servicio.precio),
      diaCobro: Math.min(31, Math.max(1, Number(servicio.diaCobro) || 1)),
      sigla: servicio.sigla || catalogo?.sigla || String(servicio.nombre).trim().slice(0, 2).toUpperCase(),
      color: servicio.color || catalogo?.color || "#ef7d4f",
      tipo: servicio.tipo || catalogo?.tipo || "personalizada",
      activo: true,
    });
  };

  servicios.forEach(agregar);
  pagosPrevistos
    .filter((pago) => pago?.tipo === "suscripcion" || pago?.categoria === "suscripciones")
    .forEach((pago) => agregar({
      id: String(pago.id || "").replace(/^suscripcion-/, ""),
      nombre: pago.nombre,
      precio: pago.importe,
      diaCobro: pago.diaCobro,
      sigla: pago.sigla,
      color: pago.color,
      tipo: "personalizada",
      activo: pago.activo,
    }));

  [...movimientos]
    .filter((movimiento) => movimiento?.categoria === "suscripciones" && Number(movimiento?.importe) > 0)
    .sort((a, b) => String(b.fechaISO || "").localeCompare(String(a.fechaISO || "")))
    .forEach((movimiento) => agregar({
      id: `movimiento-${claveNombre(movimiento.nombre)}`,
      nombre: movimiento.nombre,
      precio: movimiento.importe,
      diaCobro: Number(String(movimiento.fechaISO || "").slice(-2)) || 1,
      activo: true,
    }));

  return [...recuperados.values()];
}
