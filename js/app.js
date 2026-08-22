// Gin&Jes App
console.log('Gin&Jes • Tienda iniciada ✨');

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(0,0,0,0.98)';
    navbar.style.backdropFilter = 'blur(10px)';
  } else {
    navbar.style.background = '#000';
  }
});

// Contact form
function handleContact(e) {
  e.preventDefault();
  alert('\u2728 Mensaje enviado. Te contactaremos pronto.');
  e.target.reset();
}

// Keyboard close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeCart();
  }
});
