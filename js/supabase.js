// =============================================
// SUPABASE — Hebillas Gin&Jes
// Proyecto: ginjes
// =============================================

const SUPABASE_URL      = 'https://butpfjcrpvcbekdfblgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5Bm47Sv2fKQJ4aoa3zPtYg_Ge3C5o4V';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Timeout helper — rechaza la promesa después de `ms` milisegundos
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Supabase timeout')), ms)
  );
  return Promise.race([promise, timeout]);
}

// Cargar productos desde Supabase (máx. 4 s; si falla → fallback inmediato)
// Orden: destacados primero, luego por fecha de creación descendente
async function loadProductsFromSupabase() {
  try {
    const query = supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('destacado', { ascending: false })
      .order('created_at',  { ascending: false });

    const { data, error } = await withTimeout(query, 4000);

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
// Acepta ruta relativa (ej: 'hebillas/HCORC-00024.jpg') o URL externa
function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const { data } = supabase.storage.from('productos').getPublicUrl(imagePath);
  return data.publicUrl;
}
