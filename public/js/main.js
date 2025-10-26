// Esperar a que el DOM cargue
document.addEventListener('DOMContentLoaded', function () {
  // 1. Cerrar el menú colapsable al hacer clic en un enlace (para UX en móvil)
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  navLinks.forEach(function(link) {
    link.addEventListener('click', function () {
      if (navbarCollapse.classList.contains('show')) {
        navbarCollapse.classList.remove('show');
      }
    });
  });

  // 2. Manejar el envío del formulario de contacto
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Prevenir envío real
      // Mostrar mensaje de confirmación (alerta simple)
      alert('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.');
      // Limpiar el formulario
      contactForm.reset();
    });
  }
});
