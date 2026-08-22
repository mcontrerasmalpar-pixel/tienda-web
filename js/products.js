const ITEMS_PER_PAGE = 12;
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let currentView = 'grid';
let currentSort = 'default';
let currentSearch = '';
let currentCategory = null;

const fallbackProducts = [
  { id:1, nombre:'Hebilla para Correa Dorada', precio:5.50, imagen_url:'https://hebillasginjes.com/wp-content/uploads/HCORC-00024.jpg', categoria:'Hebillas', descripcion:'Hebilla metálica dorada para correa de cuero. Alta resistencia y acabado brillante.', codigo:'HCORC-00024', destacado:true },
  { id:2, nombre:'Hebilla Rodillo Plateada', precio:6.00, imagen_url:'https://via.placeholder.com/400x400/1a1a1a/D97706?text=Hebilla+Rodillo', categoria:'Hebillas rodillo', descripcion:'Hebilla tipo rodillo de zamak, ideal para correas y cinturones.', codigo:'HROD-00001', destacado:false },
  { id:3, nombre:'Placa Decorativa Premium', precio:3.50, imagen_url:'https://via.placeholder.com/400x400/1a1a1a/D97706?text=Placa', categoria:'Placas', descripcion:'Placa decorativa de zamak para bolsos y calzado.', codigo:'PLAC-00001', destacado:false },
  { id:4, nombre:'Jalador de Cierre', precio:2.80, imagen_url:'https://via.placeholder.com/400x400/1a1a1a/D97706?text=Jalador', categoria:'Jaladores', descripcion:'Jalador de cierre en zamak, compatible con cierres estándar.', codigo:'JAL-00001', destacado:false },
  { id:5, nombre:'Listón Decorativo Niquelado', precio:4.20, imagen_url:'https://via.placeholder.com/400x400/1a1a1a/D97706?text=Listón', categoria:'Listones', descripcion:'Listón decorativo para calzado, acabado niquelado.', codigo:'LISTD-00014', destacado:true },
  { id:6, nombre:'Pasante Simple 25mm', precio:1.50, imagen_url:'https://via.placeholder.com/400x400/1a1a1a/D97706?text=Pasante', categoria:'Pasantes', descripcion:'Pasante metálico para correas, ancho 25mm.', codigo:'PAS-00001', destacado:false },
  { id:7, nombre:'Adorno con Remaches', precio:7.00, imagen_url:'https://via.placeholder.com/400x400/1a1a1a/D97706?text=Adorno', categoria:'Adornos con remaches', descripcion:'Adorno decorativo con remaches para bolsos y ropa.', codigo:'ADOCR-00015', destacado:true },
  { id:8, nombre:'Ovalines Dorados', precio:3.00, imagen_url:'https://via.placeholder.com/400x400/1a1a1a/D97706?text=Ovalines', categoria:'Ovalines', descripcion:'Ovalines metálicos para carteras y bolsos, acabado dorado.', codigo:'OVA-00001', destacado:false },
  { id:9, nombre:'Traba de Seguridad', precio:4.50, imagen_url:'https://via.placeholder.com/400x400/1a1a1a/D97706?text=Traba', categoria:'Trabas', descripcion:'Traba de seguridad para correas y bolsos.', codigo:'TRAB-00001', destacado:false },
  { id:10, nombre:'Aplicación Floral', precio:6.50, imagen_url:'https://via.placeholder.com/400x400/1a1a1a/D97706?text=Aplicación', categoria:'Aplicaciones', descripcion:'Aplicación decorativa floral para calzado y marroquinería.', codigo:'APL-00001', destacado:false },
  { id:11, nombre:'Hebilla D-Ring 30mm', precio:3.80, imagen_url:'https://via.placeholder.com/400x400/1a1a1a/D97706?text=D-Ring', categoria:'Hebillas', descripcion:'Hebilla D-Ring de 30mm para correas y mochilas.', codigo:'HCORC-00010', destacado:false },
  { id:12, nombre:'Insumo Galvánico Gold', precio:15.00, imagen_url:'https://via.placeholder.com/400x400/1a1a1a/D97706?text=Insumo', categoria:'Insumos Galvánicos y Otros', descripcion:'Insumo galvánico para acabado dorado en herrajes.', codigo:'INSG-00001', destacado:false }
];

async function initProducts() {
  document.getElementById('loading-state').classList.remove('hidden');
  document.getElementById('product-grid').classList.add('hidden');
  const supabaseData = await loadProductsFromSupabase();
  allProducts = supabaseData && supabaseData.length > 0 ? supabaseData : fallbackProducts;
  filteredProducts = [...allProducts];
  updateCategoryCounts();
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('product-grid').classList.remove('hidden');
  renderPage();
}

function updateCategoryCounts() {
  const cats = ['all','Hebillas','Placas','Listones','Jaladores','Aplicaciones','Pasantes','Adornos con remaches','Ovalines','Hebillas rodillo','Trabas','Insumos Galvánicos y Otros'];
  cats.forEach(cat => {
    const el = document.getElementById(`count-${cat}`);
    if (!el) return;
    const count = cat === 'all' ? allProducts.length : allProducts.filter(p => p.categoria === cat).length;
    el.textContent = count > 0 ? `(${count})` : '';
  });
}

function filterProducts(category) {
  currentCategory = category;
  currentPage = 1;
  currentSearch = '';
  if (document.getElementById('search-input')) document.getElementById('search-input').value = '';
  document.querySelectorAll('.cat-filter').forEach(b => {
    b.classList.toggle('active-cat', b.dataset.cat === (category || 'all'));
  });
  applyFilters();
  document.getElementById('tienda').scrollIntoView({ behavior: 'smooth' });
}

function searchProducts(query) {
  currentSearch = query.toLowerCase();
  currentPage = 1;
  applyFilters();
}

function sortProducts(value) {
  currentSort = value;
  applyFilters();
}

function filterByPrice() {
  currentPage = 1;
  applyFilters();
}

function applyFilters() {
  let list = [...allProducts];
  if (currentCategory) list = list.filter(p => p.categoria === currentCategory);
  if (currentSearch) list = list.filter(p =>
    (p.nombre||'').toLowerCase().includes(currentSearch) ||
    (p.codigo||'').toLowerCase().includes(currentSearch) ||
    (p.descripcion||'').toLowerCase().includes(currentSearch)
  );
  const min = parseFloat(document.getElementById('price-min')?.value) || 0;
  const max = parseFloat(document.getElementById('price-max')?.value) || Infinity;
  list = list.filter(p => p.precio >= min && p.precio <= max);
  if (currentSort === 'price-asc') list.sort((a,b) => a.precio - b.precio);
  else if (currentSort === 'price-desc') list.sort((a,b) => b.precio - a.precio);
  else if (currentSort === 'name-asc') list.sort((a,b) => a.nombre.localeCompare(b.nombre));
  filteredProducts = list;
  renderPage();
}

function renderPage() {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  const total = filteredProducts.length;
  document.getElementById('results-count').textContent =
    `Mostrando ${Math.min(start+1, total)}–${Math.min(start+ITEMS_PER_PAGE, total)} de ${total} producto${total !== 1 ? 's' : ''}`;
  renderProducts(pageItems);
  renderPagination(total);
}

function setView(view) {
  currentView = view;
  const grid = document.getElementById('product-grid');
  if (view === 'grid') {
    grid.className = 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5';
    document.getElementById('btn-grid').className = 'p-1.5 border border-yellow-400 text-yellow-400 transition';
    document.getElementById('btn-list').className = 'p-1.5 border border-yellow-800/40 text-gray-500 hover:border-yellow-400 hover:text-yellow-400 transition';
  } else {
    grid.className = 'flex flex-col gap-4';
    document.getElementById('btn-list').className = 'p-1.5 border border-yellow-400 text-yellow-400 transition';
    document.getElementById('btn-grid').className = 'p-1.5 border border-yellow-800/40 text-gray-500 hover:border-yellow-400 hover:text-yellow-400 transition';
  }
  renderPage();
}

