// Configuración de Supabase
const SUPABASE_URL = 'https://gyhihuovussdauehmeuk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aGlodW92dXNzZGF1ZWhtZXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjA2NTksImV4cCI6MjA2ODMzNjY1OX0.d70DaieRw-zHAhug1ZmEn7aDBEH5k6uFBc2I2eOOP30';

// Inicializar cliente Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para obtener tipo de establecimiento basado en nivel educativo
function getTipoEstablecimiento(nivelEducativo) {
    if (!nivelEducativo) return { tipo: 'escuela', badge: 'secondary', icon: '🏫' };
    
    if (nivelEducativo.includes('parvularia') || nivelEducativo.includes('jardín') || nivelEducativo.includes('jardin')) {
        return { tipo: 'jardin', badge: 'warning', icon: '🌼' };
    } else if (nivelEducativo.includes('media') || nivelEducativo.includes('liceo')) {
        return { tipo: 'liceo', badge: 'info', icon: '🏭' };
    } else {
        return { tipo: 'escuela', badge: 'secondary', icon: '🏫' };
    }
}

// Función para crear HTML de un establecimiento
function crearEstablecimientoHTML(establecimiento) {
    const tipoInfo = getTipoEstablecimiento(establecimiento.nivel_educativo);
    const direccionMaps = encodeURIComponent(establecimiento.direccion + ', Valparaíso, Chile');
    
    return `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-3 establecimiento ${tipoInfo.tipo}">
            <div class="card h-100 feature-card">
                <div class="card-body p-3">
                    <h6 class="card-title mb-2">${establecimiento.nombre_establecimiento}</h6>
                    <p class="card-text text-muted mb-1 small">📍 ${establecimiento.direccion}</p>
                    ${establecimiento.nombre_director ? `<p class="card-text mb-1"><small class="text-info">Director/a: ${establecimiento.nombre_director}</small></p>` : ''}
                    ${establecimiento.correo_director ? `<p class="card-text mb-2"><small class="text-secondary">📧 ${establecimiento.correo_director}</small></p>` : ''}
                    <div class="mt-auto">
                        <a href="https://maps.google.com/?q=${direccionMaps}" target="_blank" class="btn-kit-secondary btn-kit-small">📍 Ver ubicación</a>
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
        

        
    } catch (error) {
        console.error('Error cargando establecimientos:', error);
        document.getElementById('todosEstablecimientos').innerHTML = 
            '<div class="col-12"><div class="alert alert-danger">Error cargando establecimientos</div></div>';
    }
}





// Cargar establecimientos al cargar la página
document.addEventListener('DOMContentLoaded', cargarEstablecimientos);

