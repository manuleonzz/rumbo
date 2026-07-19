import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Rumbo: faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. " +
      "Revisa tu archivo .env.local (en local) o los secrets del repo (en GitHub Actions)."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://example.supabase.co",
  supabaseKey || "public-anon-key-not-configured"
);
