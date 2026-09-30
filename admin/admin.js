const sb = window.supabaseClient;
const BUCKET = 'product-images', PAGE_SIZE = 25;
let products = [], categories = [], subcategories = [], page = 1, count = 0;
let selected = new Set(), loadVersion = 0, authVersion = 0, csvVersion = 0, searchTimer, csvRows = null, saving = false, importing = false;
const $ = id => document.getElementById(id);
const escapeHtml = Catalog.escapeHtml;
const imageUrl = path => Catalog.imageUrl(sb, path);
function showToast(message, type = 'success') { const el = $('toast'); el.textContent = message; el.className = `toast ${type} show`; setTimeout(() => el.classList.remove('show'), 6000); }
function setError(id, message) { $(id).textContent = message || ''; }
function options(items, label) { return `<option value="">${label}</option>` + items.map(c => `<option value="${c.id}">${escapeHtml(c.nombre)}</option>`).join(''); }
function fillSubcategories(categoryId, selectId, label = 'Sin subcategoría') {
  const select = $(selectId), previous = select.value;
  select.innerHTML = options(subcategories.filter(s => String(s.category_id) === String(categoryId)), label);
  if ([...select.options].some(o => o.value === previous)) select.value = previous;
}
async function loadTaxonomy() {
  ({categories, subcategories} = await Catalog.taxonomy(sb));
  for (const id of ['category-filter','product-category','bulk-category']) {
    const previous = $(id).value;
    $(id).innerHTML = options(categories, id === 'category-filter' ? 'Todas las categorías' : 'Selecciona categoría');
    $(id).value = previous;
  }
  fillSubcategories($('category-filter').value, 'sub-filter', 'Todas las subcategorías');
  fillSubcategories($('product-category').value, 'product-subcategory');
  fillSubcategories($('bulk-category').value, 'bulk-subcategory');
  $('category-total').textContent = categories.length;
}
async function loadStats() {
  const [total, featured] = await Promise.all([sb.from('products').select('id', {head: true, count: 'exact'}), sb.from('products').select('id', {head: true, count: 'exact'}).eq('destacado', true)]);
  if (total.error || featured.error) throw total.error || featured.error;
  $('total-products').textContent = total.count; $('featured-products').textContent = featured.count;
}
function updateSelection() {
  $('selected-count').textContent = `${selected.size} seleccionados (página actual)`;
  $('select-page').checked = products.length > 0 && selected.size === products.length;
  $('select-page').indeterminate = selected.size > 0 && selected.size < products.length;
}
function renderProducts() {
  $('products-list').innerHTML = products.length ? products.map(p => `<article class="product-row"><input class="row-select" type="checkbox" data-select="${p.id}" aria-label="Seleccionar ${escapeHtml(p.nombre)}"><div class="row-image">${imageUrl(p.imagen_url) ? `<img src="${escapeHtml(imageUrl(p.imagen_url))}" alt="${escapeHtml(p.nombre)}" onerror="this.style.display='none'">` : '<span>Sin imagen</span>'}</div><div class="row-info"><div><span class="category">${escapeHtml(p.categoria)}${p.subcategory_id ? ' / ' + escapeHtml(subcategories.find(s => s.id === p.subcategory_id)?.nombre || '') : ''}</span>${p.destacado ? '<span class="featured">Destacado</span>' : ''}<span class="featured">${p.activo ? 'Activo' : 'Inactivo'}</span></div><h3>${escapeHtml(p.nombre)}</h3><p>${escapeHtml(p.codigo)}</p><strong>${Number(p.precio) > 0 ? `S/ ${Number(p.precio).toFixed(2)}` : 'Consultar precio'}</strong></div><div class="row-actions"><button class="ghost" data-edit="${p.id}">Editar</button><button class="danger" data-delete="${p.id}">Eliminar</button></div></article>`).join('') : '<div class="empty">No hay productos que coincidan.</div>';
  document.querySelectorAll('[data-select]').forEach(el => el.onchange = () => { el.checked ? selected.add(Number(el.dataset.select)) : selected.delete(Number(el.dataset.select)); updateSelection(); });
  document.querySelectorAll('[data-edit]').forEach(el => el.onclick = () => openDialog(Number(el.dataset.edit)));
  document.querySelectorAll('[data-delete]').forEach(el => el.onclick = () => run(() => deleteProduct(Number(el.dataset.delete))));
  $('list-count').textContent = `${count} productos encontrados`;
  $('page-label').textContent = `Página ${page} de ${Math.max(1, Math.ceil(count / PAGE_SIZE))}`;
  $('previous-page').disabled = page <= 1; $('next-page').disabled = page * PAGE_SIZE >= count;
  updateSelection();
}
async function loadProducts() {
  const version = ++loadVersion;
  selected.clear(); updateSelection();
  $('products-list').setAttribute('aria-busy', 'true');
  try {
    const result = await Catalog.productQuery(sb, {page, size: PAGE_SIZE, search: $('product-search').value, category: $('category-filter').value, subcategory: $('sub-filter').value, active: $('active-filter').value, sort: 'name-asc'});
    if (version !== loadVersion) return;
    if (result.error) throw result.error;
    count = result.count || 0;
    if (page > 1 && (page - 1) * PAGE_SIZE >= count) { page = Math.max(1, Math.ceil(count / PAGE_SIZE)); return loadProducts(); }
    products = result.data || []; renderProducts();
  } catch (error) {
    if (version !== loadVersion) return;
    products = []; count = 0; renderProducts();
    $('products-list').innerHTML = '<div class="empty">No se pudo cargar. <button class="ghost" id="retry-list">Reintentar</button></div>';
    $('retry-list').onclick = () => run(loadProducts); throw error;
  } finally { if (version === loadVersion) $('products-list').setAttribute('aria-busy', 'false'); }
}
async function refresh() { await loadTaxonomy(); await Promise.all([loadStats(), loadProducts()]); }
async function run(action) { try { await action(); } catch (error) { showToast(error.message || 'No se pudo completar la operación.', 'error'); } }
function resetForm() {
  $('product-form').reset(); $('product-id').value = ''; $('dialog-title').textContent = 'Nuevo producto';
  $('file-name').textContent = 'JPG, PNG o WEBP · máximo 5 MB'; $('image-preview').classList.add('hidden'); setError('form-error', '');
  fillSubcategories('', 'product-subcategory');
}
function openDialog(id = null) {
  resetForm();
  if (id) {
    const p = products.find(x => Number(x.id) === id); if (!p) return;
    $('dialog-title').textContent = 'Editar producto'; $('product-id').value = p.id;
    $('product-name').value = p.nombre; $('product-code').value = p.codigo; $('product-category').value = p.category_id;
    fillSubcategories(p.category_id, 'product-subcategory'); $('product-subcategory').value = p.subcategory_id || '';
    $('product-price').value = p.precio; $('product-description').value = p.descripcion || '';
    $('product-featured').checked = p.destacado; $('product-active').checked = p.activo;
    if (p.imagen_url) { $('preview-img').src = imageUrl(p.imagen_url); $('image-preview').classList.remove('hidden'); }
  }
  $('product-dialog').showModal();
}
async function uploadImage(file) {
  if (file.size > 5 * 1024 * 1024) throw new Error('La imagen no puede superar 5 MB.');
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Usa JPG, PNG o WEBP.');
  const path = `${crypto.randomUUID()}-${file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')}`;
  const {error} = await sb.storage.from(BUCKET).upload(path, file, {upsert: false, contentType: file.type});
  if (error) throw error; return path;
}
async function saveProduct(event) {
  event.preventDefault(); if (saving) return;
  setError('form-error', '');
  const id = $('product-id').value;
  const payload = {nombre: $('product-name').value.trim(), codigo: $('product-code').value.trim().toUpperCase(), category_id: Number($('product-category').value), subcategory_id: Number($('product-subcategory').value) || null, precio: Number($('product-price').value), descripcion: $('product-description').value.trim(), destacado: $('product-featured').checked, activo: $('product-active').checked};
  if (!payload.nombre || !payload.category_id || !/^[A-Z0-9][A-Z0-9._/-]{0,63}$/.test(payload.codigo) || !Number.isFinite(payload.precio) || payload.precio < 0 || payload.precio > 99999999.99) { setError('form-error', 'Revisa nombre, código, categoría y precio.'); return; }
  saving = true; const button = $('product-form').querySelector('[type=submit]'); button.disabled = true;
  let uploaded = null;
  try {
    const file = $('product-image').files[0];
    if (file) { uploaded = await uploadImage(file); payload.imagen_url = uploaded; }
    const result = await (id ? sb.from('products').update(payload).eq('id', id) : sb.from('products').insert(payload)).select('id');
    if (result.error) throw result.error;
    if (!result.data.length) throw new Error('El producto ya no existe o no tienes permiso.');
    uploaded = null; $('product-dialog').close(); showToast('Producto guardado.'); await refresh(); invalidateCSV();
  } catch (error) {
    if (uploaded) { const cleanup = await sb.storage.from(BUCKET).remove([uploaded]); if (cleanup.error) showToast('La imagen quedó sin asociar. Revisa Storage: ' + uploaded, 'error'); }
    setError('form-error', error.code === '23505' ? 'El código ya existe. Usa otro código.' : error.message);
  } finally { saving = false; button.disabled = false; }
}
async function deleteProduct(id) {
  const p = products.find(x => Number(x.id) === id);
  if (!p || !confirm(`¿Eliminar “${p.nombre}”? También puedes desactivarlo para conservarlo.`)) return;
  const {data, error} = await sb.from('products').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data.length) throw new Error('El producto ya no existe o no tienes permiso.');
  showToast('Producto eliminado.'); invalidateCSV(); await refresh();
}
async function newCategory(subcategory = false) {
  const category = $('product-category').value;
  if (subcategory && !category) throw new Error('Selecciona una categoría primero.');
  const name = prompt(subcategory ? 'Nombre de la subcategoría:' : 'Nombre de la categoría:')?.trim();
  if (!name) return;
  if (name.length > 100) throw new Error('Máximo 100 caracteres.');
  const {data, error} = await sb.from(subcategory ? 'subcategories' : 'categories').insert(subcategory ? {nombre: name, category_id: Number(category)} : {nombre: name}).select('id').single();
  if (error) throw error;
  await loadTaxonomy();
  if (!subcategory) $('product-category').value = data.id;
  fillSubcategories($('product-category').value, 'product-subcategory');
  if (subcategory) $('product-subcategory').value = data.id;
}
async function bulkEdit() {
  if (!selected.size) throw new Error('Selecciona productos de esta página.');
  const action = $('bulk-action').value;
  let payload = {activate: {activo: true}, deactivate: {activo: false}, feature: {destacado: true}, unfeature: {destacado: false}}[action];
  if (action === 'category') {
    if (!$('bulk-category').value) throw new Error('Selecciona la categoría de destino.');
    payload = {category_id: Number($('bulk-category').value), subcategory_id: Number($('bulk-subcategory').value) || null};
  }
  if (!payload) throw new Error('Selecciona una acción.');
  if (!confirm(`¿Aplicar “${$('bulk-action').selectedOptions[0].textContent}” a ${selected.size} productos?`)) return;
  $('bulk-apply').disabled = true;
  try {
    const {data, error} = await sb.from('products').update(payload).in('id', [...selected]).select('id');
    if (error) throw error;
    showToast(`${data.length} productos actualizados.`); invalidateCSV(); await refresh();
  } finally { $('bulk-apply').disabled = false; }
}
function invalidateCSV() { ++csvVersion; csvRows = null; $('csv-import').disabled = true; $('csv-preview').replaceChildren(); }
async function validateImport() {
  invalidateCSV(); const version = csvVersion;
  const file = $('csv-file').files[0];
  if (!file) throw new Error('Selecciona un archivo CSV.');
  if (file.size > 5 * 1024 * 1024) throw new Error('El CSV supera 5 MB.');
  const result = Catalog.validateCSV(await file.text());
  if (version !== csvVersion) return;
  let existing = 0;
  if (!result.errors.length) {
    for (let i = 0; i < result.rows.length; i += 100) {
      const {data, error} = await sb.from('products').select('codigo').in('codigo', result.rows.slice(i, i+100).map(r => r.codigo));
      if (error) throw error;
      existing += data.length;
      if ($('csv-mode').value === 'insert' && data.length) result.errors.push('Ya existen estos códigos: ' + data.map(p => p.codigo).join(', '));
    }
  }
  if (version !== csvVersion) return;
  if (result.errors.length) {
    $('csv-preview').innerHTML = `<p class="error">${result.errors.length} errores. Corrige el archivo antes de importar.</p><pre>${escapeHtml(result.errors.join('\n'))}</pre>`; return;
  }
  csvRows = result.rows;
  $('csv-preview').innerHTML = `<p>${result.total} productos válidos: ${result.total-existing} nuevos, ${existing} para reemplazar. Vista previa de los primeros 10:</p><div class="table-scroll"><table><thead><tr><th>Código</th><th>Nombre</th><th>Categoría / subcategoría</th><th>Precio</th><th>Activo</th></tr></thead><tbody>${result.rows.slice(0,10).map(r => `<tr><td>${escapeHtml(r.codigo)}</td><td>${escapeHtml(r.nombre)}</td><td>${escapeHtml(r.categoria)} / ${escapeHtml(r.subcategoria)}</td><td>${r.precio.toFixed(2)}</td><td>${r.activo ? 'Sí' : 'No'}</td></tr>`).join('')}</tbody></table></div>`;
  $('csv-import').disabled = false;
}
async function importCSV() {
  if (!csvRows || importing) return;
  if (!confirm(`¿Importar ${csvRows.length} productos? Modo: ${$('csv-mode').selectedOptions[0].textContent}.`)) return;
  importing = true;
  ['csv-import','csv-file','csv-mode','csv-validate'].forEach(id => $(id).disabled = true);
  try {
    const {data, error} = await sb.rpc('import_catalog', {rows: csvRows, mode: $('csv-mode').value});
    if (error) throw error;
    invalidateCSV(); $('csv-file').value = ''; $('csv-preview').textContent = `${data} productos importados correctamente.`;
    showToast(`${data} productos importados.`); page = 1; await refresh();
  } catch (error) { $('csv-preview').textContent = 'No se pudo confirmar la importación. Revisa el catálogo antes de reintentar. ' + error.message; }
  finally { importing = false; ['csv-file','csv-mode','csv-validate'].forEach(id => $(id).disabled = false); $('csv-import').disabled = !csvRows; }
}
async function handleSession(session) {
  const version = ++authVersion; ++loadVersion;
  $('dashboard-view').classList.add('hidden'); $('auth-view').classList.remove('hidden');
  products = []; selected.clear(); invalidateCSV(); $('product-dialog').close();
  if (!session) return;
  const {data, error} = await sb.rpc('is_catalog_admin');
  if (version !== authVersion) return;
  if (error || !data) { setError('login-error', error ? 'No se pudo verificar el permiso. Comprueba la migración y vuelve a iniciar sesión.' : 'Tu cuenta no tiene permiso de administrador.'); await sb.auth.signOut(); return; }
  setError('login-error', ''); $('admin-email').textContent = session.user.email;
  $('auth-view').classList.add('hidden'); $('dashboard-view').classList.remove('hidden');
  await refresh();
}
function filterChanged() { page = 1; ++loadVersion; clearTimeout(searchTimer); searchTimer = setTimeout(() => run(loadProducts), 300); }
$('login-form').onsubmit = async event => { event.preventDefault(); setError('login-error', ''); const {error} = await sb.auth.signInWithPassword({email: $('login-email').value.trim(), password: $('login-password').value}); if (error) setError('login-error', 'Correo o contraseña incorrectos.'); };
$('logout-btn').onclick = () => run(async () => { const {error} = await sb.auth.signOut(); if (error) throw error; });
$('new-product-btn').onclick = () => openDialog();
['close-dialog','cancel-dialog'].forEach(id => $(id).onclick = () => $('product-dialog').close());
$('product-form').onsubmit = saveProduct;
$('product-search').oninput = filterChanged;
$('category-filter').onchange = () => { $('sub-filter').value = ''; fillSubcategories($('category-filter').value, 'sub-filter', 'Todas las subcategorías'); filterChanged(); };
$('sub-filter').onchange = filterChanged; $('active-filter').onchange = filterChanged;
$('product-category').onchange = () => { $('product-subcategory').value = ''; fillSubcategories($('product-category').value, 'product-subcategory'); };
$('bulk-category').onchange = () => { $('bulk-subcategory').value = ''; fillSubcategories($('bulk-category').value, 'bulk-subcategory'); };
$('new-category').onclick = () => run(() => newCategory()); $('new-subcategory').onclick = () => run(() => newCategory(true));
$('previous-page').onclick = () => { if (page > 1) { page--; run(loadProducts); } };
$('next-page').onclick = () => { if (page * PAGE_SIZE < count) { page++; run(loadProducts); } };
$('select-page').onchange = event => { selected = new Set(event.target.checked ? products.map(p => Number(p.id)) : []); document.querySelectorAll('[data-select]').forEach(el => el.checked = event.target.checked); updateSelection(); };
$('bulk-apply').onclick = () => run(bulkEdit);
$('csv-file').onchange = invalidateCSV; $('csv-mode').onchange = invalidateCSV;
$('csv-validate').onclick = () => run(validateImport); $('csv-import').onclick = () => run(importCSV);
let previewURL;
$('product-image').onchange = event => { if (previewURL) URL.revokeObjectURL(previewURL); const file = event.target.files[0]; if (!file) return; $('file-name').textContent = file.name; previewURL = URL.createObjectURL(file); $('preview-img').src = previewURL; $('image-preview').classList.remove('hidden'); };
// Defer Supabase calls outside the synchronous auth callback to avoid auth-lock deadlocks.
sb.auth.onAuthStateChange((event, session) => { if (['INITIAL_SESSION','SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event)) setTimeout(() => run(() => handleSession(session)), 0); });
