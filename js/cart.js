let cart = [];
function addToCart(productId) {
  const product = allProducts.find(p => Number(p.id) === Number(productId));
  if (!product) return;
  const existing = cart.find(item => item.id === product.id);
  if (existing) existing.qty++;
  else cart.push({...product, qty: 1});
  updateCartUI(); openCart();
}
function removeFromCart(id) { cart = cart.filter(item => Number(item.id) !== Number(id)); updateCartUI(); }
function updateCartUI() {
  const total = cart.reduce((sum, item) => sum + Number(item.precio) * item.qty, 0);
  document.getElementById('cart-count').textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cart-total').textContent = `S/ ${total.toFixed(2)}${cart.some(i => !Number(i.precio)) ? ' + por cotizar' : ''}`;
  document.getElementById('cart-items').innerHTML = cart.length ? cart.map(item => `<div class="cart-item"><img src="${escAttr(getImageUrl(item.imagen_url))}" alt="${escAttr(item.nombre)}" onerror="handleImgError(event)"><div><strong>${escAttr(item.nombre)}</strong><p>${item.qty} × ${formatPrecioModal(item.precio)}</p></div><button class="icon-btn" onclick="removeFromCart(${item.id})" aria-label="Quitar ${escAttr(item.nombre)}">×</button></div>`).join('') : '<p class="cart-empty">Tu carrito está vacío.</p>';
  const message = 'Hola, quisiera confirmar disponibilidad y precio de:\n' + cart.map(item => `${item.qty} × ${item.nombre} (${item.codigo})`).join('\n');
  document.querySelector('.cart-ft a').href = 'https://wa.me/51926894528?text=' + encodeURIComponent(message);
}
function openCart() { document.getElementById('cart-sidebar').classList.add('open'); document.getElementById('cart-overlay').classList.add('open'); }
function closeCart() { document.getElementById('cart-sidebar').classList.remove('open'); document.getElementById('cart-overlay').classList.remove('open'); }
function toggleCart() { document.getElementById('cart-sidebar').classList.contains('open') ? closeCart() : openCart(); }
