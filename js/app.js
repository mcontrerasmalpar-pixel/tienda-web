// ── Toggle carrito ──────────────────────────
function toggleCart() {
  document.getElementById('cart-sidebar').classList.toggle('open');
  document.getElementById('cart-overlay').classList.toggle('open');
}

// ── Toggle menú móvil ───────────────────────
function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  const btn  = document.querySelector('.menu-btn');
  const open = menu.classList.toggle('open');
  if (btn) btn.setAttribute('aria-expanded', open);
}

// ── Navbar: borde dorado al hacer scroll ────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });
