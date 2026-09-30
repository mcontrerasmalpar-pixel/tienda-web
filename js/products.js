const ITEMS_PER_PAGE = 12;
let allProducts = [], currentPage = 1, currentView = 'grid', currentSort = 'default';
let currentSearch = '', currentCategory = '', currentSubcategory = '', totalProducts = 0;
let categories = [], subcategories = [], requestVersion = 0, searchTimer, productsInitialized = false;
const PLACEHOLDER='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%230d0d0d%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%23C9A84C%22 text-anchor=%22middle%22 y=%22210%22 font-size=%2228%22%3EGin%26Jes%3C/text%3E%3C/svg%3E';
const escAttr = Catalog.escapeHtml;
function getSupabaseClient() { return window.supabaseClient; }
function getImageUrl(value) { return Catalog.imageUrl(getSupabaseClient(), value, PLACEHOLDER); }
function handleImgError(event) {
  if (event.target.dataset.fallback) return;
  event.target.dataset.fallback = '1'; event.target.src = PLACEHOLDER;
}
function formatPrecio(price) {
  return Number(price) > 0 ? '<span class="pcard-price">S/ ' + Number(price).toFixed(2) + '</span>' : '<span style="font-size:var(--f-sm);color:var(--text-3)">Consultar precio</span>';
}
function formatPrecioModal(price) { return Number(price) > 0 ? 'S/ ' + Number(price).toFixed(2) : 'Consultar precio'; }
function buildCategoryButtons() {
  const list = document.getElementById('sidebar-cats');
  list.replaceChildren();
  [{id: '', nombre: 'Todos'}, ...categories].forEach(category => {
    const item = document.createElement('li'), button = document.createElement('button');
    button.className = 'cat-btn' + (String(category.id) === String(currentCategory) ? ' active' : '');
    button.textContent = category.nombre;
    button.onclick = () => filterProducts(category.id);
    item.append(button); list.append(item);
  });
  const select = document.getElementById('subcategory-filter');
  select.innerHTML = '<option value="">Todas las subcategorías</option>' + subcategories.filter(s => String(s.category_id) === String(currentCategory)).map(s => `<option value="${s.id}">${escAttr(s.nombre)}</option>`).join('');
  select.value = currentSubcategory; select.disabled = !currentCategory;
}
function filterProducts(category) {
  currentCategory = category || ''; currentSubcategory = ''; currentPage = 1;
  buildCategoryButtons(); applyFilters();
}
function toggleCatalogFilters(button) { const open = document.getElementById('catalog-filters').classList.toggle('filters-open'); button.setAttribute('aria-expanded', String(open)); }
function filterSubcategory(value) { currentSubcategory = value; currentPage = 1; applyFilters(); }
function searchProducts(value) {
  currentSearch = String(value || '').slice(0, 160); currentPage = 1;
  document.querySelectorAll('.search-wrap input').forEach(input => { if (input.value !== currentSearch) input.value = currentSearch; });
  clearTimeout(searchTimer); ++requestVersion;
  searchTimer = setTimeout(applyFilters, 300);
}
function sortProducts(value) { currentSort = value; currentPage = 1; applyFilters(); }
function filterByPrice() { currentPage = 1; applyFilters(); }
async function applyFilters() {
  clearTimeout(searchTimer);
  const version = ++requestVersion;
  const grid = document.getElementById('product-grid');
  grid.setAttribute('aria-busy', 'true');
  document.getElementById('results-count').textContent = 'Cargando productos…';
  try {
    const result = await Catalog.productQuery(getSupabaseClient(), {page: currentPage, size: ITEMS_PER_PAGE, search: currentSearch, category: currentCategory, subcategory: currentSubcategory, sort: currentSort, min: document.getElementById('price-min').value, max: document.getElementById('price-max').value});
    if (version !== requestVersion) return;
    if (result.error) throw result.error;
    totalProducts = result.count || 0;
    if (currentPage > 1 && (currentPage - 1) * ITEMS_PER_PAGE >= totalProducts) { currentPage = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE)); return applyFilters(); }
    allProducts = result.data || []; renderPage();
  } catch (error) { if (version === requestVersion) { allProducts = []; document.getElementById('pagination').classList.add('hidden'); document.getElementById('results-count').textContent = ''; showCatalogError(error.message); } }
  finally { if (version === requestVersion) grid.setAttribute('aria-busy', 'false'); }
}
function renderPage() {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  document.getElementById('results-count').textContent = `Mostrando ${totalProducts ? start + 1 : 0}–${start + allProducts.length} de ${totalProducts} productos`;
  renderCards(allProducts); renderPagination(totalProducts);
}
function setView(view) {
  currentView = view;
  document.getElementById('product-grid').classList.toggle('list-view', view === 'list');
  ['grid','list'].forEach(v => { const button = document.getElementById('btn-' + v); button.classList.toggle('active', view === v); button.setAttribute('aria-pressed', String(view === v)); });
  renderCards(allProducts);
}
function renderCards(l){const g=document.getElementById('product-grid');if(!g)return;if(!l.length){g.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:4rem 0;color:var(--text-3)">No se encontraron productos.</div>';return}g.innerHTML=l.map((p,i)=>{const n=escAttr(p.nombre),im=escAttr(getImageUrl(p.imagen_url)),badge=p.destacado?'<div class="pcard-badge">Destacado</div>':'';return currentView==='list'?'<div class="pcard list" style="animation-delay:'+i*.04+'s" onclick="openModal('+p.id+')"><div class="pcard-img"><img src="'+im+'" alt="'+n+'" loading="lazy" onerror="handleImgError(event)"></div><div class="pcard-body"><p class="pcard-cat">'+escAttr(p.categoria)+'</p><p class="pcard-code">'+escAttr(p.codigo||'')+'</p><h4 class="pcard-name">'+n+'</h4><div class="pcard-foot">'+formatPrecio(p.precio)+'<button class="pcard-add" onclick="event.stopPropagation();addToCart('+p.id+')">+ Agregar</button></div></div></div>':'<div class="pcard" style="animation-delay:'+i*.04+'s" onclick="openModal('+p.id+')">'+badge+'<div class="pcard-img"><img src="'+im+'" alt="'+n+'" loading="lazy" onerror="handleImgError(event)"></div><div class="pcard-body"><p class="pcard-cat">'+escAttr(p.categoria)+'</p><p class="pcard-code">'+escAttr(p.codigo||'')+'</p><h4 class="pcard-name">'+n+'</h4><div class="pcard-foot">'+formatPrecio(p.precio)+'<button class="pcard-add" onclick="event.stopPropagation();addToCart('+p.id+')">+ Agregar</button></div></div></div>'}).join('')}
function renderPagination(total) {
  const pages = Math.ceil(total / ITEMS_PER_PAGE), holder = document.getElementById('pagination');
  holder.classList.toggle('hidden', pages <= 1);
  const numbers = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, pages])].filter(n => n >= 1 && n <= pages).sort((a,b) => a-b);
  holder.innerHTML = numbers.map((n,i) => (i && n - numbers[i-1] > 1 ? '<span>…</span>' : '') + `<button class="page-btn${n === currentPage ? ' active' : ''}" ${n === currentPage ? 'aria-current="page"' : ''} onclick="goToPage(${n})">${n}</button>`).join('');
}
function goToPage(page) { currentPage = page; applyFilters(); document.getElementById('tienda').scrollIntoView({behavior: 'smooth'}); }
function openModal(id){const p=allProducts.find(x=>Number(x.id)===Number(id));if(!p)return;const i=document.getElementById('modal-img');if(i){delete i.dataset.fallback;i.src=getImageUrl(p.imagen_url);i.alt=p.nombre;i.onerror=()=>handleImgError({target:i})}document.getElementById('modal-cat').textContent=p.categoria||'';document.getElementById('modal-name').textContent=p.nombre||'';document.getElementById('modal-code').textContent=p.codigo?'Cód. '+p.codigo:'';document.getElementById('modal-desc').textContent=p.descripcion||'';document.getElementById('modal-price').textContent=formatPrecioModal(p.precio);document.getElementById('modal-btn').onclick=()=>{addToCart(p.id);closeModal()};document.getElementById('modal-wa').href='https://wa.me/51926894528?text=Hola%20Hebillas%20Gin%26Jes%2C%20me%20interesa%3A%20'+encodeURIComponent(p.nombre)+'%20('+encodeURIComponent(p.codigo||'')+')';document.getElementById('product-modal').classList.add('open');document.body.style.overflow='hidden'}function closeModal(){document.getElementById('product-modal')?.classList.remove('open');document.body.style.overflow=''}
function showCatalogError(message) {
  document.getElementById('product-grid').innerHTML = `<div class="catalog-error">No se pudieron cargar los productos.<br><small>${escAttr(message)}</small><br><button class="filter-btn" onclick="initProducts(true)">Reintentar</button></div>`;
}
async function initProducts(force = false) {
  if (productsInitialized && !force) return;
  productsInitialized = true;
  const loading = document.getElementById('loading-state'), grid = document.getElementById('product-grid');
  try {
    ({categories, subcategories} = await Catalog.taxonomy(getSupabaseClient()));
    buildCategoryButtons(); await applyFilters();
  } catch (error) { productsInitialized = false; showCatalogError(error.message); }
  finally { loading.style.display = 'none'; grid.classList.remove('hidden'); }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initProducts(), {once: true});
else initProducts();
