// =============================================
// SUPABASE — Hebillas Gin&Jes
// =============================================

const SUPABASE_URL      = 'https://butpfjcrpvcbekdfblgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5Bm47Sv2fKQJ4aoa3zPtYg_Ge3C5o4V';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Supabase timeout')), ms)
  );
  return Promise.race([promise, timeout]);
}

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

    // DEBUG: mostrar las URLs generadas para cada producto
    if (data && data.length) {
      console.group('=== DEBUG imagen_url ===')
      data.slice(0, 3).forEach(p => {
        const url = getImageUrl(p.imagen_url);
        console.log(p.nombre, '\n  imagen_url BD:', p.imagen_url, '\n  URL generada:', url);
      });
      console.groupEnd();
    } else {
      console.warn('Supabase devolvió 0 productos — verifica RLS y que activo=true');
    }

    return data;
  } catch (e) {
    console.warn('Supabase no disponible:', e.message);
    return null;
  }
}

function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const { data } = supabase.storage.from('productos').getPublicUrl(imagePath);
  return data.publicUrl;
}
