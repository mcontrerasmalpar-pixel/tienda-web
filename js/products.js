const ITEMS_PER_PAGE = 12;
let allProducts = [], filteredProducts = [], currentPage = 1;
let currentView = 'grid', currentSort = 'default', currentSearch = '', currentCategory = null;

const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%230d0d0d'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='28' fill='%23C9A84C'%3EGin%26amp%3BJes%3C/text%3E%3C/svg%3E`;

const fallbackProducts = [
  { id:1, nombre:'Hebilla para Correa Dorada', precio:5.50, imagen_url:'https://hebillasginjes.com/wp-content/uploads/HCORC-00024.jpg', categoria:'Aplicaciones', descripcion:'Hebilla met\u00e1lica dorada de zamak.', codigo:'HCORC-00024', destacado:true },
  { id:2, nombre:'Hebilla Rodillo Plateada', precio:0, imagen_url:null, categoria:'Aplicaciones', descripcion:'Hebilla tipo rodillo de zamak.', codigo:'HROD-00001', destacado:false },
  { id:3, nombre:'Placa Decorativa Premium', precio:0, imagen_url:null, categoria:'Aplicaciones', descripcion:'Placa decorativa de zamak para bolsos.', codigo:'PLAC-00001', destacado:false },
  { id:4, nombre:'Jalador de Cierre', precio:0, imagen_url:null, categoria:'Aplicaciones', descripcion:'Jalador de cierre en zamak.', codigo:'JAL-00001', destacado:false },
  { id:5, nombre:'Pegapega Americano', precio:0, imagen_url:null, categoria:'Insumos Galv\u00e1nicos y Otros', descripcion:'Pegamento americano de alta resistencia.', codigo:'PEG-AMERIC', destacado:true },
  { id:6, nombre:'Pegapega Grado B', precio:0, imagen_url:null, categoria:'Insumos Galv\u00e1nicos y Otros', descripcion:'Pegamento industrial Grado B.', codigo:'PEG-GRADOB', destacado:false },
];

function formatPrecio(precio) {
  const n = parseFloat(precio);
  if (!n || n <= 0) return '<span class="card-price consultar">Consultar precio</span>';
  return '<span class="card-price">S/ ' + n.toFixed(2) + '</span>';
}

function formatPrecioModal(precio) {
  const n = parseFloat(precio);
  if (!n || n <= 0) return 'Consultar precio';
  return 'S/ ' + n.toFixed(2);
}

async function initProducts() {
  document.getElementById('loading-state').style.display = 'block';
  document.getElementById('product-grid').classList.add('hidden');

  let data = null;
  try { data = await loadProductsFromSupabase(); } catch(e) { console.warn('Supabase error:', e); }

  if (data && data.length) {
    data = data.map(p => ({
      ...p,
      id: Number(p.id),
      precio: parseFloat(p.precio) || 0,
    }));
  }

  allProducts = (data && data.length) ? data : [...fallbackProducts];
  filteredProducts = [...allProducts];

  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('product-grid').classList.remove('hidden');

  updateCounts();
  applyFilters();
}

