const ITEMS_PER_PAGE = 12;
let allProducts = [], filteredProducts = [], currentPage = 1;
let currentView = 'grid', currentSort = 'default', currentSearch = '', currentCategory = null;

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22 viewBox=%220 0 400 400%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%230d0d0d%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2228%22 fill=%22%23C9A84C%22%3EGin%26Jes%3C/text%3E%3C/svg%3E';

// Fallback de datos cuando Supabase no responde
const fallbackProducts = [
  { id:1, nombre:'Argollas',           precio:0, imagen_url:'productos metales/argollas.jpg',      categoria:'Aplicaciones',              descripcion:'Argollas met\u00e1licas.',   codigo:'ARG-001', destacado:false },
  { id:2, nombre:'Aro Mosquet\u00f3n', precio:0, imagen_url:'productos metales/aro mosqueton.jpg', categoria:'Aplicaciones',              descripcion:'Aro mosquet\u00f3n.',        codigo:'ARO-001', destacado:false },
  { id:3, nombre:'Pegapega Americano', precio:0, imagen_url:'pegapega/americano/americano.jpg',     categoria:'Insumos Galv\u00e1nicos y Otros', descripcion:'Pegamento americano.', codigo:'PEG-AME', destacado:true  },
  { id:4, nombre:'Pegapega Grado B',   precio:0, imagen_url:'pegapega/gradob/gradob.jpg',           categoria:'Insumos Galv\u00e1nicos y Otros', descripcion:'Pegamento Grado B.',   codigo:'PEG-B',   destacado:false },
];

function formatPrecio(precio) {
  const n = parseFloat(precio);
  if (!n || n <= 0) return '<span style="font-size:var(--f-sm);color:var(--text-3);font-weight:500">Consultar precio</span>';
  return '<span class="pcard-price">S/ ' + n.toFixed(2) + '</span>';
}
function formatPrecioModal(precio) {
  const n = parseFloat(precio);
  return (!n || n <= 0) ? 'Consultar precio' : 'S/ ' + n.toFixed(2);
}

// Maneja errores de imagen via delegacion — sin onerror inline
function handleImgError(e) {
  if (e.target.src !== PLACEHOLDER) e.target.src = PLACEHOLDER;
}

async function initProducts() {
  document.getElementById('loading-state').style.display = 'block';
  document.getElementById('product-grid').classList.add('hidden');

  let data = null;
  try { data = await loadProductsFromSupabase(); } catch(e) { console.warn('Supabase:', e); }
  if (data && data.length) data = data.map(p => ({ ...p, id: Number(p.id), precio: parseFloat(p.precio)||0 }));

  allProducts     = (data && data.length) ? data : [...fallbackProducts];
  filteredProducts = [...allProducts];

  // Delegacion de error en imagenes — un solo listener en el grid
  document.getElementById('product-grid').addEventListener('error', handleImgError, true);

  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('product-grid').classList.remove('hidden');
  updateCounts();
  applyFilters();
}

function updateCounts() {
  const elAll = document.getElementById('count-all');
  if (elAll) elAll.textContent = '(' + allProducts.length + ')';
  document.querySelectorAll('.cat-btn[data-cat]').forEach(btn => {
    if (btn.dataset.cat === 'all') return;
    const el = btn.querySelector('span');
    if (!el) return;
    const n = allProducts.filter(p => p.categoria === btn.dataset.cat).length;
    el.textContent = n > 0 ? '(' + n + ')' : '';
  });
}

function filterProducts(cat) {
  currentCategory = cat; currentPage = 1; currentSearch = '';
  const si = document.getElementById('search-input');
  if (si) si.value = '';
  document.querySelectorAll('.cat-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.cat === (cat || 'all'))
  );
  applyFilters();
  document.getElementById('tienda').scrollIntoView({ behavior:'smooth' });
}

function searchProducts(q) { currentSearch = q.toLowerCase(); currentPage = 1; applyFilters(); }
function sortProducts(v)   { currentSort = v; applyFilters(); }
function filterByPrice()   { currentPage = 1; applyFilters(); }

function applyFilters() {
  let list = [...allProducts];
  if (currentCategory) list = list.filter(p => p.categoria === currentCategory);
  if (currentSearch)   list = list.filter(p =>
    (p.nombre||'').toLowerCase().includes(currentSearch) ||
    (p.codigo||'').toLowerCase().includes(currentSearch) ||
    (p.descripcion||'').toLowerCase().includes(currentSearch)
  );
  const mn = parseFloat(document.getElementById('price-min')?.value) || 0;
  const mx = parseFloat(document.getElementById('price-max')?.value) || Infinity;
  list = list.filter(p => (p.precio||0) >= mn && (p.precio||0) <= mx);
  if (currentSort === 'price-asc')  list.sort((a,b) => (a.precio||0)-(b.precio||0));
  if (currentSort === 'price-desc') list.sort((a,b) => (b.precio||0)-(a.precio||0));
  if (currentSort === 'name-asc')   list.sort((a,b) => a.nombre.localeCompare(b.nombre));
  filteredProducts = list;
  currentPage = 1;
  renderPage();
}

