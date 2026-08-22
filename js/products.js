// Productos de ejemplo (fallback si Supabase no está configurado)
const fallbackProducts = [
  { id: 1, nombre: 'Hilo de Seda Premium', precio: 12.50, imagen_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', categoria: 'Hilos', descripcion: 'Hilo de seda suave y brillante, ideal para bordados finos. Disponible en 24 colores. 200m por carrete.', destacado: false },
  { id: 2, nombre: 'Set Agujas Patchwork x12', precio: 18.00, imagen_url: 'https://images.unsplash.com/photo-1594032194509-0056023973b2?w=400&h=400&fit=crop', categoria: 'Agujas', descripcion: 'Set profesional de 12 agujas para patchwork. Acero inoxidable de alta resistencia. Incluye estuche.', destacado: false },
  { id: 3, nombre: 'Tela Algodón Floral 1m', precio: 25.00, imagen_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=400&fit=crop', categoria: 'Telas', descripcion: 'Tela 100% algodón con estampado floral vintage. 1 metro de largo, 1.5m de ancho.', destacado: false },
  { id: 4, nombre: 'Kit Iniciación Costura', precio: 55.00, imagen_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop', categoria: 'Kits', descripcion: 'Kit completo: tijeras de sastre, agujas, 10 hilos de colores, dedal y centímetro. Ideal como regalo.', destacado: true },
  { id: 5, nombre: 'Botones Nácar 20mm', precio: 8.00, imagen_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', categoria: 'Botones', descripcion: 'Pack de 10 botones de nácar natural. Diámetro 20mm, 4 agujeros. Para blusas y camisas finas.', destacado: false },
  { id: 6, nombre: 'Cierre Invisible 30cm', precio: 5.50, imagen_url: 'https://images.unsplash.com/photo-1594032194509-0056023973b2?w=400&h=400&fit=crop', categoria: 'Cierres', descripcion: 'Cierre invisible de nylon. Disponible en 15 colores. 30cm de largo, ideal para vestidos y faldas.', destacado: false },
  { id: 7, nombre: 'Encaje Vintage Blanco 2m', precio: 15.00, imagen_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=400&fit=crop', categoria: 'Encajes', descripcion: 'Encaje de algodón estilo vintage con motivos florales. 2 metros, 8cm de ancho.', destacado: false },
  { id: 8, nombre: 'Kit Bordado Profesional', precio: 78.00, imagen_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop', categoria: 'Kits', descripcion: 'Kit completo: bastidor de madera 20cm, 24 hilos DMC, 10 agujas de bordado y tijeras pequeñas.', destacado: true }
];

let allProducts = [];
let filteredProducts = [];

async function initProducts() {
  document.getElementById('loading-state').classList.remove('hidden');
  document.getElementById('product-grid').classList.add('hidden');

  // Intentar cargar desde Supabase
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
    const img = typeof getImageUrl === 'function' ? getImageUrl(p.imagen_url || p.image) : (p.imagen_url || p.image);
    const badge = p.destacado ? '<span class="absolute top-3 left-3 bg-yellow-400 text-black text-xs px-2 py-1 font-bold tracking-wider">⭐ Destacado</span>' : '';
    return `
    <div class="product-card border border-yellow-900/30 bg-black" style="animation-delay:${i*0.07}s" onclick="openModal(${p.id})">
      <div class="relative overflow-hidden">
        <img src="${img}" alt="${p.nombre || p.name}" loading="lazy" />
        ${badge}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p class="text-yellow-400 text-xs tracking-widest uppercase">Ver detalle</p>
        </div>
      </div>
      <div class="p-5">
        <p class="text-yellow-400/60 text-xs tracking-widest uppercase mb-1">${p.categoria || p.category}</p>
        <h3 class="text-white font-semibold mb-2 leading-tight">${p.nombre || p.name}</h3>
        <p class="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">${p.descripcion || p.description}</p>
        <div class="flex justify-between items-center">
          <span class="text-yellow-400 font-bold text-lg">S/ ${(p.precio || p.price).toFixed(2)}</span>
          <button onclick="event.stopPropagation(); addToCart(${p.id})" class="border border-yellow-800/60 text-yellow-400/80 text-xs px-4 py-2 hover:border-yellow-400 hover:text-yellow-400 transition uppercase tracking-wider">+ Agregar</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function openModal(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  const img = typeof getImageUrl === 'function' ? getImageUrl(p.imagen_url || p.image) : (p.imagen_url || p.image);
  document.getElementById('modal-img').src = img;
  document.getElementById('modal-img').alt = p.nombre || p.name;
  document.getElementById('modal-cat').textContent = p.categoria || p.category;
  document.getElementById('modal-name').textContent = p.nombre || p.name;
  document.getElementById('modal-desc').textContent = p.descripcion || p.description;
  document.getElementById('modal-price').textContent = `S/ ${(p.precio || p.price).toFixed(2)}`;
  document.getElementById('modal-btn').onclick = () => { addToCart(p.id); closeModal(); };
  document.getElementById('product-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('product-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => initProducts());
