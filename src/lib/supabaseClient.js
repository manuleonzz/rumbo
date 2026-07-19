import { createClient } from "@supabase/supabase-js";

// Son credenciales públicas de cliente. Los secrets/variables del entorno
// tienen prioridad, pero estos valores permiten que GitHub Pages siga
// conectado aunque el workflow no reciba las variables durante el build.
const publicSupabaseUrl = "https://qewveqagryogznwyifri.supabase.co";
const publicSupabaseKey = "sb_publishable_k08qCc_GmPA-fmd0CkCAPA_OAvTfzwZ";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || publicSupabaseUrl;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || publicSupabaseKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
