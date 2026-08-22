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
    cartItems.innerHTML = '<p class="text-center mt-12 text-gray-600">🧵 Tu carrito está vacío</p>';
    return;
  }
  cartItems.innerHTML = cart.map(item => `
    <div class="flex gap-3 py-4 border-b border-yellow-900/30">
      <img src="${item.image}" class="w-14 h-14 object-cover" />
      <div class="flex-1">
        <p class="text-white text-sm font-medium leading-tight">${item.name}</p>
        <p class="text-gray-500 text-xs mt-1">Cant: ${item.qty} × S/ ${item.price.toFixed(2)}</p>
      </div>
      <button onclick="removeFromCart(${item.id})" class="text-yellow-800 hover:text-yellow-400 text-lg leading-none">&times;</button>
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
  sidebar.classList.contains('cart-open') ? closeCart() : openCart();
}
