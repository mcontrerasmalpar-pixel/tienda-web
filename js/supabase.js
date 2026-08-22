// =============================================
// SUPABASE — Hebillas Gin&Jes
// Proyecto: ginjes
// =============================================

const SUPABASE_URL     = 'https://butpfjcrpvcbekdfblgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5Bm47Sv2fKQJ4aoa3zPtYg_Ge3C5o4V';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cargar productos desde Supabase
async function loadProductsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error Supabase:', error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.warn('Supabase no disponible:', e.message);
    return null;
  }
}

// Obtener URL pública de imagen desde Supabase Storage (bucket: productos)
function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const { data } = supabase.storage.from('productos').getPublicUrl(imagePath);
  return data.publicUrl;
}
