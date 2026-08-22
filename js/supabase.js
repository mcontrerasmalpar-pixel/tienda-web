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
      console.error('[Supabase] Error:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.warn('[Supabase] 0 productos. Verifica RLS y activo=true.');
      return null;
    }

    console.log('[Supabase] ' + data.length + ' productos cargados.');
    // Debug: mostrar primera imagen
    if (data[0]) console.log('[IMG debug]', getImageUrl(data[0].imagen_url));
    return data;
  } catch (e) {
    console.error('[Supabase] Excepción:', e.message);
    return null;
  }
}

// Construye la URL pública del Storage directamente (sin SDK)
// para evitar problemas de encoding con espacios en nombres de archivo
function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  // Codificar cada segmento separadamente preservando las barras
  const encoded = imagePath.split('/').map(s => encodeURIComponent(s)).join('/');
  return SUPABASE_URL + '/storage/v1/object/public/productos/' + encoded;
}
