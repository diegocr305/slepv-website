// Base de datos de noticias (ordenadas por fecha más reciente)
const noticias = [
    {
        id: 1,
        titulo: "Educación pública piensa en Valparaíso para volver a poner la mirada en el francés",
        resumen: "Talleres que se realizarán en 2026, en dos escuelas porteñas, servirán como evaluación para un posible retorno de esta lengua al currículum nacional.",
        fecha: "2025-10-24",
        fechaTexto: "24 de Octubre, 2025",
        imagen: "img_news/Tema francés.jpg",
        enlace: "noticias/noticia1.html"
    },
    {
        id: 2,
        titulo: "SLEP logra acuerdo con comunidades y planifica en conjunto el traslado de estudiantes a la Escuela Juan de Saavedra",
        resumen: "Esta semana se formalizó decisión del Servicio Local y para ello se reunió con representantes de los dos establecimientos involucrados, aunando voluntades y planificando desde ya los detalles que necesitan todas las partes para lograr una vinculación armónica.",
        fecha: "2025-10-23",
        fechaTexto: "23 de Octubre, 2025",
        imagen: "img_news/Acuerdo traslado.jpg",
        enlace: "noticias/noticia3.html"
    },
    {
        id: 3,
        titulo: "Estudiantes de la educación pública porteña potenciarán el deporte gracias a donación de los Juegos Panamericanos 2023",
        resumen: "Se trata de implementación deportiva, nueva, que será repartida en diferentes establecimientos de SLEP Valparaíso. Ceremonia de traspaso contó con presencia del histórico handbolista Marco Oneto.",
        fecha: "2025-10-22",
        fechaTexto: "22 de Octubre, 2025",
        imagen: "img_news/Donación.jpg",
        enlace: "noticias/noticia2.html"
    }
];

// Función para crear HTML de una noticia
function crearNoticiaHTML(noticia) {
    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100 feature-card">
                <img src="${noticia.imagen}" class="card-img-top" alt="${noticia.titulo}">
                <div class="card-body d-flex flex-column">
                    <small class="text-muted">${noticia.fechaTexto}</small>
                    <h5 class="card-title">${noticia.titulo}</h5>
                    <p class="card-text">${noticia.resumen}</p>
                    <a href="${noticia.enlace}" class="mt-auto btn-kit-primary btn-kit-small">Leer más</a>
                </div>
            </div>
        </div>
    `;
}

// Función para cargar noticias destacadas (las 3 más recientes)
function cargarNoticiasDestacadas() {
    const container = document.getElementById('noticias-destacadas');
    if (!container) return;
    
    // Ordenar por fecha (más reciente primero) y tomar las 3 primeras
    const noticiasRecientes = noticias
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 3);
    
    container.innerHTML = noticiasRecientes.map(noticia => crearNoticiaHTML(noticia)).join('');
}

// Función para cargar todas las noticias (para la página de noticias)
function cargarTodasLasNoticias() {
    const container = document.getElementById('todas-noticias');
    if (!container) return;
    
    // Ordenar por fecha (más reciente primero)
    const noticiasOrdenadas = noticias
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    container.innerHTML = noticiasOrdenadas.map(noticia => crearNoticiaHTML(noticia)).join('');
}

// Cargar noticias al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarNoticiasDestacadas();
    cargarTodasLasNoticias();
});