function renderPage() {
  const s = (currentPage-1)*ITEMS_PER_PAGE;
  const items = filteredProducts.slice(s, s+ITEMS_PER_PAGE);
  const total = filteredProducts.length;
  const el = document.getElementById('results-count');
  if (el) el.textContent =
    'Mostrando ' + Math.min(s+1,total) + '\u2013' + Math.min(s+ITEMS_PER_PAGE,total) +
    ' de ' + total + ' producto' + (total!==1?'s':'');
  renderCards(items);
  renderPagination(total);
}

function setView(v) {
  currentView = v;
  const grid = document.getElementById('product-grid');
  grid.classList.toggle('list-view', v==='list');
  document.getElementById('btn-grid').classList.toggle('active', v==='grid');
  document.getElementById('btn-list').classList.toggle('active', v==='list');
  renderPage();
}

function escAttr(s) {
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderCards(list) {
  const grid = document.getElementById('product-grid');
  if (!list.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:4rem 0;color:var(--text-3);font-size:.85rem;letter-spacing:.1em">No se encontraron productos. <button onclick="filterProducts(null)" style="color:var(--gold);text-decoration:underline;cursor:pointer;">Ver todos</button></div>';
    return;
  }
  grid.innerHTML = list.map((p, i) => {
    const img  = getImageUrl(p.imagen_url) || PLACEHOLDER;
    const badge = p.destacado ? '<div class="pcard-badge">Destacado</div>' : '';
    const nom  = escAttr(p.nombre);
    if (currentView === 'list') {
      return `<div class="pcard list" style="animation-delay:${i*.04}s" onclick="openModal(${p.id})">
        <div class="pcard-img"><img src="${img}" alt="${nom}" loading="lazy" width="100" height="100"></div>
        <div class="pcard-body">
          <p class="pcard-cat">${escAttr(p.categoria)}</p>
          <p class="pcard-code">${escAttr(p.codigo||'')}</p>
          <h4 class="pcard-name">${nom}</h4>
          <div class="pcard-foot">
            ${formatPrecio(p.precio)}
            <button class="pcard-add" onclick="event.stopPropagation();addToCart(${p.id})">+ Agregar</button>
          </div>
        </div>
      </div>`;
    }
    return `<div class="pcard" style="animation-delay:${i*.04}s" onclick="openModal(${p.id})">
      ${badge}
      <div class="pcard-img"><img src="${img}" alt="${nom}" loading="lazy" width="400" height="400"></div>
      <div class="pcard-body">
        <p class="pcard-cat">${escAttr(p.categoria)}</p>
        <p class="pcard-code">${escAttr(p.codigo||'')}</p>
        <h4 class="pcard-name">${nom}</h4>
        <div class="pcard-foot">
          ${formatPrecio(p.precio)}
          <button class="pcard-add" onclick="event.stopPropagation();addToCart(${p.id})">+ Agregar</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderPagination(total) {
  const pages = Math.ceil(total/ITEMS_PER_PAGE);
  const pag = document.getElementById('pagination');
  if (!pag) return;
  if (pages<=1) { pag.classList.add('hidden'); return; }
  pag.classList.remove('hidden');
  pag.innerHTML = Array.from({length:pages},(_,i)=>i+1).map(p =>
    `<button class="page-btn${p===currentPage?' active':''}" onclick="goToPage(${p})">${p}</button>`
  ).join('');
}

function goToPage(p) {
  currentPage = p;
  renderPage();
  document.getElementById('tienda').scrollIntoView({ behavior:'smooth' });
}

function openModal(id) {
  const p = allProducts.find(x => Number(x.id) === Number(id));
  if (!p) return;
  const img = getImageUrl(p.imagen_url) || PLACEHOLDER;
  const modalImg = document.getElementById('modal-img');
  modalImg.src = img;
  modalImg.alt = p.nombre;
  modalImg.onerror = () => { modalImg.src = PLACEHOLDER; };
  document.getElementById('modal-cat').textContent   = p.categoria;
  document.getElementById('modal-name').textContent  = p.nombre;
  document.getElementById('modal-code').textContent  = p.codigo ? 'C\u00f3d. ' + p.codigo : '';
  document.getElementById('modal-desc').textContent  = p.descripcion || '';
  document.getElementById('modal-price').textContent = formatPrecioModal(p.precio);
  document.getElementById('modal-btn').onclick = () => { addToCart(p.id); closeModal(); };
  document.getElementById('modal-wa').href =
    'https://wa.me/51926894528?text=Hola%20Hebillas%20Gin%26Jes%2C%20me%20interesa%3A%20' +
    encodeURIComponent(p.nombre) + '%20(' + encodeURIComponent(p.codigo||'') + ')';
  document.getElementById('product-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('product-modal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', initProducts);
