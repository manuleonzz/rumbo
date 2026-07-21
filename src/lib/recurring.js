const CATEGORIAS_RECURRENTES = new Set(["hogar", "electricidad", "suscripciones"]);

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
    .map((servicio, index) => ({
      id: `suscripcion-${textoId(servicio.id || servicio.nombre)}-${index}`,
      nombre: servicio.nombre || "Suscripción",
      importe: Number(servicio.precio),
      categoria: "suscripciones",
      tipo: "suscripcion",
      fijo: true,
      activo: true,
      color: servicio.color || "#ef7d4f",
    }));

  const tieneSuscripcionesIndividuales = suscripciones.length > 0;
  const previstos = categorias
    .filter((categoria) => CATEGORIAS_RECURRENTES.has(categoria?.id) || categoria?.recurrente === true)
    .filter((categoria) => Number(categoria?.limite) > 0)
    .filter((categoria) => !(categoria.id === "suscripciones" && tieneSuscripcionesIndividuales))
    .map((categoria) => ({
      id: `previsto-${textoId(categoria.id || categoria.nombre)}`,
      nombre: categoria.nombre || "Gasto previsto",
      importe: Number(categoria.limite),
      categoria: categoria.id,
      tipo: categoria.id === "suscripciones" ? "suscripcion" : "previsto",
      fijo: categoria.id === "suscripciones",
      activo: true,
      color: categoria.color || "#5771e5",
    }));

  return [...suscripciones, ...previstos];
}

export function normalizarPagosPrevistos(pagos, categorias = [], servicios = []) {
  if (!Array.isArray(pagos) || !pagos.length) return crearPagosPrevistos(categorias, servicios);
  return pagos
    .filter((pago) => pago && pago.activo !== false && Number(pago.importe) > 0)
    .map((pago, index) => ({
      ...pago,
      id: pago.id || `previsto-migrado-${index}`,
      importe: Number(pago.importe),
      categoria: pago.categoria || "hogar",
      tipo: pago.tipo || "previsto",
      fijo: pago.fijo ?? pago.tipo === "suscripcion",
      activo: true,
    }));
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
