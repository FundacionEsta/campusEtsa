import { createClient } from "@supabase/supabase-js";

// Usa tu URL y tu anon key de Supabase
const supabaseUrl = "https://TU-PROJECT-URL.supabase.co";
const supabaseAnonKey = "TU-ANON-KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
