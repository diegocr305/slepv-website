// Base de datos de noticias (ordenadas por fecha más reciente)
const noticias = [
    {
        id: 12,
        titulo: "Dirección de Educación Pública presentó a nuevo director ejecutivo suplente del SLEP Valparaíso",
        resumen: "Miguel Solís Olivera fue designado por el Presidente de la República para conducir el Servicio Local, con foco en la mejora de los aprendizajes y el fortalecimiento de la gestión administrativa del SLEP.",
        fecha: "2026-07-09",
        fechaTexto: "9 de julio, 2026",
        imagen: "img_news/nuevo_director_suplente/Autoridades presidenciales con el Director ejecutivo suplente del SLEP Valparaíso.jpeg",
        enlace: "noticias/nuevo-director-suplente.html"
    },
    {
        id: 11,
        titulo: "Nuevos laboratorios de computación fortalecerán la educación digital en escuelas públicas de Valparaíso",
        resumen: "La iniciativa \"Comunidades Digitales\" renovó espacios tecnológicos en el Colegio Pablo Neruda y la Escuela Joaquín Edwards Bello, gracias al trabajo conjunto entre Fundación Kodea, American Tower Chile y el SLEP Valparaíso.",
        fecha: "2026-06-17",
        fechaTexto: "17 de junio, 2026",
        imagen: "img_news/laboratorios_computacion/Nuevos laboratorios de computación.jpeg",
        enlace: "noticias/laboratorios-computacion.html"
    },
    {
        id: 10,
        titulo: "SLEP Valparaíso y Ganamar presentan kit pedagógico con inspiración marítima",
        resumen: "Lanzamiento fue realizado en la Playa San Mateo, oportunidad en que se destacaron las bondades de trabajar en alianza de instituciones públicas y privadas para acercar la cultura oceánica a los estudiantes.",
        fecha: "2026-05-28",
        fechaTexto: "28 de mayo, 2026",
        imagen: "img_news/kit_pedagogico/kit_pedagogico.jpg",
        enlace: "noticias/kit-pedagogico-ganamar.html"
    },
    {
        id: 9,
        titulo: "Autoridades de educación fueron parte de celebración del Día del Estudiante en escuela pública",
        resumen: "Compartiendo un desayuno especial y jugando bingo, los estudiantes de la Escuela Juan José Latorre celebraron el Día del Estudiante junto al Seremi de Educación y el director ejecutivo (s) de SLEP Valparaíso.",
        fecha: "2026-05-11",
        fechaTexto: "11 de mayo, 2026",
        imagen: "img_news/dia_del_estudiante/Día del Estudiante 1.JPG",
        enlace: "noticias/dia-del-estudiante.html"
    },
    {
        id: 8,
        titulo: "SLEP Valparaíso marca avances en la educación y proyecta nuevos desafíos en su cuenta pública",
        resumen: "El SLEP Valparaíso realizó su Cuenta Pública 2026, presentando avances en resultados SIMCE, más de 600 asesorías pedagógicas, inversiones en infraestructura y un emotivo reconocimiento al director de la Orquesta Pública Estudiantil.",
        fecha: "2026-04-24",
        fechaTexto: "24 de abril, 2026",
        imagen: "img_news/cuenta_publica_2026/Cuenta Pública SLEP 2025 (70).jpg",
        enlace: "noticias/cuenta-publica-2025.html"
    },
    {
        id: 7,
        titulo: "Comunicado de Prensa: SLEP Valparaíso designa nuevo Director Ejecutivo Subrogante",
        resumen: "SLEP Valparaíso comunica que a partir del lunes 23 de marzo, Claudio Sepúlveda Cabrera asume como Director Ejecutivo Subrogante del Servicio Local de Educación Pública Valparaíso.",
        fecha: "2026-03-17",
        fechaTexto: "17 de marzo, 2026",
        imagen: "img_news/comunicado_prensa/Comunicado de prensa.png",
        enlace: "noticias/noticia7.html"
    },
    {
        id: 6,
        titulo: "Satisfactoria presentación de SLEP Valparaíso y la Asociación de Madres, Padres y Apoderados en comisión tripartita de Educación, Seguridad y Familia en el Gobierno Regional",
        resumen: "En la búsqueda de mejorar las condiciones en pro de las y los estudiantes de Valparaíso y sus familias, el director ejecutivo de SLEP Valparaíso, Pablo Mecklenburg y la Asociación de Madres, Padres y Apoderados expusieron sobre la necesidad de mayor seguridad para los establecimientos educacionales.",
        fecha: "2026-01-07",
        fechaTexto: "7 de Enero, 2026",
        imagen: "img_news/comision_tripartita/SLEP Valparaíso y la Asociación de Madres, Padres y Apoderados en comisión tripartita de Educación, Seguridad y Familia en el Gobierno Regional.jpeg",
        enlace: "noticias/noticia6.html"
    },
    {
        id: 5,
        titulo: "Escuela Intercultural de Laguna Verde contará con nuevas salas modulares",
        resumen: "El SLEP Valparaíso incorporará nuevas salas modulares para mejorar las condiciones de aprendizaje y asegurar espacios adecuados para toda la comunidad educativa del establecimiento de Laguna Verde.",
        fecha: "2025-11-06",
        fechaTexto: "6 de Noviembre, 2025",
        imagen: "img_news/laguna_verde_sala_modulares/Laguna Verde contará con nuevas salas modulares.jpeg",
        enlace: "noticias/noticia5.html"
    },
    {
        id: 4,
        titulo: "Doce integrantes asumen como representantes del nuevo Consejo Local 2025-2027",
        resumen: "Con nuevos bríos y las ganas de fortalecer la educación pública de Valparaíso, mediante la participación ciudadana y democrática, asumieron los representantes del nuevo Consejo Local de Educación Pública para nuestro territorio.",
        fecha: "2025-11-05",
        fechaTexto: "5 de Noviembre, 2025",
        imagen: "img_news/consejo_local/Consejo en pleno.jpg",
        enlace: "noticias/noticia4.html"
    },
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

// Función para normalizar texto (quitar acentos)
function normalizarTexto(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Función para obtener parámetro de búsqueda de la URL
function obtenerParametroBusqueda() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('q');
}

// Función para filtrar noticias por término de búsqueda
function filtrarNoticias(termino) {
    if (!termino) return noticias;
    
    const terminoNormalizado = normalizarTexto(termino);
    
    return noticias.filter(noticia => {
        const tituloNormalizado = normalizarTexto(noticia.titulo);
        const resumenNormalizado = normalizarTexto(noticia.resumen);
        
        return tituloNormalizado.includes(terminoNormalizado) || 
               resumenNormalizado.includes(terminoNormalizado);
    });
}

// Función para crear HTML de una noticia
function crearNoticiaHTML(noticia) {
    return `
        <div class="col-md-3 mb-4">
            <div class="card h-100 feature-card">
                <img src="${noticia.imagen}" class="card-img-top" alt="${noticia.titulo}">
                <div class="card-body d-flex flex-column">
                    <small class="text-muted">${noticia.fechaTexto}</small>
                    <h5 class="card-title">${noticia.titulo}</h5>
                    <a href="${noticia.enlace}" class="mt-auto btn-kit-primary btn-kit-small">Leer más</a>
                </div>
            </div>
        </div>
    `;
}

// Función para cargar noticias destacadas (las 4 más recientes)
function cargarNoticiasDestacadas() {
    const container = document.getElementById('noticias-destacadas');
    if (!container) return;
    
    // Ordenar por fecha (más reciente primero) y tomar las 4 primeras
    const noticiasRecientes = noticias
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 4);
    
    container.innerHTML = noticiasRecientes.map(noticia => crearNoticiaHTML(noticia)).join('');
}

