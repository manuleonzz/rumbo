import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANTE: "base" tiene que coincidir con el nombre de tu repositorio
// en GitHub, entre barras. Si llamas al repo de otra forma, cambia esto.
// Ejemplo: si tu repo es https://github.com/tuusuario/rumbo, deja "/rumbo/".
export default defineConfig({
  plugins: [react()],
  base: "/rumbo/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@supabase") || id.includes("@realtime") || id.includes("ws")) return "supabase";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("react") || id.includes("scheduler")) return "react-vendor";
          return "vendor";
        },
      },
    },
  },
});
