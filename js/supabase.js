// =============================================
// CONFIGURACIÓN DE SUPABASE — Gin&Jes
// =============================================
// 1. Ve a https://supabase.com y crea un proyecto gratuito
// 2. En Settings > API copia tu URL y anon key
// 3. Reemplaza los valores de abajo

const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';   // 👈 reemplazar
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';             // 👈 reemplazar

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cargar productos desde Supabase
async function loadProductsFromSupabase() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase no configurado, usando productos de ejemplo:', error.message);
    return null; // fallback a productos locales
  }
  return data;
}

// Obtener URL pública de imagen desde Supabase Storage
function getImageUrl(imagePath) {
  if (!imagePath) return 'https://via.placeholder.com/400x400/111/D97706?text=Gin%26Jes';
  if (imagePath.startsWith('http')) return imagePath; // URL externa
  const { data } = supabase.storage.from('productos').getPublicUrl(imagePath);
  return data.publicUrl;
}
