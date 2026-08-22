// Lógica del carrito de compras
let cart = [];

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCartUI();
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-total').textContent = `S/ ${total.toFixed(2)}`;

  const cartItems = document.getElementById('cart-items');
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="text-gray-400">Tu carrito está vacío.</p>';
    return;
  }
  cartItems.innerHTML = cart.map(item => `
    <div class="flex justify-between items-center py-3 border-b">
      <div>
        <p class="font-medium">${item.name}</p>
        <p class="text-gray-400 text-xs">Cant: ${item.qty} &times; S/ ${item.price.toFixed(2)}</p>
      </div>
      <button onclick="removeFromCart(${item.id})" class="text-rose-400 hover:text-rose-600 text-xs ml-2">Eliminar</button>
    </div>
  `).join('');
}

function openCart() {
  document.getElementById('cart-sidebar').classList.add('cart-open');
  document.getElementById('cart-overlay').classList.remove('hidden');
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('cart-open');
  document.getElementById('cart-overlay').classList.add('hidden');
}

function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  if (sidebar.classList.contains('cart-open')) {
    closeCart();
  } else {
    openCart();
  }
}
