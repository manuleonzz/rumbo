export function crearGraficaBalance({ periodo, cobros = [], movimientos = [], width = 480, height = 100 }) {
  const [year, month] = String(periodo).split("-").map(Number);
  const ultimoDia = new Date(year, month, 0).getDate();
  const eventosPorFecha = new Map();
  const agregarEvento = (fechaISO, importe, tipo) => {
    const fecha = /^\d{4}-\d{2}-\d{2}$/.test(fechaISO || "") ? fechaISO : `${periodo}-01`;
    const clave = `${fecha}|${tipo}`;
    const actual = eventosPorFecha.get(clave) || { fecha, tipo, ingresos: 0, gastos: 0, delta: 0 };
    if (tipo === "ingreso") actual.ingresos += importe;
    else actual.gastos += importe;
    actual.delta += tipo === "ingreso" ? importe : -importe;
    eventosPorFecha.set(clave, actual);
  };

  cobros.forEach((cobro) => agregarEvento(
    cobro.fechaISO,
    Number(cobro.real === null ? cobro.previsto : cobro.real) || 0,
    "ingreso",
  ));
  movimientos.forEach((movimiento) => agregarEvento(
    movimiento.fechaISO,
    Number(movimiento.importe || 0),
    "gasto",
  ));

  let saldo = 0;
  const eventos = [...eventosPorFecha.values()]
    .filter((evento) => evento.ingresos || evento.gastos)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.tipo === "ingreso" ? -1 : 1))
    .map((evento) => ({ ...evento, saldo: (saldo += evento.delta) }));
  const saldos = [0, ...eventos.map((evento) => evento.saldo)];
  const minimo = Math.min(...saldos);
  const maximo = Math.max(...saldos);
  const margen = Math.max(1, (maximo - minimo) * 0.12);
  const inferior = minimo - margen;
  const superior = maximo + margen;
  const altoUtil = height - 24;
  const y = (valor) => height - 12 - ((valor - inferior) / (superior - inferior || 1)) * altoUtil;
  const puntosEvento = eventos.map((evento) => ({
    ...evento,
    x: ((Number(evento.fecha.slice(-2)) - 1) / Math.max(1, ultimoDia - 1)) * width,
    y: y(evento.saldo),
  }));
  const puntos = [{ x: 0, y: y(0), saldo: 0, delta: 0, inicial: true }, ...puntosEvento];
  if (puntos[puntos.length - 1].x < width) {
    const ultimo = puntos[puntos.length - 1];
    puntos.push({ ...ultimo, x: width, final: true, delta: 0 });
  }
  const segmentos = puntos.slice(1).map((punto, indice) => ({
    desde: puntos[indice],
    hasta: punto,
    tipo: punto.delta < 0 ? "gasto" : punto.delta > 0 ? "ingreso" : "estable",
    color: punto.delta < 0 ? "#e45c66" : punto.delta > 0 ? "#26a889" : "#5771e5",
  }));
  return {
    puntos,
    puntosEvento,
    segmentos,
    saldoFinal: eventos.at(-1)?.saldo || 0,
    area: `${puntos.map((punto, indice) => `${indice ? "L" : "M"}${punto.x.toFixed(1)},${punto.y.toFixed(1)}`).join(" ")} L${width},${height} L0,${height} Z`,
  };
}
