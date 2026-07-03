window.addEventListener("DOMContentLoaded", () => {

  // ── Accesibilidad ──
  const body = document.body;

  const aplicarPreferencias = () => {
    if (localStorage.getItem('altoContraste') === '1') {
      body.classList.add('alto-contraste');
      document.getElementById('acc-contraste')?.classList.add('active');
    }
    const tamano = localStorage.getItem('tamanoTexto');
    if (tamano === 'grande') {
      body.classList.add('texto-grande');
      document.getElementById('acc-aumentar')?.classList.add('active');
    } else if (tamano === 'pequeno') {
      body.classList.add('texto-pequeno');
      document.getElementById('acc-reducir')?.classList.add('active');
    }
  };

  aplicarPreferencias();

  document.getElementById('acc-contraste')?.addEventListener('click', () => {
    const activo = body.classList.toggle('alto-contraste');
    localStorage.setItem('altoContraste', activo ? '1' : '0');
    document.getElementById('acc-contraste').classList.toggle('active', activo);
  });

  document.getElementById('acc-aumentar')?.addEventListener('click', () => {
    body.classList.remove('texto-pequeno');
    const activo = body.classList.toggle('texto-grande');
    localStorage.setItem('tamanoTexto', activo ? 'grande' : 'normal');
    document.getElementById('acc-aumentar').classList.toggle('active', activo);
    document.getElementById('acc-reducir')?.classList.remove('active');
  });

  document.getElementById('acc-reducir')?.addEventListener('click', () => {
    body.classList.remove('texto-grande');
    const activo = body.classList.toggle('texto-pequeno');
    localStorage.setItem('tamanoTexto', activo ? 'pequeno' : 'normal');
    document.getElementById('acc-reducir').classList.toggle('active', activo);
    document.getElementById('acc-aumentar')?.classList.remove('active');
  });

  // Cerrar el menú colapsable al hacer clic en un enlace
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  navLinks.forEach(function(link) {
    link.addEventListener('click', function () {
      if (navbarCollapse.classList.contains('show')) {
        navbarCollapse.classList.remove('show');
      }
    });
  });

  // Manejar el envío del formulario de contacto
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.');
      contactForm.reset();
    });
  }
});
