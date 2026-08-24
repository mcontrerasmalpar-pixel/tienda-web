// =============================================
// ADMIN — Hebillas Gin&Jes
// Supabase Auth + CRUD de productos + Storage
// =============================================

const SUPABASE_URL      = 'https://butpfjcrpvcbekdfblgf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5Bm47Sv2fKQJ4aoa3zPtYg_Ge3C5o4V';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BUCKET = 'productos';

let allRows = [], filteredRows = [];
let deleteTargetId = null, deleteTargetName = '';
let pendingImageFile = null, currentImageUrl = '';

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (session) showDashboard(session.user);
  else         showLogin();

  sb.auth.onAuthStateChange((_event, session) => {
    if (session) showDashboard(session.user);
    else         showLogin();
  });
});

function showLogin() {
  document.getElementById('login-view').classList.remove('hidden');
  document.getElementById('admin-view').classList.add('hidden');
}

async function showDashboard(user) {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('admin-view').classList.remove('hidden');
  document.getElementById('adm-email').textContent = user.email;
  await loadProducts();
}

// ── AUTH ──────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');
  btn.textContent = 'Ingresando...';
  btn.disabled = true;

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    errEl.textContent = error.message === 'Invalid login credentials'
      ? 'Correo o contraseña incorrectos.'
      : error.message;
    errEl.classList.remove('hidden');
  }
  btn.textContent = 'Ingresar';
  btn.disabled = false;
}

async function handleLogout() {
  await sb.auth.signOut();
}

// ── LOAD PRODUCTS ─────────────────────────────
async function loadProducts() {
  setLoading(true);
  const { data, error } = await sb
    .from('productos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    showToast('Error al cargar productos: ' + error.message, 'error');
    setLoading(false);
    return;
  }

  allRows = data || [];
  filteredRows = [...allRows];
  buildCatFilter();
  updateKPIs();
  renderTable();
  setLoading(false);
}

function setLoading(yes) {
  document.getElementById('adm-loading').classList.toggle('hidden', !yes);
  document.getElementById('adm-table').classList.toggle('hidden', yes);
}

function updateKPIs() {
  document.getElementById('kpi-total').textContent      = allRows.length;
  document.getElementById('kpi-activos').textContent    = allRows.filter(r => r.activo).length;
  document.getElementById('kpi-destacados').textContent = allRows.filter(r => r.destacado).length;
  const cats = new Set(allRows.map(r => r.categoria).filter(Boolean));
  document.getElementById('kpi-cats').textContent = cats.size;
}

function buildCatFilter() {
  const sel = document.getElementById('adm-cat-filter');
  const cats = [...new Set(allRows.map(r => r.categoria).filter(Boolean))].sort();
  const cur = sel.value;
  sel.innerHTML = '<option value="">Todas las categorías</option>' +
    cats.map(c => `<option value="${esc(c)}"${cur===c?' selected':''}>${esc(c)}</option>`).join('');

  // también actualizar el datalist del modal
  const dl = document.getElementById('cat-list');
  if (dl) dl.innerHTML = cats.map(c => `<option value="${esc(c)}">`).join('');
}

function adminSearch(q) {
  const cat = document.getElementById('adm-cat-filter').value;
  applyFilters(q, cat);
}

function adminFilter() {
  const q   = document.getElementById('adm-search').value;
  const cat = document.getElementById('adm-cat-filter').value;
  applyFilters(q, cat);
}

function applyFilters(q, cat) {
  let list = [...allRows];
  if (q)   list = list.filter(r =>
    (r.nombre||'').toLowerCase().includes(q.toLowerCase()) ||
    (r.codigo||'').toLowerCase().includes(q.toLowerCase())
  );
  if (cat) list = list.filter(r => r.categoria === cat);
  filteredRows = list;
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('adm-tbody');
  const empty = document.getElementById('adm-empty');

  if (!filteredRows.length) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    document.getElementById('adm-table').classList.add('hidden');
    return;
  }

  empty.classList.add('hidden');
  document.getElementById('adm-table').classList.remove('hidden');

  const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2244%22 height=%2244%22 viewBox=%220 0 44 44%22%3E%3Crect width=%2244%22 height=%2244%22 fill=%22%230d0d0d%22/%3E%3Ctext x=%2222%22 y=%2226%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2210%22 fill=%22%23C9A84C%22%3EG%26J%3C/text%3E%3C/svg%3E';

  tbody.innerHTML = filteredRows.map(r => {
    const imgUrl = getImageUrl(r.imagen_url) || PLACEHOLDER;
    const precio = r.precio ? 'S/ ' + parseFloat(r.precio).toFixed(2) : '<span style="color:var(--text-3)">—</span>';
    return `<tr>
      <td><img class="tbl-img" src="${imgUrl}" alt="${esc(r.nombre)}" loading="lazy" onerror="this.src='${PLACEHOLDER}'" /></td>
      <td>
        <div class="tbl-name">${esc(r.nombre)}</div>
        ${r.descripcion ? `<div style="font-size:.8rem;color:var(--text-3);margin-top:2px">${esc(r.descripcion.substring(0,60))}${r.descripcion.length>60?'…':''}</div>` : ''}
      </td>
      <td><span class="tbl-code">${esc(r.codigo||'—')}</span></td>
      <td><span class="tbl-cat">${esc(r.categoria||'—')}</span></td>
      <td class="tbl-price">${precio}</td>
      <td>
        ${r.activo
          ? '<span class="badge-activo">Activo</span>'
          : '<span class="badge-inactivo">Inactivo</span>'}
        ${r.destacado ? '<span style="margin-left:.25rem;font-size:.7rem;color:var(--gold)">★ Dest.</span>' : ''}
      </td>
      <td>
        <div class="tbl-actions">
          <button class="tbl-btn edit" onclick="openProductModal(${r.id})" aria-label="Editar ${esc(r.nombre)}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="tbl-btn del" onclick="openDeleteModal(${r.id},'${esc(r.nombre)}')" aria-label="Eliminar ${esc(r.nombre)}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── MODAL PRODUCTO ────────────────────────────
function openProductModal(id) {
  pendingImageFile = null;
  currentImageUrl  = '';

  const form  = document.getElementById('prod-form');
  form.reset();
  document.getElementById('img-upload-status').classList.add('hidden');
  setImgPreview(null);

  if (id) {
    const p = allRows.find(r => r.id === id);
    if (!p) return;
    document.getElementById('modal-prod-title').textContent = 'Editar producto';
    document.getElementById('prod-id').value       = p.id;
    document.getElementById('f-nombre').value      = p.nombre    || '';
    document.getElementById('f-codigo').value      = p.codigo    || '';
    document.getElementById('f-categoria').value   = p.categoria || '';
    document.getElementById('f-precio').value      = p.precio    || '';
    document.getElementById('f-stock').value       = p.stock     || '';
    document.getElementById('f-desc').value        = p.descripcion || '';
    document.getElementById('f-activo').checked    = !!p.activo;
    document.getElementById('f-destacado').checked = !!p.destacado;
    currentImageUrl = p.imagen_url || '';
    if (p.imagen_url) setImgPreview(getImageUrl(p.imagen_url));
  } else {
    document.getElementById('modal-prod-title').textContent = 'Nuevo producto';
    document.getElementById('prod-id').value = '';
    document.getElementById('f-activo').checked = true;
  }

  document.getElementById('form-error').classList.add('hidden');
  document.getElementById('prod-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  document.getElementById('prod-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

function previewImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showImgStatus('La imagen supera 5MB.', false);
    return;
  }
  pendingImageFile = file;
  const reader = new FileReader();
  reader.onload = ev => setImgPreview(ev.target.result);
  reader.readAsDataURL(file);
  showImgStatus('Imagen lista para subir.', true);
}

function setImgPreview(src) {
  const prev = document.getElementById('img-preview');
  if (src) {
    prev.innerHTML = `<img src="${src}" alt="Vista previa" />`;
  } else {
    prev.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      <span>Sin imagen</span>`;
  }
}