function renderProducts(list) {
  const grid = document.getElementById('product-grid');
  if (!list || list.length === 0) {
    grid.innerHTML = '<div class="col-span-4 text-center py-20"><p class="text-gray-600 text-lg">No se encontraron productos.</p><button onclick="filterProducts(null)" class="mt-4 border border-yellow-800/40 text-yellow-400/60 px-6 py-2 text-sm hover:border-yellow-400 hover:text-yellow-400 transition">Ver todos</button></div>';
    return;
  }
  if (currentView === 'list') {
    grid.innerHTML = list.map((p, i) => {
      const img = typeof getImageUrl === 'function' ? getImageUrl(p.imagen_url) : p.imagen_url;
      return `<div class="product-card border border-yellow-900/30 bg-black flex gap-4 p-4 cursor-pointer" style="animation-delay:${i*0.05}s" onclick="openModal(${p.id})">
        <div class="w-28 h-28 flex-shrink-0 bg-gray-900 flex items-center justify-center overflow-hidden">
          <img src="${img}" alt="${p.nombre}" class="w-full h-full object-contain p-2" onerror="this.src='https://via.placeholder.com/200x200/1a1a1a/D97706?text=Gin%26Jes'" loading="lazy" />
        </div>
        <div class="flex flex-col justify-between flex-1">
          <div>
            <p class="text-yellow-400/60 text-xs tracking-widest uppercase">${p.categoria}</p>
            <p class="text-gray-600 text-xs font-mono">${p.codigo||''}</p>
            <h3 class="text-white font-semibold mt-1">${p.nombre}</h3>
            <p class="text-gray-500 text-xs leading-relaxed mt-1 line-clamp-2">${p.descripcion||''}</p>
          </div>
          <div class="flex justify-between items-center mt-2">
            <span class="text-yellow-400 font-bold text-lg">S/ ${p.precio.toFixed(2)}</span>
            <button onclick="event.stopPropagation(); addToCart(${p.id})" class="border border-yellow-800/60 text-yellow-400/80 text-xs px-4 py-2 hover:border-yellow-400 hover:text-yellow-400 transition uppercase tracking-wider">+ Agregar</button>
          </div>
        </div>
      </div>`;
    }).join('');
  } else {
    grid.innerHTML = list.map((p, i) => {
      const img = typeof getImageUrl === 'function' ? getImageUrl(p.imagen_url) : p.imagen_url;
      const badge = p.destacado ? '<span class="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-0.5 font-bold">⭐</span>' : '';
      return `<div class="product-card border border-yellow-900/30 bg-black" style="animation-delay:${i*0.05}s" onclick="openModal(${p.id})">
        <div class="relative bg-gray-900 overflow-hidden flex items-center justify-center" style="height:220px">
          <img src="${img}" alt="${p.nombre}" class="w-full h-full object-contain p-4" onerror="this.src='https://via.placeholder.com/400x400/1a1a1a/D97706?text=Gin%26Jes'" loading="lazy" />
          ${badge}
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <p class="text-yellow-400 text-xs tracking-widest uppercase">Ver detalle →</p>
          </div>
        </div>
        <div class="p-4">
          <p class="text-yellow-400/60 text-xs tracking-widest uppercase mb-0.5">${p.categoria}</p>
          <p class="text-gray-600 text-xs font-mono mb-1">${p.codigo||''}</p>
          <h3 class="text-white text-sm font-semibold mb-1 leading-tight">${p.nombre}</h3>
          <p class="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">${p.descripcion||''}</p>
          <div class="flex justify-between items-center border-t border-yellow-900/20 pt-3">
            <span class="text-yellow-400 font-bold">S/ ${p.precio.toFixed(2)}</span>
            <button onclick="event.stopPropagation(); addToCart(${p.id})" class="border border-yellow-800/60 text-yellow-400/80 text-xs px-3 py-1.5 hover:border-yellow-400 hover:text-yellow-400 transition uppercase tracking-wider">+ Agregar</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }
}

function renderPagination(total) {
  const pages = Math.ceil(total / ITEMS_PER_PAGE);
  const pag = document.getElementById('pagination');
  if (pages <= 1) { pag.classList.add('hidden'); return; }
  pag.classList.remove('hidden');
  pag.innerHTML = Array.from({length: pages}, (_,i) => i+1).map(p =>
    `<button onclick="goToPage(${p})" class="w-9 h-9 border text-sm transition ${
      p === currentPage
        ? 'border-yellow-400 bg-yellow-400 text-black font-bold'
        : 'border-yellow-800/40 text-gray-400 hover:border-yellow-400 hover:text-yellow-400'
    }">${p}</button>`
  ).join('');
}

function goToPage(page) {
  currentPage = page;
  renderPage();
  document.getElementById('tienda').scrollIntoView({ behavior: 'smooth' });
}

function openModal(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  const img = typeof getImageUrl === 'function' ? getImageUrl(p.imagen_url) : p.imagen_url;
  document.getElementById('modal-img').src = img;
  document.getElementById('modal-img').alt = p.nombre;
  document.getElementById('modal-cat').textContent = p.categoria;
  document.getElementById('modal-name').textContent = p.nombre;
  document.getElementById('modal-code').textContent = p.codigo ? `Cód: ${p.codigo}` : '';
  document.getElementById('modal-desc').textContent = p.descripcion || '';
  document.getElementById('modal-price').textContent = `S/ ${p.precio.toFixed(2)}`;
  document.getElementById('modal-btn').onclick = () => { addToCart(p.id); closeModal(); };
  document.getElementById('modal-wa').href = `https://wa.me/51920884528?text=Hola%20Hebillas%20Ginjes%2C%20me%20interesa%20el%20producto%3A%20${encodeURIComponent(p.nombre)}%20(${p.codigo||''})`;
  document.getElementById('product-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('product-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => initProducts());
