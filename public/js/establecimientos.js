// ============================================================
// Establecimientos SLEP Valparaíso — JS principal
// ============================================================

const SUPABASE_URL = 'https://gyhihuovussdauehmeuk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aGlodW92dXNzZGF1ZWhtZXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjA2NTksImV4cCI6MjA2ODMzNjY1OX0.d70DaieRw-zHAhug1ZmEn7aDBEH5k6uFBc2I2eOOP30';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Estado
let todos = [];
let filtrados = [];
let paginaActual = 1;
let porPagina = 24;
let filtroActivo = 'todos';
let busqueda = '';
let vistaActual = 'cards'; // 'cards' | 'tabla'
let mapa = null;
let marcadores = [];
let coordenadas = {}; // { id: { lat, lng } }

// ============================================================
// Clasificación por tipo
// ============================================================
function getTipo(nivel) {
  if (!nivel) return 'escuela';
  const n = nivel.toLowerCase();
  if (n.includes('parvularia') || n.includes('jardín') || n.includes('jardin')) return 'jardin';
  if (n.includes('media') || n.includes('liceo')) return 'liceo';
  return 'escuela';
}

function getNivelLabel(tipo) {
  if (tipo === 'jardin') return { label: 'Parvularia', cls: 'badge-jardin' };
  if (tipo === 'liceo') return { label: 'Ed. Media', cls: 'badge-liceo' };
  return { label: 'Ed. Básica', cls: 'badge-escuela' };
}

