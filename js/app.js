function toggleCart() {
  document.getElementById('cart-sidebar').classList.toggle('open');
  document.getElementById('cart-overlay').classList.toggle('open');
}

function toggleMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
}

function handleContact(e) {
  e.preventDefault();
  alert('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.');
  e.target.reset();
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const nb = document.getElementById('navbar');
  if (window.scrollY > 60) {
    nb.style.borderBottomColor = 'rgba(201,168,76,.35)';
  } else {
    nb.style.borderBottomColor = 'rgba(201,168,76,.18)';
  }
});
