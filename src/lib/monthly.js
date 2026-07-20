export function fechaLocalISO(fecha = new Date()) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function periodoActual() {
  return fechaLocalISO().slice(0, 7);
}

export function periodoDeFecha(fechaISO) {
  return /^\d{4}-\d{2}-\d{2}$/.test(fechaISO || "") ? fechaISO.slice(0, 7) : periodoActual();
}

export function desplazarPeriodo(periodo, cantidad) {
  const [year, month] = periodo.split("-").map(Number);
  const fecha = new Date(year, month - 1 + cantidad, 1);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

export function fechaEnPeriodo(periodo, dia) {
  const [year, month] = periodo.split("-").map(Number);
  const ultimoDia = new Date(year, month, 0).getDate();
  return `${periodo}-${String(Math.min(Math.max(1, dia), ultimoDia)).padStart(2, "0")}`;
}

export function normalizarFechaMovimiento(movimiento) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(movimiento?.fechaISO || "")) return movimiento.fechaISO;
  if (typeof movimiento?.id === "number" && movimiento.id > 1000000000000) {
    const fechaId = new Date(movimiento.id);
    if (!Number.isNaN(fechaId.getTime())) return fechaLocalISO(fechaId);
  }
  return fechaLocalISO();
}

export function formatearFecha(fechaISO, language = "es", options = {}) {
  const fecha = new Date(`${fechaISO}T12:00:00`);
  if (Number.isNaN(fecha.getTime())) return fechaISO || "—";
  return new Intl.DateTimeFormat(language === "en" ? "en-GB" : "es-ES", {
    day: "numeric", month: options.corta ? "short" : "long", year: "numeric",
  }).format(fecha);
}

export function etiquetaPeriodo(periodo, language = "es") {
  const fecha = new Date(`${periodo}-01T12:00:00`);
  const texto = new Intl.DateTimeFormat(language === "en" ? "en-GB" : "es-ES", { month: "long", year: "numeric" }).format(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function crearCobrosDelPeriodo(frecuencia, ingresoPorPago, periodo, conDatosDemo = false) {
  const dias = frecuencia === "semanal" ? [7, 14, 21, 28] : frecuencia === "dos-mes" ? [15, new Date(Number(periodo.slice(0, 4)), Number(periodo.slice(5, 7)), 0).getDate()] : [25];
  return dias.map((dia, index) => ({
    id: `pago-${periodo}-${index + 1}`,
    label: frecuencia === "semanal" ? `Semana ${index + 1}` : frecuencia === "dos-mes" ? `Pago ${index + 1}` : frecuencia === "variable" ? "Ingreso estimado" : "Salario mensual",
    fechaISO: fechaEnPeriodo(periodo, dia),
    previsto: Number(ingresoPorPago || 0),
    real: conDatosDemo && index < Math.min(2, dias.length) ? Number(ingresoPorPago || 0) + (index + 1) * 20 : null,
    extra: false,
  }));
}
