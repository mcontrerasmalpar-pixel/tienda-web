// Base de datos de productos
const products = [
  {
    id: 1,
    name: "Producto Artesanal A",
    price: 35.00,
    image: "https://via.placeholder.com/300x200?text=Producto+1",
    category: "Costura"
  },
  {
    id: 2,
    name: "Kit Premium B",
    price: 58.00,
    image: "https://via.placeholder.com/300x200?text=Producto+2",
    category: "Kits"
  },
  {
    id: 3,
    name: "Accesorio Deluxe C",
    price: 22.00,
    image: "https://via.placeholder.com/300x200?text=Producto+3",
    category: "Accesorios"
  },
  {
    id: 4,
    name: "Set Especial D",
    price: 75.00,
    image: "https://via.placeholder.com/300x200?text=Producto+4",
    category: "Sets"
  },
  {
    id: 5,
    name: "Producto Básico E",
    price: 18.00,
    image: "https://via.placeholder.com/300x200?text=Producto+5",
    category: "Básicos"
  },
  {
    id: 6,
    name: "Edición Limitada F",
    price: 95.00,
    image: "https://via.placeholder.com/300x200?text=Producto+6",
    category: "Edición Limitada"
  },
  {
    id: 7,
    name: "Colección Premium G",
    price: 110.00,
    image: "https://via.placeholder.com/300x200?text=Producto+7",
    category: "Premium"
  },
  {
    id: 8,
    name: "Accesorio Clásico H",
    price: 30.00,
    image: "https://via.placeholder.com/300x200?text=Producto+8",
    category: "Clásicos"
  }
];

// Renderizar productos en el grid
function renderProducts() {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = products.map(p => `
    <div class="product-card bg-white border rounded-xl overflow-hidden cursor-pointer" onclick="addToCart(${p.id})">
      <img src="${p.image}" alt="${p.name}" />
      <div class="p-4">
        <p class="text-xs text-rose-400 font-medium mb-1">${p.category}</p>
        <h3 class="font-semibold text-sm mb-2">${p.name}</h3>
        <div class="flex justify-between items-center">
          <span class="font-bold text-rose-600">S/ ${p.price.toFixed(2)}</span>
          <button class="text-xs bg-rose-500 text-white px-3 py-1 rounded-full hover:bg-rose-600 transition">Agregar</button>
        </div>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', renderProducts);