function updateCounts() {
  const elAll = document.getElementById('count-all');
  if (elAll) elAll.textContent = '(' + allProducts.length + ')';

  document.querySelectorAll('.cat-btn[data-cat]').forEach(btn => {
    const cat = btn.dataset.cat;
    if (cat === 'all') return;
    const safeId = cat.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const el = document.getElementById('count-' + safeId) ||
               document.getElementById('count-' + cat) ||
               btn.querySelector('span');
    if (!el) return;
    const n = allProducts.filter(p => p.categoria === cat).length;
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
  document.getElementById('tienda').scrollIntoView({ behavior: 'smooth' });
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
  list = list.filter(p => (p.precio || 0) >= mn && (p.precio || 0) <= mx);
  if (currentSort === 'price-asc')  list.sort((a,b) => (a.precio||0) - (b.precio||0));
  if (currentSort === 'price-desc') list.sort((a,b) => (b.precio||0) - (a.precio||0));
  if (currentSort === 'name-asc')   list.sort((a,b) => a.nombre.localeCompare(b.nombre));
  filteredProducts = list;
  currentPage = 1;
  renderPage();
}

function renderPage() {
  const s = (currentPage - 1) * ITEMS_PER_PAGE;
  const items = filteredProducts.slice(s, s + ITEMS_PER_PAGE);
  const total = filteredProducts.length;
  const showing = document.getElementById('results-count');
  if (showing) showing.textContent =
    'Mostrando ' + Math.min(s+1,total) + '\u2013' + Math.min(s+ITEMS_PER_PAGE,total) + ' de ' + total + ' producto' + (total!==1?'s':'');
  renderCards(items);
  renderPagination(total);
}

function setView(v) {
  currentView = v;
  const grid = document.getElementById('product-grid');
  if (v === 'grid') {
    grid.classList.remove('list-view');
    document.getElementById('btn-grid').classList.add('active');
    document.getElementById('btn-list').classList.remove('active');
  } else {
    grid.classList.add('list-view');
    document.getElementById('btn-list').classList.add('active');
    document.getElementById('btn-grid').classList.remove('active');
  }
  renderPage();
}

function renderCards(list) {
  const grid = document.getElementById('product-grid');
  if (!list.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:4rem 0;color:var(--muted);font-size:.85rem;letter-spacing:.1em">No se encontraron productos. <button onclick="filterProducts(null)" style="color:var(--gold);text-decoration:underline;cursor:pointer;">Ver todos</button></div>';
    return;
  }
  grid.innerHTML = list.map((p, i) => {
    const img = typeof getImageUrl === 'function' ? (getImageUrl(p.imagen_url) || PLACEHOLDER_SVG) : (p.imagen_url || PLACEHOLDER_SVG);
    const badge = p.destacado ? '<div class="card-badge">Destacado</div>' : '';
    const errSrc = `this.src='${PLACEHOLDER_SVG}'`;
    if (currentView === 'list') {
      return `<div class="product-card list-card" style="animation-delay:${i*.04}s" onclick="openModal(${p.id})">
        <div class="card-img"><img src="${img}" alt="${p.nombre}" loading="lazy" width="200" height="200" onerror="${errSrc}" /></div>
        <div class="card-body">
          <p class="card-cat">${p.categoria}</p>
          <p class="card-code">${p.codigo||''}</p>
          <h4 class="card-name">${p.nombre}</h4>
          <div class="card-foot">
            ${formatPrecio(p.precio)}
            <button class="card-add" onclick="event.stopPropagation();addToCart(${p.id})">+ Agregar</button>
          </div>
        </div>
      </div>`;
    }
    return `<div class="product-card" style="animation-delay:${i*.04}s" onclick="openModal(${p.id})">
      ${badge}
      <div class="card-img"><img src="${img}" alt="${p.nombre}" loading="lazy" width="400" height="400" onerror="${errSrc}" /></div>
      <div class="card-body">
        <p class="card-cat">${p.categoria}</p>
        <p class="card-code">${p.codigo||''}</p>
        <h4 class="card-name">${p.nombre}</h4>
        <div class="card-foot">
          ${formatPrecio(p.precio)}
          <button class="card-add" onclick="event.stopPropagation();addToCart(${p.id})">+ Agregar</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderPagination(total) {
  const pages = Math.ceil(total / ITEMS_PER_PAGE);
  const pag = document.getElementById('pagination');
  if (!pag) return;
  if (pages <= 1) { pag.classList.add('hidden'); return; }
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
  if (!p) {
    console.warn('[Modal] Producto no encontrado, id:', id);
    return;
  }
  const img = typeof getImageUrl === 'function' ? (getImageUrl(p.imagen_url) || PLACEHOLDER_SVG) : (p.imagen_url || PLACEHOLDER_SVG);
  document.getElementById('modal-img').src = img;
  document.getElementById('modal-img').alt = p.nombre;
  document.getElementById('modal-cat').textContent = p.categoria;
  document.getElementById('modal-name').textContent = p.nombre;
  document.getElementById('modal-code').textContent = p.codigo ? 'C\u00f3d. ' + p.codigo : '';
  document.getElementById('modal-desc').textContent = p.descripcion || '';
  document.getElementById('modal-price').textContent = formatPrecioModal(p.precio);
  document.getElementById('modal-btn').onclick = () => { addToCart(p.id); closeModal(); };
  document.getElementById('modal-wa').href = 'https://wa.me/51920884528?text=Hola%20Hebillas%20Gin%26Jes%2C%20me%20interesa%3A%20' + encodeURIComponent(p.nombre) + '%20(' + (p.codigo||'') + ')';
  document.getElementById('product-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('product-modal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', initProducts);
