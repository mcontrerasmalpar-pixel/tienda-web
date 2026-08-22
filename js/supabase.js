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
      console.warn('[Supabase] Query exitosa pero devolvio 0 productos. Verifica RLS y activo=true.');
      return null;
    }

    console.log('[Supabase] ' + data.length + ' productos cargados correctamente.');

    // Mostrar primeras 3 URLs para debug de imágenes
    console.group('[Supabase] Debug imagen_url (primeros 3)');
    data.slice(0, 3).forEach(p => {
      const url = getImageUrl(p.imagen_url);
      console.log(p.nombre + '\n  BD: ' + p.imagen_url + '\n  URL: ' + url);
    });
    console.groupEnd();

    return data;
  } catch (e) {
    console.error('[Supabase] Excepcion:', e.message);
    return null;
  }
}

function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const { data } = supabase.storage.from('productos').getPublicUrl(imagePath);
  return data.publicUrl;
}
