export function actualizarMovimiento(movimientos = [], id, cambios = {}) {
  return movimientos.map((movimiento) => movimiento.id === id
    ? { ...movimiento, ...cambios, id: movimiento.id }
    : movimiento);
}