// Función para cargar todas las noticias (para la página de noticias)
function cargarTodasLasNoticias() {
    const container = document.getElementById('todas-noticias');
    if (!container) return;
    
    // Obtener término de búsqueda
    const terminoBusqueda = obtenerParametroBusqueda();
    
    // Filtrar noticias si hay búsqueda
    let noticiasAMostrar = terminoBusqueda ? filtrarNoticias(terminoBusqueda) : noticias;
    
    // Ordenar por fecha (más reciente primero)
    noticiasAMostrar = noticiasAMostrar.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Mostrar barra de búsqueda si hay término
    if (terminoBusqueda) {
        const searchBar = document.getElementById('searchBar');
        const searchTerm = document.getElementById('searchTerm');
        const resultCount = document.getElementById('resultCount');
        
        if (searchBar && searchTerm && resultCount) {
            searchBar.style.display = 'block';
            searchTerm.textContent = `"${terminoBusqueda}"`;
            resultCount.textContent = `${noticiasAMostrar.length} resultado${noticiasAMostrar.length !== 1 ? 's' : ''}`;
        }
    }
    
    // Mostrar mensaje si no hay resultados
    if (noticiasAMostrar.length === 0 && terminoBusqueda) {
        const noResults = document.getElementById('noResults');
        const noResultsTerm = document.getElementById('noResultsTerm');
        
        if (noResults && noResultsTerm) {
            noResults.style.display = 'block';
            noResultsTerm.textContent = terminoBusqueda;
        }
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = noticiasAMostrar.map(noticia => crearNoticiaHTML(noticia)).join('');
}

// Cargar noticias al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarNoticiasDestacadas();
    cargarTodasLasNoticias();
});