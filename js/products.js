const ITEMS_PER_PAGE = 12;
let allProducts = [], filteredProducts = [], currentPage = 1;
let currentView = 'grid', currentSort = 'default', currentSearch = '', currentCategory = null;

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22 viewBox=%220 0 400 400%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%230d0d0d%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2228%22 fill=%22%23C9A84C%22%3EGin%26Jes%3C/text%3E%3C/svg%3E';

// Fallback con rutas reales del bucket
const fallbackProducts = [
  { id:1,  nombre:'Pegapega Americano',    precio:0, imagen_url:'pegapega/americano/americano.jpg',                              categoria:'Pegapega',          descripcion:'Pegamento americano de alta resistencia.', codigo:'PEG-AMERIC',     destacado:true  },
  { id:2,  nombre:'Pegapega Grado B',      precio:0, imagen_url:'pegapega/gradob/gradob.jpg',                                   categoria:'Pegapega',          descripcion:'Pegamento industrial Grado B.',            codigo:'PEG-GRADOB',     destacado:false },
  { id:3,  nombre:'Broche Imán para Coser',precio:0, imagen_url:'productos metales/broche iman/broche iman coser.jpg',          categoria:'Broches',           descripcion:'Broche imán para coser en bolsos.',        codigo:'MET-BRIMAN-COS', destacado:true  },
  { id:4,  nombre:'Imán Dorado 18mm',      precio:0, imagen_url:'productos metales/broche iman/iman dorado 18.png',             categoria:'Broches',           descripcion:'Imán dorado de 18mm.',                    codigo:'MET-IMAN-D18',   destacado:false },
  { id:5,  nombre:'Imán Níquel 10mm',      precio:0, imagen_url:'productos metales/broche iman/iman niquel 10mm.png',           categoria:'Broches',           descripcion:'Imán niquelado de 10mm.',                 codigo:'MET-IMAN-N10',   destacado:false },
  { id:6,  nombre:'Imán Níquel 18mm',      precio:0, imagen_url:'productos metales/broche iman/iman niquel 18.png',             categoria:'Broches',           descripcion:'Imán niquelado de 18mm.',                 codigo:'MET-IMAN-N18',   destacado:false },
  { id:7,  nombre:'Imán Plano 16mm',       precio:0, imagen_url:'productos metales/broche iman/iman plano 16.png',              categoria:'Broches',           descripcion:'Imán plano de 16mm.',                     codigo:'MET-IMAN-P16',   destacado:false },
  { id:8,  nombre:'Imán Plano 18mm',       precio:0, imagen_url:'productos metales/broche iman/iman plano 18.png',              categoria:'Broches',           descripcion:'Imán plano de 18mm.',                     codigo:'MET-IMAN-P18',   destacado:false },
  { id:9,  nombre:'Broche 7050',           precio:0, imagen_url:'productos metales/broche7050/broche 7050.webp',                categoria:'Broches',           descripcion:'Broche modelo 7050 de zamak.',             codigo:'MET-BR7050',     destacado:false },
  { id:10, nombre:'Gancho Rino',           precio:0, imagen_url:'productos metales/ganchos/gancho rino/gancho rino.jpg',        categoria:'Ganchos',           descripcion:'Gancho tipo Rino para correas.',           codigo:'MET-GANCH-RINO', destacado:false },
  { id:11, nombre:'Media Luna',            precio:0, imagen_url:'productos metales/media luna/media luna.jpg',                 categoria:'Herrajes Metálicos', descripcion:'Herraje media luna de zamak.',            codigo:'MET-MEDLUN',     destacado:false },
  { id:12, nombre:'Mosquetón Fotochek',    precio:0, imagen_url:'productos metales/mosquetones/mosqueton fotockeck.jpg',        categoria:'Mosquetones',       descripcion:'Mosquetón tipo fotochek.',                 codigo:'MET-MOSQ-FOTO',  destacado:true  },
  { id:13, nombre:'Mosquetón Giratorio',   precio:0, imagen_url:'productos metales/mosquetones/mosqueton giratorio.jpg',        categoria:'Mosquetones',       descripcion:'Mosquetón giratorio metálico.',            codigo:'MET-MOSQ-GIR',   destacado:false },
  { id:14, nombre:'Mosquetón Simple',      precio:0, imagen_url:'productos metales/mosquetones/mosqueton simple.jpg',           categoria:'Mosquetones',       descripcion:'Mosquetón simple para llaveros.',          codigo:'MET-MOSQ-SIMP',  destacado:false },
  { id:15, nombre:'Regulador Escalera',    precio:0, imagen_url:'productos metales/reguladores/regulador escalera.jpg',         categoria:'Reguladores',       descripcion:'Regulador tipo escalera metálico.',        codigo:'MET-REG-ESC',    destacado:false },
  { id:16, nombre:'Regulador Plástico',    precio:0, imagen_url:'productos metales/reguladores/regulador plastico.jpg',         categoria:'Reguladores',       descripcion:'Regulador en plástico para correas.',     codigo:'PLAS-REG',       destacado:false },
  { id:17, nombre:'Tiptop Sapito',         precio:0, imagen_url:'productos plasticos/tiptop/sapito/tiptopsapito.jpg',           categoria:'Tiptop',            descripcion:'Tiptop sapito en plástico para calzado.', codigo:'PLAS-TIPSAP',    destacado:true  },
];

// Categorías reales del bucket
const CATEGORIAS = [
  'Pegapega',
  'Broches',
  'Ganchos',
  'Herrajes Metálicos',
  'Mosquetones',
  'Reguladores',
  'Tiptop',
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

function handleImgError(e) {
  if (e.target.src !== PLACEHOLDER) e.target.src = PLACEHOLDER;
}

async function initProducts() {
  document.getElementById('loading-state').style.display = 'block';
  document.getElementById('product-grid').classList.add('hidden');

  let data = null;
  try { data = await loadProductsFromSupabase(); } catch(e) { console.warn('Supabase:', e); }
  if (data && data.length) data = data.map(p => ({ ...p, id: Number(p.id), precio: parseFloat(p.precio)||0 }));

  allProducts      = (data && data.length) ? data : [...fallbackProducts];
  filteredProducts = [...allProducts];

  document.getElementById('product-grid').addEventListener('error', handleImgError, true);

  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('product-grid').classList.remove('hidden');
  buildCategoryButtons();
  updateCounts();
  applyFilters();
}

function buildCategoryButtons() {
  const container = document.getElementById('cat-buttons');
  if (!container) return;
  const cats = [...new Set(allProducts.map(p => p.categoria))].sort();
  const allBtn = `<button class="cat-btn active" data-cat="all" onclick="filterProducts(null)">Todos <span id="count-all"></span></button>`;
  const catBtns = cats.map(c =>
    `<button class="cat-btn" data-cat="${escAttr(c)}" onclick="filterProducts('${escAttr(c)}')">${escAttr(c)} <span></span></button>`
  ).join('');
  container.innerHTML = allBtn + catBtns;
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
  document.getElementById('modal-code').textContent  = p.codigo ? 'Cód. ' + p.codigo : '';
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
