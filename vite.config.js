import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANTE: "base" tiene que coincidir con el nombre de tu repositorio
// en GitHub, entre barras. Si llamas al repo de otra forma, cambia esto.
// Ejemplo: si tu repo es https://github.com/tuusuario/rumbo, deja "/rumbo/".
export default defineConfig({
  plugins: [react()],
  base: "/rumbo/",
});
