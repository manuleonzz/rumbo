import test from "node:test";
import assert from "node:assert/strict";
import { crearGraficaBalance } from "../src/lib/balance.js";
import { CATEGORIAS_RECOMENDADAS, migrarCategoriasRecomendadas } from "../src/lib/categories.js";
import { actualizarMovimiento } from "../src/lib/movements.js";
import { actualizarPagoPrevisto, buscarMovimientoDePago, crearPagosPrevistos, eliminarPagoPrevisto, migrarPagosPrevistos, normalizarPagosPrevistos } from "../src/lib/recurring.js";
import { recuperarServiciosGuardados } from "../src/lib/subscriptions.js";

test("la gráfica sube con ingresos y baja en rojo con gastos", () => {
  const grafica = crearGraficaBalance({
    periodo: "2026-07",
    cobros: [{ fechaISO: "2026-07-05", previsto: 1000, real: null }],
    movimientos: [{ fechaISO: "2026-07-10", importe: 200 }],
  });
  assert.equal(grafica.saldoFinal, 800);
  assert.ok(grafica.segmentos.some((segmento) => segmento.tipo === "ingreso" && segmento.color === "#26a889"));
  assert.ok(grafica.segmentos.some((segmento) => segmento.tipo === "gasto" && segmento.color === "#e45c66"));
  const ingreso = grafica.puntosEvento.find((punto) => punto.ingresos > 0);
  const gasto = grafica.puntosEvento.find((punto) => punto.gastos > 0);
  assert.ok(gasto.y > ingreso.y, "el gasto debe bajar visualmente el saldo");
});

test("un ingreso y un gasto del mismo día conservan sus tramos verde y rojo", () => {
  const grafica = crearGraficaBalance({
    periodo: "2026-07",
    cobros: [{ fechaISO: "2026-07-21", previsto: 670, real: null }],
    movimientos: [{ fechaISO: "2026-07-21", importe: 160 }],
  });
  assert.deepEqual(grafica.segmentos.slice(0, 2).map((segmento) => segmento.tipo), ["ingreso", "gasto"]);
  assert.equal(grafica.saldoFinal, 510);
});

test("editar conserva el id y no duplica el movimiento", () => {
  const originales = [
    { id: 1, nombre: "Seguro médico", categoria: "hogar", importe: 160, recurrenteId: "previsto-seguro" },
    { id: 2, nombre: "Gasolina", categoria: "transporte", importe: 16 },
  ];
  const editados = actualizarMovimiento(originales, 1, { categoria: "salud", importe: 155 });
  assert.equal(editados.length, originales.length);
  assert.deepEqual(editados[0], { id: 1, nombre: "Seguro médico", categoria: "salud", importe: 155, recurrenteId: "previsto-seguro" });
  assert.deepEqual(editados[1], originales[1]);
});

test("la migración añade diez categorías con presupuesto cero sin tocar importes", () => {
  const actuales = [{ id: "hogar", nombre: "Hogar", limite: 617 }, { id: "ropa", nombre: "Ropa y cuidado", limite: 80 }];
  const migradas = migrarCategoriasRecomendadas(actuales);
  assert.equal(migradas.length, actuales.length + CATEGORIAS_RECOMENDADAS.length);
  assert.equal(migradas.find((categoria) => categoria.id === "hogar").limite, 617);
  assert.equal(migradas.find((categoria) => categoria.id === "ropa").nombre, "Ropa");
  CATEGORIAS_RECOMENDADAS.forEach((categoria) => {
    assert.equal(migradas.find((item) => item.id === categoria.id).limite, 0);
  });
  assert.equal(migrarCategoriasRecomendadas(migradas).length, migradas.length, "la migración debe ser idempotente");
});

test("los gastos previstos editados y eliminados siguen siendo la fuente de verdad", () => {
  const pagos = [{ id: "previsto-hogar", nombre: "Alquiler", importe: 1230, diaCobro: 1, categoria: "hogar", tipo: "previsto", fijo: true, activo: true }];
  const editados = actualizarPagoPrevisto(pagos, "previsto-hogar", { importe: 1250, diaCobro: 2 });
  assert.equal(editados[0].importe, 1250);
  assert.equal(editados[0].diaCobro, 2);
  assert.deepEqual(normalizarPagosPrevistos(eliminarPagoPrevisto(editados, "previsto-hogar"), [{ id: "hogar", nombre: "Hogar", limite: 1250 }]), [], "un pago eliminado no debe regenerarse desde el presupuesto");
});

test("la migración inicial recupera categorías recurrentes y suscripciones una sola vez", () => {
  const migrados = migrarPagosPrevistos([], [{ id: "hogar", nombre: "Hogar", limite: 617, color: "#5771e5" }], [{ id: "chatgpt", nombre: "ChatGPT", precio: 23, diaCobro: 12, activo: true }]);
  assert.deepEqual(migrados.map((pago) => pago.nombre), ["Hogar", "ChatGPT"]);
  assert.equal(migrarPagosPrevistos(migrados, [{ id: "hogar", nombre: "Hogar", limite: 617 }], [{ id: "chatgpt", nombre: "ChatGPT", precio: 23, diaCobro: 12 }]).length, 2);
});

test("las suscripciones elegidas en el cuestionario se convierten en checks independientes", () => {
  const pagos = crearPagosPrevistos([], [
    { id: "chatgpt", nombre: "ChatGPT", precio: 23, diaCobro: 12, activo: true },
    { id: "amazon-prime", nombre: "Amazon Prime", precio: 4.99, diaCobro: 18, activo: true },
    { id: "google-one", nombre: "Google One", precio: 2.99, diaCobro: 25, activo: true },
  ]);
  assert.deepEqual(pagos.map((pago) => pago.nombre), ["ChatGPT", "Amazon Prime", "Google One"]);
  assert.ok(pagos.every((pago) => pago.tipo === "suscripcion" && pago.categoria === "suscripciones" && pago.fijo));
});

test("marcar una suscripción encuentra el movimiento del mes sin duplicarlo en otro mes", () => {
  const [chatgpt] = crearPagosPrevistos([], [{ id: "chatgpt", nombre: "ChatGPT", precio: 23, diaCobro: 12, activo: true }]);
  const movimientos = [{ id: 7, recurrenteId: chatgpt.id, nombre: "ChatGPT", categoria: "suscripciones", importe: 23, fechaISO: "2026-07-12" }];
  assert.equal(buscarMovimientoDePago(chatgpt, movimientos, "2026-07")?.id, 7);
  assert.equal(buscarMovimientoDePago(chatgpt, movimientos, "2026-08"), undefined);
});

test("la migración recupera suscripciones exactas de datos y movimientos anteriores", () => {
  const recuperadas = recuperarServiciosGuardados({
    servicios: [{ id: "chatgpt", nombre: "ChatGPT", precio: 22.99, diaCobro: 4, activo: true }],
    pagosPrevistos: [{ id: "suscripcion-prime", nombre: "Amazon Prime", importe: 4.99, diaCobro: 8, categoria: "suscripciones", tipo: "suscripcion" }],
    movimientos: [{ nombre: "Google One", importe: 2.99, fechaISO: "2026-07-18", categoria: "suscripciones" }],
  });
  assert.deepEqual(recuperadas.map((servicio) => servicio.nombre), ["ChatGPT", "Amazon Prime", "Google One"]);
  assert.deepEqual(recuperadas.map((servicio) => servicio.diaCobro), [4, 8, 18]);
});