// ============================================================
// Mapa Leaflet
// ============================================================
function inicializarMapa() {
  mapa = L.map('mapa-establecimientos', {
    scrollWheelZoom: false
  }).setView([-33.048, -71.615], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(mapa);
}

function getIconoMarcador(tipo) {
  const colores = { escuela: '#0055A4', liceo: '#198754', jardin: '#e67e00' };
  const color = colores[tipo] || '#0055A4';
  return L.divIcon({
    className: 'marker-est',
    html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
}

function actualizarMarcadoresMapa() {
  // Limpiar marcadores previos
  marcadores.forEach(m => mapa.removeLayer(m));
  marcadores = [];

  const bounds = [];

  filtrados.forEach(e => {
    const c = coordenadas[e.id];
    if (!c || !c.lat || !c.lng) return;

    // Excluir Robinson Crusoe y puntos muy lejanos del cálculo de bounds
    const esOutlier = c.lat < -33.08 || c.lat > -33.00 || c.lng < -71.67 || c.lng > -71.55;

    const tipo = getTipo(e.nivel_educativo);
    const marker = L.marker([c.lat, c.lng], { icon: getIconoMarcador(tipo) })
      .bindPopup(`
        <strong style="font-size:0.85rem;">${e.nombre_establecimiento || '—'}</strong><br>
        <span style="font-size:0.78rem;color:#666;">${e.direccion || 'Sin dirección'}</span><br>
        ${e.correo_director ? `<a href="mailto:${e.correo_director}" style="font-size:0.75rem;"><i class="fas fa-envelope"></i> ${e.correo_director}</a>` : ''}
      `, { maxWidth: 250 })
      .addTo(mapa);

    marcadores.push(marker);

    if (!esOutlier) {
      bounds.push([c.lat, c.lng]);
    }
  });

  // Vista centrada en Valparaíso con zoom fijo para ver los puntos bien
  mapa.setView([-33.045, -71.620], 14);
}

async function cargarCoordenadas() {
  try {
    const resp = await fetch('js/coordenadas-establecimientos.json');
    if (resp.ok) {
      coordenadas = await resp.json();
    }
  } catch (err) {
    console.warn('No se pudieron cargar coordenadas:', err);
  }
}

// ============================================================
// Contadores dashboard
// ============================================================
function actualizarContadores() {
  const conteos = { todos: todos.length, escuela: 0, liceo: 0, jardin: 0 };
  todos.forEach(e => {
    const tipo = getTipo(e.nivel_educativo);
    conteos[tipo]++;
  });

  document.getElementById('count-todos').textContent = conteos.todos;
  document.getElementById('count-escuelas').textContent = conteos.escuela;
  document.getElementById('count-liceos').textContent = conteos.liceo;
  document.getElementById('count-jardines').textContent = conteos.jardin;
}

// ============================================================
// Filtros y búsqueda
// ============================================================
function aplicarFiltros() {
  filtrados = todos.filter(e => {
    const tipo = getTipo(e.nivel_educativo);
    const coincideTipo = filtroActivo === 'todos' || tipo === filtroActivo;
    const texto = busqueda.toLowerCase();
    const coincideTexto = !texto ||
      (e.nombre_establecimiento || '').toLowerCase().includes(texto) ||
      (e.direccion || '').toLowerCase().includes(texto);
    return coincideTipo && coincideTexto;
  });
  paginaActual = 1;
  renderizar();
  actualizarMarcadoresMapa();
}

// ============================================================
// Renderizado
// ============================================================
function renderizar() {
  const total = filtrados.length;
  const totalPaginas = Math.ceil(total / porPagina);
  const inicio = (paginaActual - 1) * porPagina;
  const fin = Math.min(inicio + porPagina, total);
  const pagina = filtrados.slice(inicio, fin);

  document.getElementById('contadorResultados').textContent =
    `Mostrando ${total > 0 ? inicio + 1 : 0}–${fin} de ${total} establecimientos`;

  renderCards(pagina);
  renderTabla(pagina);
  renderPaginacion(total, totalPaginas);
}

function renderCards(pagina) {
  const container = document.getElementById('cardsContainer');
  if (pagina.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5" style="grid-column: 1 / -1;">
        <i class="fas fa-search fa-2x text-muted mb-3"></i>
        <p class="text-muted">No se encontraron establecimientos con ese criterio.</p>
      </div>`;
    return;
  }
  container.innerHTML = pagina.map(e => {
    const tipo = getTipo(e.nivel_educativo);
    const { label, cls } = getNivelLabel(tipo);
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent((e.direccion || '') + ', Valparaíso, Chile')}`;
    const emailLink = e.correo_director
      ? `<a href="mailto:${e.correo_director}" class="btn-email"><i class="fas fa-envelope"></i> Contactar</a>`
      : '';
    return `
      <div class="est-card">
        <div class="d-flex justify-content-between align-items-start">
          <p class="est-card-name mb-0">${e.nombre_establecimiento || '—'}</p>
          <span class="nivel-badge ${cls} ms-2 flex-shrink-0">${label}</span>
        </div>
        <div class="mt-2">
          <p class="est-card-info"><i class="fas fa-map-marker-alt"></i> ${e.direccion || 'Sin dirección'}</p>
          ${e.correo_director ? `<p class="est-card-info"><i class="fas fa-envelope"></i> ${e.correo_director}</p>` : ''}
        </div>
        <div class="est-card-actions">
          ${emailLink}
          <a href="${mapsUrl}" target="_blank" class="btn-ubicacion"><i class="fas fa-map-marker-alt"></i> Ver mapa</a>
        </div>
      </div>`;
  }).join('');
}

function renderTabla(pagina) {
  const tbody = document.getElementById('tablaBody');
  if (pagina.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted"><i class="fas fa-search me-2"></i>No se encontraron establecimientos</td></tr>';
    return;
  }
  tbody.innerHTML = pagina.map(e => {
    const tipo = getTipo(e.nivel_educativo);
    const { label, cls } = getNivelLabel(tipo);
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent((e.direccion || '') + ', Valparaíso, Chile')}`;
    const emailBtn = e.correo_director
      ? `<a href="mailto:${e.correo_director}" class="btn btn-sm btn-outline-primary" title="${e.correo_director}" style="font-size:0.75rem;padding:3px 10px;"><i class="fas fa-envelope me-1"></i>Email</a>`
      : '<span class="text-muted" style="font-size:0.8rem;">—</span>';
    return `
      <tr>
        <td><strong>${e.nombre_establecimiento || '—'}</strong></td>
        <td><span class="nivel-badge ${cls}">${label}</span></td>
        <td class="text-muted">${e.direccion || '—'}</td>
        <td class="text-center">${emailBtn}</td>
        <td class="text-center">
          <a href="${mapsUrl}" target="_blank" class="btn btn-sm btn-outline-success" style="font-size:0.75rem;padding:3px 10px;" title="Ver en Google Maps">
            <i class="fas fa-map-marker-alt"></i>
          </a>
        </td>
      </tr>`;
  }).join('');
}

function renderPaginacion(total, totalPaginas) {
  const container = document.getElementById('paginacion');
  if (totalPaginas <= 1) { container.innerHTML = ''; return; }

  const maxBotones = 5;
  let startPage = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
  let endPage = Math.min(totalPaginas, startPage + maxBotones - 1);
  if (endPage - startPage < maxBotones - 1) startPage = Math.max(1, endPage - maxBotones + 1);

  const inicio = (paginaActual - 1) * porPagina;
  const fin = Math.min(inicio + porPagina, total);

  let html = `<span class="page-info me-3">${inicio + 1}–${fin} de <strong>${total}</strong></span>`;
  html += `<button ${paginaActual === 1 ? 'disabled' : ''} onclick="irPagina(${paginaActual - 1})" aria-label="Página anterior"><i class="fas fa-chevron-left"></i></button>`;
  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="${i === paginaActual ? 'active' : ''}" onclick="irPagina(${i})">${i}</button>`;
  }
  html += `<button ${paginaActual === totalPaginas ? 'disabled' : ''} onclick="irPagina(${paginaActual + 1})" aria-label="Página siguiente"><i class="fas fa-chevron-right"></i></button>`;
  container.innerHTML = html;
}

function irPagina(n) {
  paginaActual = n;
  renderizar();
  document.getElementById('contadorResultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
// Toggle vista
// ============================================================
function cambiarVista(vista) {
  vistaActual = vista;
  const cardsEl = document.getElementById('vistaCards');
  const tablaEl = document.getElementById('vistaTabla');
  const btnCards = document.getElementById('btnVistaCards');
  const btnTabla = document.getElementById('btnVistaTabla');

  if (vista === 'cards') {
    cardsEl.style.display = '';
    tablaEl.style.display = 'none';
    btnCards.classList.add('active');
    btnTabla.classList.remove('active');
  } else {
    cardsEl.style.display = 'none';
    tablaEl.style.display = '';
    btnTabla.classList.add('active');
    btnCards.classList.remove('active');
  }
}

// ============================================================
// Cargar datos
// ============================================================
async function cargarEstablecimientos() {
  try {
    const { data, error } = await supabaseClient
      .from('slep_establecimientos')
      .select('id, nombre_establecimiento, direccion, nombre_director, correo_director, nivel_educativo')
      .order('nombre_establecimiento');

    if (error) throw error;
    todos = data;
    filtrados = todos;
    actualizarContadores();
    renderizar();
    actualizarMarcadoresMapa();
  } catch (err) {
    console.error('Error cargando establecimientos:', err);
    document.getElementById('cardsContainer').innerHTML =
      '<p class="text-center text-danger py-4"><i class="fas fa-exclamation-triangle me-2"></i>Error al cargar los establecimientos. Intenta recargar la página.</p>';
    document.getElementById('tablaBody').innerHTML =
      '<tr><td colspan="5" class="text-center py-4 text-danger">Error al cargar los establecimientos</td></tr>';
  }
}

// ============================================================
// Inicialización
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  inicializarMapa();
  await cargarCoordenadas();
  await cargarEstablecimientos();

  // Dashboard como filtros
  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      filtroActivo = card.dataset.filtro;
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

  // Toggle vista
  document.getElementById('btnVistaCards').addEventListener('click', () => cambiarVista('cards'));
  document.getElementById('btnVistaTabla').addEventListener('click', () => cambiarVista('tabla'));
});
