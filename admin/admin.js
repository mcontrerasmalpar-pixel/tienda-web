const sb = window.supabaseClient;
const BUCKET = 'product-images';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
let products = [];

const $ = id => document.getElementById(id);
function showToast(message, type = 'success') { const el = $('toast'); el.textContent = message; el.className = `toast ${type} show`; setTimeout(() => el.classList.remove('show'), 3200); }
function setError(id, message) { $(id).textContent = message || ''; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function imageUrl(path) { return path ? (path.startsWith('http') ? path : sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl) : ''; }

function renderStats() {
  $('total-products').textContent = products.length;
  $('featured-products').textContent = products.filter(p => p.destacado).length;
  $('category-total').textContent = new Set(products.map(p => p.categoria).filter(Boolean)).size;
  const categories = [...new Set(products.map(p => p.categoria).filter(Boolean))].sort((a,b) => a.localeCompare(b));
  const current = $('category-filter').value;
  $('category-filter').innerHTML = '<option value="">Todas las categorías</option>' + categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  $('category-filter').value = categories.includes(current) ? current : '';
  $('category-options').innerHTML = categories.map(c => `<option value="${escapeHtml(c)}"></option>`).join('');
}

function filteredProducts() {
  const q = $('product-search').value.trim().toLowerCase();
  const category = $('category-filter').value;
  return products.filter(p => (!q || `${p.nombre} ${p.codigo || ''}`.toLowerCase().includes(q)) && (!category || p.categoria === category));
}
function renderProducts() {
  const list = filteredProducts();
  if (!list.length) { $('products-list').innerHTML = '<div class="empty">No hay productos que coincidan.</div>'; return; }
  $('products-list').innerHTML = list.map(p => `<article class="product-row"><div class="row-image">${imageUrl(p.imagen_url) ? `<img src="${imageUrl(p.imagen_url)}" alt="${escapeHtml(p.nombre)}" onerror="this.style.display='none'">` : '<span>Sin imagen</span>'}</div><div class="row-info"><div><span class="category">${escapeHtml(p.categoria || 'Sin categoría')}</span>${p.destacado ? '<span class="featured">Destacado</span>' : ''}</div><h3>${escapeHtml(p.nombre)}</h3><p>${escapeHtml(p.codigo || 'Sin código')}</p><strong>${Number(p.precio) > 0 ? `S/ ${Number(p.precio).toFixed(2)}` : 'Consultar precio'}</strong></div><div class="row-actions"><button class="ghost" data-edit="${p.id}">Editar</button><button class="danger" data-delete="${p.id}">Eliminar</button></div></article>`).join('');
  document.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openDialog(Number(btn.dataset.edit))));
  document.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => deleteProduct(Number(btn.dataset.delete))));
}

async function loadProducts() {
  const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  products = data || []; renderStats(); renderProducts();
}
function resetForm() { $('product-form').reset(); $('product-id').value = ''; $('dialog-title').textContent = 'Nuevo producto'; $('file-name').textContent = 'JPG, PNG o WEBP · máximo 5 MB'; $('image-preview').classList.add('hidden'); setError('form-error', ''); }
function openDialog(id = null) {
  resetForm();
  if (id) { const p = products.find(x => Number(x.id) === id); if (!p) return; $('dialog-title').textContent = 'Editar producto'; $('product-id').value = p.id; $('product-name').value = p.nombre || ''; $('product-code').value = p.codigo || ''; $('product-category').value = p.categoria || ''; $('product-price').value = Number(p.precio) || ''; $('product-description').value = p.descripcion || ''; $('product-featured').checked = Boolean(p.destacado); if (p.imagen_url) { $('preview-img').src = imageUrl(p.imagen_url); $('image-preview').classList.remove('hidden'); } }
  $('product-dialog').showModal();
}
async function uploadImage(file) {
  if (!file) return null;
  if (file.size > MAX_IMAGE_SIZE) throw new Error('La imagen no puede superar 5 MB.');
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Formato no permitido. Usa JPG, PNG o WEBP.');
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  const path = `${crypto.randomUUID()}-${safe}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}
async function saveProduct(e) {
  e.preventDefault(); setError('form-error', '');
  const id = $('product-id').value;
  const payload = { nombre: $('product-name').value.trim(), codigo: $('product-code').value.trim() || null, categoria: $('product-category').value.trim(), precio: Number($('product-price').value) || 0, descripcion: $('product-description').value.trim() || null, destacado: $('product-featured').checked };
  if (!payload.nombre || !payload.categoria) { setError('form-error', 'Completa nombre y categoría.'); return; }
  try {
    const file = $('product-image').files[0];
    if (file) payload.imagen_url = await uploadImage(file);
    const result = id ? await sb.from('products').update(payload).eq('id', id) : await sb.from('products').insert(payload);
    if (result.error) throw result.error;
    $('product-dialog').close(); await loadProducts(); showToast(id ? 'Producto actualizado.' : 'Producto creado.');
  } catch (error) { setError('form-error', error.message || 'No se pudo guardar el producto.'); }
}
async function deleteProduct(id) {
  const p = products.find(x => Number(x.id) === id); if (!p) return;
  if (!confirm(`¿Eliminar “${p.nombre}”? Esta acción no se puede deshacer.`)) return;
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) { showToast(error.message, 'error'); return; }
  await loadProducts(); showToast('Producto eliminado.');
}
async function init() {
  $('login-form').addEventListener('submit', async e => { e.preventDefault(); setError('login-error', ''); const { error } = await sb.auth.signInWithPassword({ email: $('login-email').value.trim(), password: $('login-password').value }); if (error) setError('login-error', 'Correo o contraseña incorrectos.'); });
  $('logout-btn').addEventListener('click', () => sb.auth.signOut());
  $('new-product-btn').addEventListener('click', () => openDialog());
  $('close-dialog').addEventListener('click', () => $('product-dialog').close()); $('cancel-dialog').addEventListener('click', () => $('product-dialog').close());
  $('product-form').addEventListener('submit', saveProduct); $('product-search').addEventListener('input', renderProducts); $('category-filter').addEventListener('change', renderProducts);
  $('product-image').addEventListener('change', e => { const file = e.target.files[0]; if (!file) return; $('file-name').textContent = file.name; $('preview-img').src = URL.createObjectURL(file); $('image-preview').classList.remove('hidden'); });
  sb.auth.onAuthStateChange(async (_event, session) => { $('auth-view').classList.toggle('hidden', Boolean(session)); $('dashboard-view').classList.toggle('hidden', !session); if (session) { $('admin-email').textContent = session.user.email; try { await loadProducts(); } catch (error) { showToast('No se pudo cargar el catálogo: ' + error.message, 'error'); } } });
  const { data } = await sb.auth.getSession(); if (data.session) { $('admin-email').textContent = data.session.user.email; $('auth-view').classList.add('hidden'); $('dashboard-view').classList.remove('hidden'); try { await loadProducts(); } catch (error) { showToast('No se pudo cargar el catálogo: ' + error.message, 'error'); } }
}
init();
