// "Suscripciones" es una categoría de presupuesto, no un pago real. Cada
// servicio seleccionado se convierte en su propio pago previsto más abajo.
const CATEGORIAS_RECURRENTES = new Set(["hogar", "electricidad", "suministros", "telefonia"]);

function textoId(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "pago";
}

export function crearPagosPrevistos(categorias = [], servicios = []) {
  const suscripciones = servicios
    .filter((servicio) => servicio?.activo !== false && Number(servicio?.precio) > 0)
    .map((servicio) => ({
      id: `suscripcion-${textoId(servicio.id || servicio.nombre)}`,
      nombre: servicio.nombre || "Suscripción",
      importe: Number(servicio.precio),
      diaCobro: Math.min(31, Math.max(1, Number(servicio.diaCobro) || 1)),
      sigla: servicio.sigla || String(servicio.nombre || "S").slice(0, 2).toUpperCase(),
      categoria: "suscripciones",
      tipo: "suscripcion",
      fijo: true,
      activo: true,
      color: servicio.color || "#ef7d4f",
    }));

  const previstos = categorias
    .filter((categoria) => CATEGORIAS_RECURRENTES.has(categoria?.id) || categoria?.recurrente === true)
    .filter((categoria) => Number(categoria?.limite) > 0)
    .filter((categoria) => categoria.id !== "suscripciones")
    .map((categoria) => ({
      id: `previsto-${textoId(categoria.id || categoria.nombre)}`,
      nombre: categoria.nombre || "Gasto previsto",
      importe: Number(categoria.limite),
      diaCobro: 1,
      categoria: categoria.id,
      tipo: "previsto",
      fijo: false,
      activo: true,
      color: categoria.color || "#5771e5",
    }));

  return [...suscripciones, ...previstos].sort((a, b) => {
    if (a.tipo === "suscripcion" && b.tipo !== "suscripcion") return -1;
    if (a.tipo !== "suscripcion" && b.tipo === "suscripcion") return 1;
    return Number(a.diaCobro || 99) - Number(b.diaCobro || 99);
  });
}

export function normalizarPagosPrevistos(pagos, categorias = [], servicios = []) {
  if (!Array.isArray(pagos)) return crearPagosPrevistos(categorias, servicios);

  // Desde la versión 9 los pagos guardados son la fuente de verdad. De esta
  // forma, quitar el alquiler o cancelar una suscripción no hace que reaparezcan
  // al volver a abrir Rumbo solo porque su categoría de presupuesto continúe.
  return pagos
    .filter((pago) => pago && pago.nombre !== "Suscripciones" && Number(pago.importe) > 0)
    .map((pago, index) => ({
      ...pago,
      id: String(pago.id || `previsto-guardado-${index}`),
      nombre: String(pago.nombre || "Gasto previsto").trim(),
      importe: Number(pago.importe),
      diaCobro: Math.min(31, Math.max(1, Number(pago.diaCobro) || 1)),
      categoria: pago.categoria || "imprevistos",
      tipo: pago.tipo === "suscripcion" ? "suscripcion" : "previsto",
      fijo: pago.fijo === true,
      activo: pago.activo !== false,
      color: pago.color || "#5771e5",
    }))
    .sort((a, b) => Number(a.diaCobro) - Number(b.diaCobro) || a.nombre.localeCompare(b.nombre));
}

export function migrarPagosPrevistos(pagos, categorias = [], servicios = []) {
  const guardados = normalizarPagosPrevistos(Array.isArray(pagos) ? pagos : [], categorias, servicios);
  const porId = new Map(guardados.map((pago) => [pago.id, pago]));

  crearPagosPrevistos(categorias, servicios).forEach((generado) => {
    if (!porId.has(generado.id)) porId.set(generado.id, generado);
  });

  return normalizarPagosPrevistos([...porId.values()], categorias, servicios);
}

export function actualizarPagoPrevisto(pagos = [], id, cambios = {}) {
  return pagos.map((pago) => pago.id === id ? { ...pago, ...cambios, id: pago.id } : pago);
}

export function eliminarPagoPrevisto(pagos = [], id) {
  return pagos.filter((pago) => pago.id !== id);
}

export function buscarMovimientoDePago(pago, movimientos = [], periodo) {
  const vinculado = movimientos.find((movimiento) =>
    movimiento.recurrenteId === pago.id && String(movimiento.fechaISO || "").startsWith(`${periodo}-`)
  );
  if (vinculado) return vinculado;

  const nombre = String(pago.nombre || "").trim().toLocaleLowerCase();
  return movimientos.find((movimiento) =>
    String(movimiento.fechaISO || "").startsWith(`${periodo}-`) &&
    String(movimiento.nombre || "").trim().toLocaleLowerCase() === nombre &&
    movimiento.categoria === pago.categoria &&
    Math.abs(Number(movimiento.importe || 0) - Number(pago.importe || 0)) < 0.005
  );
}