function showImgStatus(msg, ok) {
  const el = document.getElementById('img-upload-status');
  el.textContent = msg;
  el.className = 'img-status ' + (ok ? 'ok' : 'err');
  el.classList.remove('hidden');
}

async function handleSaveProduct(e) {
  e.preventDefault();
  const errEl  = document.getElementById('form-error');
  const saveBtn = document.getElementById('save-btn');
  errEl.classList.add('hidden');

  const nombre    = document.getElementById('f-nombre').value.trim();
  const categoria = document.getElementById('f-categoria').value.trim();

  if (!nombre)    { showFormError('El nombre es obligatorio.'); return; }
  if (!categoria) { showFormError('La categoría es obligatoria.'); return; }

  saveBtn.textContent = 'Guardando...';
  saveBtn.disabled    = true;

  // Subir imagen si hay una nueva
  let imagen_url = currentImageUrl;
  if (pendingImageFile) {
    const ext  = pendingImageFile.name.split('.').pop();
    const path = 'uploads/' + Date.now() + '.' + ext;
    const { error: upErr } = await sb.storage.from(BUCKET)
      .upload(path, pendingImageFile, { upsert: true });
    if (upErr) {
      showFormError('Error al subir imagen: ' + upErr.message);
      saveBtn.textContent = 'Guardar producto';
      saveBtn.disabled = false;
      return;
    }
    imagen_url = path;
  }

  const payload = {
    nombre,
    codigo:      document.getElementById('f-codigo').value.trim()    || null,
    categoria,
    precio:      parseFloat(document.getElementById('f-precio').value) || 0,
    stock:       parseInt(document.getElementById('f-stock').value)   || 0,
    descripcion: document.getElementById('f-desc').value.trim()       || null,
    activo:      document.getElementById('f-activo').checked,
    destacado:   document.getElementById('f-destacado').checked,
    imagen_url:  imagen_url || null,
  };

  const id = document.getElementById('prod-id').value;
  let error;

  if (id) {
    ({ error } = await sb.from('productos').update(payload).eq('id', id));
  } else {
    ({ error } = await sb.from('productos').insert(payload));
  }

  if (error) {
    showFormError('Error al guardar: ' + error.message);
  } else {
    showToast(id ? 'Producto actualizado.' : 'Producto creado.', 'success');
    closeProductModal();
    await loadProducts();
  }

  saveBtn.textContent = 'Guardar producto';
  saveBtn.disabled = false;
}

function showFormError(msg) {
  const el = document.getElementById('form-error');
  el.textContent = msg;
  el.classList.remove('hidden');
  document.getElementById('save-btn').textContent = 'Guardar producto';
  document.getElementById('save-btn').disabled = false;
}

// ── DELETE ────────────────────────────────────
function openDeleteModal(id, name) {
  deleteTargetId   = id;
  deleteTargetName = name;
  document.getElementById('del-name').textContent = name;
  document.getElementById('del-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  document.getElementById('del-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  const { error } = await sb.from('productos').delete().eq('id', deleteTargetId);
  if (error) {
    showToast('Error al eliminar: ' + error.message, 'error');
  } else {
    showToast('Producto eliminado.', 'success');
    closeDeleteModal();
    await loadProducts();
  }
}

// ── HELPERS ───────────────────────────────────
function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const encoded = imagePath.split('/').map(s => encodeURIComponent(s)).join('/');
  return SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/' + encoded;
}

let toastTimer;
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = ''; }, 3500);
}
