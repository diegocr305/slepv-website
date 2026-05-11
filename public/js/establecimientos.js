const SUPABASE_URL = 'https://gyhihuovussdauehmeuk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aGlodW92dXNzZGF1ZWhtZXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjA2NTksImV4cCI6MjA2ODMzNjY1OX0.d70DaieRw-zHAhug1ZmEn7aDBEH5k6uFBc2I2eOOP30';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Estado
let todos = [];
let filtrados = [];
let paginaActual = 1;
let porPagina = 20;
let filtroActivo = 'todos';
let busqueda = '';

// Determinar tipo
function getTipo(nivel) {
    if (!nivel) return 'escuela';
    const n = nivel.toLowerCase();
    if (n.includes('parvularia') || n.includes('jardín') || n.includes('jardin')) return 'jardin';
    if (n.includes('media') || n.includes('liceo')) return 'liceo';
    return 'escuela';
}

function getNivelLabel(tipo) {
    if (tipo === 'jardin') return { label: 'Parvularia', cls: 'badge-jardin' };
    if (tipo === 'liceo')  return { label: 'Ed. Media',  cls: 'badge-liceo' };
    return { label: 'Ed. Básica', cls: 'badge-escuela' };
}

// Filtrar y paginar
function aplicarFiltros() {
    filtrados = todos.filter(e => {
        const tipo = getTipo(e.nivel_educativo);
        const coincideTipo = filtroActivo === 'todos' || tipo === filtroActivo;
        const texto = busqueda.toLowerCase();
        const coincideTexto = !texto ||
            (e.nombre_establecimiento || '').toLowerCase().includes(texto) ||
            (e.direccion || '').toLowerCase().includes(texto) ||
            (e.nombre_director || '').toLowerCase().includes(texto);
        return coincideTipo && coincideTexto;
    });
    paginaActual = 1;
    renderizar();
}

function renderizar() {
    const total = filtrados.length;
    const totalPaginas = Math.ceil(total / porPagina);
    const inicio = (paginaActual - 1) * porPagina;
    const fin = Math.min(inicio + porPagina, total);
    const pagina = filtrados.slice(inicio, fin);

    document.getElementById('contadorResultados').textContent =
        `Mostrando ${total > 0 ? inicio + 1 : 0} - ${fin} de ${total} establecimientos`;

    renderTabla(pagina);
    renderCards(pagina);
    renderPaginacion(total, totalPaginas, inicio, fin, 'paginacion');
    renderPaginacion(total, totalPaginas, inicio, fin, 'paginacionMobile');
}

function renderTabla(pagina) {
    const tbody = document.getElementById('tablaBody');
    if (pagina.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No se encontraron establecimientos</td></tr>';
        return;
    }
    tbody.innerHTML = pagina.map(e => {
        const tipo = getTipo(e.nivel_educativo);
        const { label, cls } = getNivelLabel(tipo);
        const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent((e.direccion || '') + ', Valparaíso, Chile')}`;
        return `
        <tr>
            <td><strong>${e.nombre_establecimiento || '—'}</strong></td>
            <td><span class="nivel-badge ${cls}">${label}</span></td>
            <td>${e.nombre_director || '<span class="text-muted">—</span>'}</td>
            <td class="text-muted">${e.direccion || '—'}</td>
            <td class="text-center">
                <a href="${mapsUrl}" target="_blank" class="btn-mapa" title="Ver en mapa">
                    <i class="fas fa-map-marker-alt"></i>
                </a>
            </td>
        </tr>`;
    }).join('');
}

function renderCards(pagina) {
    const container = document.getElementById('cardsContainer');
    if (pagina.length === 0) {
        container.innerHTML = '<p class="text-center text-muted py-4">No se encontraron establecimientos</p>';
        return;
    }
    container.innerHTML = pagina.map(e => {
        const tipo = getTipo(e.nivel_educativo);
        const { label, cls } = getNivelLabel(tipo);
        const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent((e.direccion || '') + ', Valparaíso, Chile')}`;
        return `
        <div class="est-card">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <p class="est-card-title mb-0">${e.nombre_establecimiento || '—'}</p>
                <span class="nivel-badge ${cls} ms-2 flex-shrink-0">${label}</span>
            </div>
            ${e.nombre_director ? `<p class="est-card-meta mb-1"><i class="fas fa-user me-1"></i>${e.nombre_director}</p>` : ''}
            <p class="est-card-meta mb-2"><i class="fas fa-map-marker-alt me-1"></i>${e.direccion || '—'}</p>
            <a href="${mapsUrl}" target="_blank" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-map-marker-alt me-1"></i>Ver en mapa
            </a>
        </div>`;
    }).join('');
}

function renderPaginacion(total, totalPaginas, inicio, fin, contenedorId) {
    const container = document.getElementById(contenedorId);
    if (totalPaginas <= 1) { container.innerHTML = ''; return; }

    const maxBotones = 5;
    let startPage = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
    let endPage = Math.min(totalPaginas, startPage + maxBotones - 1);
    if (endPage - startPage < maxBotones - 1) startPage = Math.max(1, endPage - maxBotones + 1);

    let html = `<span class="page-info me-2">Mostrando <strong>${inicio + 1}–${fin}</strong> de <strong>${total}</strong></span>`;
    html += `<button ${paginaActual === 1 ? 'disabled' : ''} onclick="irPagina(${paginaActual - 1}, '${contenedorId}')"><i class="fas fa-chevron-left"></i></button>`;

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="${i === paginaActual ? 'active' : ''}" onclick="irPagina(${i}, '${contenedorId}')">${i}</button>`;
    }

    html += `<button ${paginaActual === totalPaginas ? 'disabled' : ''} onclick="irPagina(${paginaActual + 1}, '${contenedorId}')"><i class="fas fa-chevron-right"></i></button>`;
    container.innerHTML = html;
}

function irPagina(n, contenedorId) {
    paginaActual = n;
    renderizar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Cargar datos
async function cargarEstablecimientos() {
    try {
        const { data, error } = await supabaseClient
            .from('slep_establecimientos')
            .select('id, nombre_establecimiento, direccion, nombre_director, correo_director, nivel_educativo')
            .order('nombre_establecimiento');

        if (error) throw error;
        todos = data;
        filtrados = todos;
        renderizar();
    } catch (err) {
        console.error('Error:', err);
        document.getElementById('tablaBody').innerHTML =
            '<tr><td colspan="5" class="text-center py-4 text-danger">Error al cargar los establecimientos</td></tr>';
        document.getElementById('cardsContainer').innerHTML =
            '<p class="text-center text-danger">Error al cargar los establecimientos</p>';
    }
}

// Eventos
document.addEventListener('DOMContentLoaded', () => {
    cargarEstablecimientos();

    // Chips filtro
    document.querySelectorAll('.chip').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtroActivo = btn.dataset.filtro;
            aplicarFiltros();
        });
    });

    // Buscador
    document.getElementById('buscadorEstablecimientos').addEventListener('input', e => {
        busqueda = e.target.value;
        aplicarFiltros();
    });

    // Por página
    document.getElementById('porPagina').addEventListener('change', e => {
        porPagina = parseInt(e.target.value);
        paginaActual = 1;
        renderizar();
    });
});
