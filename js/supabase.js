// =============================================
// SUPABASE — Hebillas Gin&Jes
// =============================================

const SUPABASE_URL      = 'https://butpfjcrpvcbekdfblgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5Bm47Sv2fKQJ4aoa3zPtYg_Ge3C5o4V';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Supabase timeout (' + ms + 'ms)')), ms)
  );
  return Promise.race([promise, timeout]);
}

async function loadProductsFromSupabase() {
  try {
    console.log('[Supabase] Iniciando carga de productos...');
    const query = supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('destacado', { ascending: false })
      .order('created_at',  { ascending: false });

    const { data, error } = await withTimeout(query, 10000);

    if (error) {
      console.error('[Supabase] Error al cargar productos:', error.message, error);
      return null;
    }

    if (!data || data.length === 0) {
      console.warn('[Supabase] Query exitosa pero devolvió 0 productos. Verifica RLS y activo=true.');
      return null;
    }

    console.log('[Supabase] ' + data.length + ' productos cargados correctamente.');
    return data;
  } catch (e) {
    console.error('[Supabase] Excepción:', e.message);
    return null;
  }
}

function getImageUrl(imagePath) {
  if (!imagePath) return '';
  // Si ya es una URL completa, devolverla tal cual
  if (imagePath.startsWith('http')) return imagePath;
  // Codificar cada segmento del path por separado para preservar las barras /
  const encodedPath = imagePath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  const { data } = supabase.storage.from('productos').getPublicUrl(encodedPath);
  return data.publicUrl;
}
