export const CATEGORIAS_RECOMENDADAS = [
  { id: "mascotas", nombre: "Mascotas", limite: 0, color: "#8b65d9" },
  { id: "educacion", nombre: "Educación y formación", limite: 0, color: "#3d8bbf" },
  { id: "viajes", nombre: "Viajes", limite: 0, color: "#2aa58a" },
  { id: "regalos", nombre: "Regalos y donaciones", limite: 0, color: "#e56d7a" },
  { id: "familia", nombre: "Familia y cuidado", limite: 0, color: "#d99556" },
  { id: "seguros", nombre: "Seguros e impuestos", limite: 0, color: "#6879c9" },
  { id: "mantenimiento", nombre: "Mantenimiento del hogar", limite: 0, color: "#9a7658" },
  { id: "cuidado_personal", nombre: "Cuidado personal", limite: 0, color: "#cf6fa4" },
  { id: "trabajo", nombre: "Gastos de trabajo", limite: 0, color: "#60758a" },
  { id: "imprevistos", nombre: "Otros e imprevistos", limite: 0, color: "#7a8796" },
];

export function migrarCategoriasRecomendadas(categorias = []) {
  const migradas = (Array.isArray(categorias) ? categorias : []).map((categoria) => categoria.id === "ropa"
    ? { ...categoria, nombre: "Ropa" }
    : { ...categoria });
  const idsExistentes = new Set(migradas.map((categoria) => categoria.id));
  CATEGORIAS_RECOMENDADAS.forEach((categoria) => {
    if (!idsExistentes.has(categoria.id)) migradas.push({ ...categoria, usado: 0 });
  });
  return migradas;
}
