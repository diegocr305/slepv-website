// Funcionalidad principal SLEP Valparaíso

window.addEventListener("DOMContentLoaded", () => {
    // Navegación suave
    initSmoothScrolling();
    
    // Filtros de documentación
    initDocumentationFilters();
    
    // Animaciones al hacer scroll
    initScrollAnimations();
    
    // Navbar activo
    updateActiveNavLink();
});

// Navegación suave para enlaces internos
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Filtros para la página de documentación
function initDocumentationFilters() {
    const filtroTipo = document.getElementById('filtroTipo');
    const filtroAno = document.getElementById('filtroAno');
    const documentos = document.querySelectorAll('.documento');
    
    if (filtroTipo && filtroAno && documentos.length > 0) {
        
        function filterDocuments() {
            const tipoSeleccionado = filtroTipo.value;
            const anoSeleccionado = filtroAno.value;
            
            documentos.forEach(documento => {
                const tipoDocumento = documento.getAttribute('data-tipo');
                const anoDocumento = documento.getAttribute('data-ano');
                
                const coincideTipo = !tipoSeleccionado || tipoDocumento === tipoSeleccionado;
                const coincideAno = !anoSeleccionado || anoDocumento === anoSeleccionado;
                
                if (coincideTipo && coincideAno) {
                    documento.style.display = 'block';
                    documento.classList.add('fade-in-up');
                } else {
                    documento.style.display = 'none';
                    documento.classList.remove('fade-in-up');
                }
            });
        }
        
        filtroTipo.addEventListener('change', filterDocuments);
        filtroAno.addEventListener('change', filterDocuments);
    }
}

// Animaciones al hacer scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observar cards y secciones
    const elementsToAnimate = document.querySelectorAll('.card, section');
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

// Actualizar enlace activo en navbar
function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html') ||
            (currentPage === 'index.html' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Función para toggle de navbar en móvil
function toggleMobileNav() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            navbarCollapse.classList.toggle('show');
        });
        
        // Cerrar menú al hacer click en un enlace
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth < 992) {
                    navbarCollapse.classList.remove('show');
                }
            });
        });
    }
}

// Función para validar formularios (si se necesita en el futuro)
function validateForm(formId) {
    const form = document.getElementById(formId);
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    isValid = false;
                } else {
                    input.classList.remove('is-invalid');
                    input.classList.add('is-valid');
                }
            });
            
            if (isValid) {
                // Procesar formulario
                console.log('Formulario válido');
            }
        });
    }
}

// Función para mostrar/ocultar contenido
function toggleContent(buttonId, contentId) {
    const button = document.getElementById(buttonId);
    const content = document.getElementById(contentId);
    
    if (button && content) {
        button.addEventListener('click', function() {
            content.classList.toggle('d-none');
            
            const isHidden = content.classList.contains('d-none');
            button.textContent = isHidden ? 'Mostrar más' : 'Mostrar menos';
        });
    }
}

// Inicializar tooltips de Bootstrap (si se usan)
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Función para lazy loading de imágenes
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}