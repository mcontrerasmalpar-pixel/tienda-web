// 🧵 Catálogo Gin&Jes
// Reemplaza image: con las URLs reales de tu catálogo
const products = [
  {
    id: 1,
    name: "Hilo de Seda Premium",
    price: 12.50,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    category: "Hilos",
    description: "Hilo de seda suave y brillante, ideal para bordados finos y costura de lujo. Disponible en 24 colores. 200m por carrete."
  },
  {
    id: 2,
    name: "Set Agujas Patchwork x12",
    price: 18.00,
    image: "https://images.unsplash.com/photo-1594032194509-0056023973b2?w=400&h=400&fit=crop",
    category: "Agujas",
    description: "Set profesional de 12 agujas para patchwork y costura a mano. Acero inoxidable de alta resistencia. Incluye estuche."
  },
  {
    id: 3,
    name: "Tela Algodón Floral 1m",
    price: 25.00,
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=400&fit=crop",
    category: "Telas",
    description: "Tela 100% algodón con estampado floral vintage. Suave al tacto y fácil de trabajar. 1 metro de largo, 1.5m de ancho."
  },
  {
    id: 4,
    name: "Kit Iniciación Costura",
    price: 55.00,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
    category: "Kits",
    description: "Kit completo para empezar: tijeras de sastre, set de agujas, 10 hilos de colores, dedal, centimetro y descosedor. Ideal como regalo.",
    badge: "⭐ Más vendido"
  },
  {
    id: 5,
    name: "Botones Nácar 20mm",
    price: 8.00,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    category: "Botones",
    description: "Pack de 10 botones de nácar natural con acabado perlado. Diámetro 20mm, 4 agujeros. Perfectos para blusas y camisas finas."
  },
  {
    id: 6,
    name: "Cierre Invisible 30cm",
    price: 5.50,
    image: "https://images.unsplash.com/photo-1594032194509-0056023973b2?w=400&h=400&fit=crop",
    category: "Cierres",
    description: "Cierre invisible de nylon de alta durabilidad. Disponible en 15 colores. Talla 3, 30cm de largo. Ideal para vestidos y faldas."
  },
  {
    id: 7,
    name: "Encaje Vintage Blanco 2m",
    price: 15.00,
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=400&fit=crop",
    category: "Encajes",
    description: "Encaje de algodón estilo vintage con motivos florales. 2 metros de largo, 8cm de ancho. Perfecto para bordes y decoración."
  },
  {
    id: 8,
    name: "Kit Bordado Profesional",
    price: 78.00,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
    category: "Kits",
    description: "Kit profesional completo: bastidor de madera 20cm, 24 hilos DMC, 10 agujas de bordado, tijeras pequeas y aro de bambú.",
    badge: "👑 Premium"
  }
];

let filteredProducts = [...products];

function filterProducts(category) {
  filteredProducts = category ? products.filter(p => p.category === category) : [...products];
  renderProducts(filteredProducts);
  setTimeout(() => document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' }), 100);
}

function renderProducts(list = products) {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = list.length === 0
    ? '<p class="col-span-4 text-center text-gray-600 py-12">No hay productos en esta categoría aún.</p>'
    : list.map((p, i) => `
    <div class="product-card border border-yellow-900/30 bg-black" style="animation-delay:${i*0.07}s" onclick="openModal(${p.id})">
      <div class="relative overflow-hidden">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
        ${p.badge ? `<span class="absolute top-3 left-3 bg-yellow-400 text-black text-xs px-2 py-1 font-bold tracking-wider">${p.badge}</span>` : ''}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p class="text-yellow-400 text-xs tracking-widest uppercase">Ver detalle</p>
        </div>
      </div>
      <div class="p-5">
        <p class="text-yellow-400/60 text-xs tracking-widest uppercase mb-1">${p.category}</p>
        <h3 class="text-white font-semibold mb-2 leading-tight">${p.name}</h3>
        <p class="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">${p.description}</p>
        <div class="flex justify-between items-center">
          <span class="text-yellow-400 font-bold text-lg">S/ ${p.price.toFixed(2)}</span>
          <button onclick="event.stopPropagation(); addToCart(${p.id})" class="border border-yellow-800/60 text-yellow-400/80 text-xs px-4 py-2 hover:border-yellow-400 hover:text-yellow-400 transition uppercase tracking-wider">+ Agregar</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('modal-img').src = p.image;
  document.getElementById('modal-img').alt = p.name;
  document.getElementById('modal-cat').textContent = p.category;
  document.getElementById('modal-name').textContent = p.name;
  document.getElementById('modal-desc').textContent = p.description;
  document.getElementById('modal-price').textContent = `S/ ${p.price.toFixed(2)}`;
  document.getElementById('modal-btn').onclick = () => { addToCart(p.id); closeModal(); };
  document.getElementById('product-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('product-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => renderProducts());
