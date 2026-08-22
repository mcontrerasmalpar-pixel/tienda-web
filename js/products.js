// Productos de ejemplo — Hebillas Ginjes (fallback hasta configurar Supabase)
const fallbackProducts = [
  { id:1, nombre:'Hebilla para Correa', precio:5.50, imagen_url:'https://hebillasginjes.com/wp-content/uploads/HCORC-00024.jpg', categoria:'Hebillas', descripcion:'Hebilla metálica para correa de cuero. Alta resistencia y acabado brillánte. Disponible en varios tamaños.', codigo:'HCORC-00024', destacado:true },
  { id:2, nombre:'Hebilla Rodillo', precio:6.00, imagen_url:'https://via.placeholder.com/400x400/111/D97706?text=Hebilla+Rodillo', categoria:'Hebillas rodillo', descripcion:'Hebilla tipo rodillo de zamak, ideal para correas y cinturones de cuero. Acabado dorado y plateado.', codigo:'HROD-00001', destacado:false },
  { id:3, nombre:'Placa Decorativa', precio:3.50, imagen_url:'https://via.placeholder.com/400x400/111/D97706?text=Placa', categoria:'Placas', descripcion:'Placa decorativa de zamak para bolsos, carteras y calzado. Motivos modernos y clásicos.', codigo:'PLAC-00001', destacado:false },
  { id:4, nombre:'Jalador de Cierre', precio:2.80, imagen_url:'https://via.placeholder.com/400x400/111/D97706?text=Jalador', categoria:'Jaladores', descripcion:'Jalador de cierre en zamak. Compatible con cierres estándar para ropa, bolsos y calzado.', codigo:'JAL-00001', destacado:false },
  { id:5, nombre:'Listón Decorativo', precio:4.20, imagen_url:'https://via.placeholder.com/400x400/111/D97706?text=Listón', categoria:'Listones', descripcion:'Listón decorativo para calzado y accesorios de moda. Acabado niquelado y dorado.', codigo:'LISTD-00014', destacado:true },
  { id:6, nombre:'Pasante Simple', precio:1.50, imagen_url:'https://via.placeholder.com/400x400/111/D97706?text=Pasante', categoria:'Pasantes', descripcion:'Pasante metálico para correas y cinturones. Disponible en diferentes anchos: 20mm, 25mm, 32mm, 40mm.', codigo:'PAS-00001', destacado:false },
  { id:7, nombre:'Adorno con Remaches', precio:7.00, imagen_url:'https://via.placeholder.com/400x400/111/D97706?text=Adorno', categoria:'Adornos con remaches', descripcion:'Adorno decorativo con remaches para bolsos, carteras y ropa. Motivos variados.', codigo:'ADOCR-00015', destacado:true },
  { id:8, nombre:'Ovalin Dorado', precio:3.00, imagen_url:'https://via.placeholder.com/400x400/111/D97706?text=Ovalín', categoria:'Ovalines', descripcion:'Ovalines metálicos para carteras y bolsos. Acabado dorado y plateado de alta calidad.', codigo:'OVA-00001', destacado:false }
];

let allProducts = [];
let filteredProducts = [];

async function initProducts() {
  document.getElementById('loading-state').classList.remove('hidden');
  document.getElementById('product-grid').classList.add('hidden');
  const supabaseData = await loadProductsFromSupabase();
  allProducts = supabaseData && supabaseData.length > 0 ? supabaseData : fallbackProducts;
  filteredProducts = [...allProducts];
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('product-grid').classList.remove('hidden');
  renderProducts(filteredProducts);
}

function filterProducts(category) {
  filteredProducts = category ? allProducts.filter(p => p.categoria === category) : [...allProducts];
  renderProducts(filteredProducts);
  setTimeout(() => document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' }), 100);
}

function renderProducts(list) {
  const grid = document.getElementById('product-grid');
  if (!list || list.length === 0) {
    grid.innerHTML = '<p class="col-span-4 text-center text-gray-600 py-12">No hay productos en esta categoría aún.</p>';
    return;
  }
  grid.innerHTML = list.map((p, i) => {
    const img = typeof getImageUrl === 'function' ? getImageUrl(p.imagen_url) : p.imagen_url;
    const badge = p.destacado ? '<span class="absolute top-3 left-3 bg-yellow-400 text-black text-xs px-2 py-1 font-bold tracking-wider">⭐ Destacado</span>' : '';
    return `
    <div class="product-card border border-yellow-900/30 bg-black" style="animation-delay:${i*0.07}s" onclick="openModal(${p.id})">
      <div class="relative overflow-hidden">
        <img src="${img}" alt="${p.nombre}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x400/111/D97706?text=Gin%26Jes'" />
        ${badge}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p class="text-yellow-400 text-xs tracking-widest uppercase">Ver detalle</p>
        </div>
      </div>
      <div class="p-5">
        <p class="text-yellow-400/60 text-xs tracking-widest uppercase mb-1">${p.categoria}</p>
        <p class="text-gray-600 text-xs font-mono mb-1">${p.codigo || ''}</p>
        <h3 class="text-white font-semibold mb-2 leading-tight">${p.nombre}</h3>
        <p class="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">${p.descripcion || ''}</p>
        <div class="flex justify-between items-center">
          <span class="text-yellow-400 font-bold text-lg">S/ ${(p.precio).toFixed(2)}</span>
          <button onclick="event.stopPropagation(); addToCart(${p.id})" class="border border-yellow-800/60 text-yellow-400/80 text-xs px-4 py-2 hover:border-yellow-400 hover:text-yellow-400 transition uppercase tracking-wider">+ Agregar</button>
        </div>
      </div>
    </div>`;
  }).join('');
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
  document.getElementById('modal-wa').href = `https://wa.me/51920884528?text=Hola%20Hebillas%20Ginjes%2C%20quiero%20consultar%20por%20${encodeURIComponent(p.nombre)}%20(${p.codigo || ''})` ;
  document.getElementById('product-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('product-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => initProducts());
