// 🧵 Catálogo de Gin&Jes
// TODO: Reemplaza las imágenes con las fotos reales de tu catálogo de Google Drive
const products = [
  {
    id: 1,
    name: "Hilo de Seda Premium",
    price: 12.50,
    image: "https://via.placeholder.com/300x300/FEF3C7/92400E?text=Hilo+Seda",
    category: "Hilos",
    description: "Hilo de seda suave, ideal para bordados y costura fina."
  },
  {
    id: 2,
    name: "Set de Agujas Patchwork",
    price: 18.00,
    image: "https://via.placeholder.com/300x300/FEF3C7/92400E?text=Agujas",
    category: "Agujas",
    description: "Set de 12 agujas de diferentes calibres para patchwork."
  },
  {
    id: 3,
    name: "Tela Algodón Estampada",
    price: 25.00,
    image: "https://via.placeholder.com/300x300/FEF3C7/92400E?text=Tela+Algodón",
    category: "Telas",
    description: "Tela 100% algodón con estampado floral, 1 metro."
  },
  {
    id: 4,
    name: "Kit Iniciación Costura",
    price: 55.00,
    image: "https://via.placeholder.com/300x300/FEF3C7/92400E?text=Kit+Inicio",
    category: "Kits",
    description: "Todo lo que necesitas para empezar: tijeras, agujas, hilos y dedal."
  },
  {
    id: 5,
    name: "Botones Nácar 20mm",
    price: 8.00,
    image: "https://via.placeholder.com/300x300/FEF3C7/92400E?text=Botones",
    category: "Botones",
    description: "Pack de 10 botones de nácar natural, 20mm de diámetro."
  },
  {
    id: 6,
    name: "Cierre Invisible 30cm",
    price: 5.50,
    image: "https://via.placeholder.com/300x300/FEF3C7/92400E?text=Cierre",
    category: "Cierres",
    description: "Cierre invisible de alta durabilidad, disponible en 12 colores."
  },
  {
    id: 7,
    name: "Encaje Vintage Blanco",
    price: 15.00,
    image: "https://via.placeholder.com/300x300/FEF3C7/92400E?text=Encaje",
    category: "Encajes",
    description: "Encaje de algodón estilo vintage, 2 metros."
  },
  {
    id: 8,
    name: "Kit Bordado Completo",
    price: 78.00,
    image: "https://via.placeholder.com/300x300/FEF3C7/92400E?text=Kit+Bordado",
    category: "Kits",
    description: "Kit profesional de bordado con bastidor, agujas e hilos.",
    badge: "⭐ Favorito"
  }
];

let filteredProducts = [...products];

function filterProducts(category) {
  filteredProducts = category ? products.filter(p => p.category === category) : [...products];
  renderProducts(filteredProducts);
  document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
}

function renderProducts(list = products) {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = list.map(p => `
    <div class="product-card bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div class="relative">
        <img src="${p.image}" alt="${p.name}" />
        ${p.badge ? `<span class="absolute top-2 left-2 bg-amber-600 text-white text-xs px-2 py-1 rounded-full">${p.badge}</span>` : ''}
      </div>
      <div class="p-4">
        <p class="text-xs text-amber-600 font-medium mb-1 uppercase tracking-wide">${p.category}</p>
        <h3 class="font-semibold text-sm mb-1 text-gray-800">${p.name}</h3>
        <p class="text-gray-400 text-xs mb-3">${p.description}</p>
        <div class="flex justify-between items-center">
          <span class="font-bold text-amber-700 text-lg">S/ ${p.price.toFixed(2)}</span>
          <button onclick="addToCart(${p.id})" class="text-xs bg-amber-700 text-white px-4 py-2 rounded-full hover:bg-amber-800 transition">+ Agregar</button>
        </div>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => renderProducts());
