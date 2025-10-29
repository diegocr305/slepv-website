// Configuración de Supabase
const SUPABASE_URL = 'https://gyhihuovussdauehmeuk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aGlodW92dXNzZGF1ZWhtZXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjA2NTksImV4cCI6MjA2ODMzNjY1OX0.d70DaieRw-zHAhug1ZmEn7aDBEH5k6uFBc2I2eOOP30';

// Inicializar cliente Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para obtener tipo de establecimiento basado en nivel educativo
function getTipoEstablecimiento(nivelEducativo) {
    if (!nivelEducativo) return { tipo: 'escuela', badge: 'secondary', icon: '🏫', nivel: 'Educación Básica' };
    
    const nivel = nivelEducativo.toLowerCase();
    if (nivel.includes('parvularia') || nivel.includes('jardín') || nivel.includes('jardin')) {
        return { tipo: 'jardin', badge: 'warning', icon: '🌼', nivel: 'Educación Parvularia' };
    } else if (nivel.includes('media') || nivel.includes('liceo')) {
        return { tipo: 'liceo', badge: 'info', icon: '🏭', nivel: 'Educación Media' };
    } else {
        return { tipo: 'escuela', badge: 'secondary', icon: '🏫', nivel: 'Educación Básica' };
    }
}

// Función para crear HTML de un establecimiento
function crearEstablecimientoHTML(establecimiento) {
    const tipoInfo = getTipoEstablecimiento(establecimiento.nivel_educativo);
    
    return `
        <div class="col-lg-4 col-md-6 mb-4 establecimiento ${tipoInfo.tipo}">
            <div class="card h-100 feature-card">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <div class="badge bg-primary me-2">${tipoInfo.icon}</div>
                        <span class="badge bg-${tipoInfo.badge}">${tipoInfo.tipo.charAt(0).toUpperCase() + tipoInfo.tipo.slice(1)}</span>
                    </div>
                    <h5 class="card-title">${establecimiento.nombre_establecimiento}</h5>
                    <p class="card-text text-muted mb-2">📍 ${establecimiento.direccion}</p>
                    <p class="card-text"><small class="text-success">${tipoInfo.nivel}</small></p>
                    ${establecimiento.nombre_director ? `<p class="card-text"><small class="text-info">Director/a: ${establecimiento.nombre_director}</small></p>` : ''}
                    <div class="mt-auto">
                        <a href="#" class="btn-kit-secondary btn-kit-small" onclick="mostrarDetalles('${establecimiento.id}')">Ver detalles</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Función para cargar establecimientos
async function cargarEstablecimientos() {
    try {
        const { data: establecimientos, error } = await supabaseClient
            .from('slep_establecimientos')
            .select('id, nombre_establecimiento, direccion, nombre_director, correo_director, nivel_educativo')
            .order('nombre_establecimiento');

        if (error) throw error;

        const container = document.getElementById('todosEstablecimientos');
        container.innerHTML = establecimientos.map(est => crearEstablecimientoHTML(est)).join('');
        
        // Actualizar contadores por tipo
        actualizarFiltros(establecimientos);
        
    } catch (error) {
        console.error('Error cargando establecimientos:', error);
        document.getElementById('todosEstablecimientos').innerHTML = 
            '<div class="col-12"><div class="alert alert-danger">Error cargando establecimientos</div></div>';
    }
}

// Función para actualizar filtros por tipo
function actualizarFiltros(establecimientos) {
    const tipos = { escuela: 0, liceo: 0, jardin: 0 };
    
    establecimientos.forEach(est => {
        const tipoInfo = getTipoEstablecimiento(est.nivel_educativo);
        tipos[tipoInfo.tipo]++;
    });
    
    // Actualizar pestañas con contadores
    document.getElementById('escuelas-tab').textContent = `Escuelas (${tipos.escuela})`;
    document.getElementById('liceos-tab').textContent = `Liceos (${tipos.liceo})`;
    document.getElementById('jardines-tab').textContent = `Jardines (${tipos.jardin})`;
}

// Función para filtrar por tipo
function filtrarPorTipo(tipo) {
    const establecimientos = document.querySelectorAll('.establecimiento');
    establecimientos.forEach(est => {
        if (tipo === 'todos' || est.classList.contains(tipo)) {
            est.style.display = 'block';
        } else {
            est.style.display = 'none';
        }
    });
}

// Función para mostrar detalles (modal o página)
function mostrarDetalles(id) {
    // Implementar según necesidades
    console.log('Mostrar detalles del establecimiento:', id);
}

// Cargar establecimientos al cargar la página
document.addEventListener('DOMContentLoaded', cargarEstablecimientos);

// Event listeners para filtros
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('todos-tab').addEventListener('click', () => filtrarPorTipo('todos'));
    document.getElementById('escuelas-tab').addEventListener('click', () => filtrarPorTipo('escuela'));
    document.getElementById('liceos-tab').addEventListener('click', () => filtrarPorTipo('liceo'));
    document.getElementById('jardines-tab').addEventListener('click', () => filtrarPorTipo('jardin'));
});