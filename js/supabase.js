// Configuración pública del cliente Supabase.
// Usa únicamente la URL del proyecto y la clave anon/public.
const SUPABASE_URL = 'https://xqvdcqfslwhbwsxmnqmr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5Bm47Sv2fKQJ4aoa3zPtYg_Ge3C5o4V';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabaseClient;
