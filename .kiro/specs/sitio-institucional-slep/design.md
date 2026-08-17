# Diseño Técnico — Sitio Institucional SLEP Valparaíso

> **Documento retrospectivo** — captura el estado actual del sitio en producción en https://slepvalparaiso.cl.
> Sirve como referencia técnica canónica para cualquier desarrollador que quiera entender, mantener o extender el sitio.

---

## Overview

El Sitio Institucional del SLEP Valparaíso es la presencia digital oficial del Servicio Local de Educación Pública de Valparaíso, organismo creado por la Ley 21.040. El sitio centraliza noticias, directorio de establecimientos, documentación pública y mecanismos de participación ciudadana.

### Patrones arquitectónicos

El sitio implementa el patrón **MPA estática (Multi-Page Application)** con las siguientes características:

- Sin framework frontend — HTML5 + Bootstrap 5 + Vanilla JS ES6+
- Sin build step, bundler ni transpiler — los archivos se sirven tal cual
- Routing basado en archivos HTML (un archivo = una ruta)
- Servidor en desarrollo = thin wrapper de Express sobre el filesystem
- Servidor en producción = NGINX (Bitnami) copiando `public/` al html root
- Datos de establecimientos = Supabase JS v2 (fetch remoto)
- Datos de noticias = array hardcodeado en JavaScript


---

## Architecture

### Diagrama de arquitectura general

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)                       │
│                                                             │
│  HTML5 pages  ←──  Bootstrap 5 CDN                         │
│                ←──  AOS 2.3.1 CDN                           │
│                ←──  Font Awesome 6.4 CDN                    │
│                ←──  Supabase JS v2 CDN                      │
│                ←──  public/css/custom.css                   │
│                ←──  public/js/main.js (global)              │
│                ←──  public/js/noticias.js (páginas noticias)│
│                ←──  public/js/establecimientos.js (direc.)  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP
              ┌─────────────┴──────────────┐
              │                            │
   ┌──────────▼──────────┐   ┌─────────────▼───────────────┐
   │  DESARROLLO LOCAL   │   │     PRODUCCIÓN (Internet)    │
   │                     │   │                              │
   │  Node.js ≥ 22       │   │  NGINX (Bitnami)             │
   │  Express ^4.19.2    │   │  https://slepvalparaiso.cl   │
   │  localhost:3000      │   │  /opt/bitnami/nginx/html/    │
   │                     │   │                              │
   │  server.js          │   │  Copia manual de public/     │
   │  └─ public/ estático│   │  via SSH + cp                │
   │  └─ /health         │   │                              │
   └─────────────────────┘   └──────────────────────────────┘
                                            │
                                            │ HTTPS (JS fetch)
                                  ┌─────────▼──────────┐
                                  │   Supabase Cloud    │
                                  │                     │
                                  │  tabla:             │
                                  │  slep_establecimientos│
                                  │                     │
                                  │  URL: gyhihuovus... │
                                  │  .supabase.co       │
                                  └─────────────────────┘
```

### Flujo de requests en producción

```
Browser ──GET /establecimientos──► NGINX
NGINX ──serve──► /opt/bitnami/nginx/html/establecimientos.html
Browser parseHTML ──load──► CDN Bootstrap, CDN Supabase JS, etc.
Browser DOMContentLoaded ──► establecimientos.js
establecimientos.js ──fetch──► Supabase REST API
Supabase ──JSON response──► establecimientos.js
establecimientos.js ──render──► DOM (tabla + cards)
```


---

## Components and Interfaces

### Mapa de componentes

```
┌──────────────────────────────────────────────────────────────┐
│                     public/ (Web Root)                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 ESTRUCTURA DE PÁGINA                    │ │
│  │  (duplicada manualmente en cada .html)                  │ │
│  │                                                         │ │
│  │  .gov-stripe-header  ←── franja tricolor chilena        │ │
│  │  .top-bar            ←── trámites, correo, redes        │ │
│  │  nav.navbar-custom   ←── Bootstrap navbar (global)      │ │
│  │  main > [secciones]  ←── contenido de la página         │ │
│  │  footer.footer-gov   ←── pie con 4 columnas             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────┐ │
│  │   main.js    │  │  noticias.js   │  │establecimientos.js│ │
│  │  (global)    │  │ (news pages)   │  │ (directory page) │ │
│  │              │  │                │  │                  │ │
│  │ accesibilidad│  │ array noticias │  │ Supabase fetch   │ │
│  │ navbar móvil │  │ filtrarNoticias│  │ aplicarFiltros   │ │
│  │ form contacto│  │ cargarDestac.  │  │ renderTabla      │ │
│  │              │  │ cargarTodas    │  │ renderCards      │ │
│  └──────────────┘  └────────────────┘  │ renderPaginacion │ │
│                                        └──────────────────┘ │
│                                                              │
│  ┌──────────────────────┐   ┌──────────────────────────────┐ │
│  │   css/custom.css     │   │   Páginas HTML                │ │
│  │                      │   │                              │ │
│  │ paleta gov Chile     │   │ index.html                   │ │
│  │ .navbar-custom       │   │ conocenos.html               │ │
│  │ .gov-stripe-*        │   │ noticias.html                │ │
│  │ .acceso-card (flip)  │   │ establecimientos.html        │ │
│  │ .nivel-badge         │   │ documentacion.html           │ │
│  │ .alto-contraste      │   │ participacion.html           │ │
│  │ .texto-grande/pequeno│   │ consulta-ciudadana.html      │ │
│  │ .btn-kit-primary     │   │ gestor-documental.html       │ │
│  └──────────────────────┘   │ recursos-internos.html       │ │
│                              │ noticias/*.html (11 arts.)   │ │
│                              └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### server.js — Servidor de desarrollo

El servidor Express es intencionalmente minimalista. Sus tres responsabilidades son:

1. Servir `public/` como directorio estático (maneja CSS, JS, imágenes, PDFs, HTML)
2. Exponer el endpoint `/health` para health checks
3. Registrar rutas limpias (sin `.html`) para desarrollo local

```javascript
// Rutas limpias registradas en server.js
['conocenos', 'noticias', 'participacion', 'establecimientos',
 'documentacion', 'gestor-documental', 'recursos-internos',
 'consulta-ciudadana']
// Cada ruta sirve public/<ruta>.html
```

**Nota:** En producción (NGINX), los archivos se sirven directamente con extensión `.html`. Las rutas limpias sólo funcionan en el servidor Express de desarrollo.


### main.js — Módulo global

Cargado en todas las páginas. Punto de entrada único: `window.addEventListener('DOMContentLoaded', ...)`.

**Responsabilidades:**

| Responsabilidad | IDs de elementos afectados | Almacenamiento |
|---|---|---|
| Restaurar preferencias de accesibilidad | `body`, `#acc-contraste`, `#acc-aumentar`, `#acc-reducir` | `localStorage` |
| Toggle alto contraste | `body.alto-contraste`, `#acc-contraste.active` | `localStorage['altoContraste']` = `'1'` / `'0'` |
| Toggle tamaño texto grande | `body.texto-grande`, `#acc-aumentar.active` | `localStorage['tamanoTexto']` = `'grande'` |
| Toggle tamaño texto pequeño | `body.texto-pequeno`, `#acc-reducir.active` | `localStorage['tamanoTexto']` = `'pequeno'` |
| Colapso navbar móvil | `.navbar-nav .nav-link`, `.navbar-collapse` | (sin almacenamiento) |
| Formulario de contacto (fallback) | `#contact-form` | (sin almacenamiento) |

**Lógica de exclusión mutua de tamaño de texto:**
- Activar `texto-grande` remueve `texto-pequeno` y desactiva `#acc-reducir`
- Activar `texto-pequeno` remueve `texto-grande` y desactiva `#acc-aumentar`
- Al restaurar preferencias, sólo se aplica el último estado guardado

**Nota sobre nav activo:** La documentación legacy del memory-bank indica que main.js maneja el enlace activo de la navbar, pero el código actual no implementa esa lógica en main.js. Cada página lo maneja mediante script inline o no lo implementa.

### noticias.js — Módulo de noticias

```
┌─────────────────────────────────────────────────┐
│              noticias.js                         │
│                                                 │
│  const noticias = [...]  ← array hardcodeado    │
│                           (11 objetos, id 1-11) │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Funciones de soporte                    │   │
│  │                                         │   │
│  │ normalizarTexto(texto)                  │   │
│  │   NFD decompose + lowercase             │   │
│  │   "búsqueda" → "busqueda"               │   │
│  │                                         │   │
│  │ obtenerParametroBusqueda()              │   │
│  │   URLSearchParams.get('q')              │   │
│  │                                         │   │
│  │ filtrarNoticias(termino)                │   │
│  │   filtra por titulo + resumen           │   │
│  │   usando normalizarTexto()              │   │
│  │                                         │   │
│  │ crearNoticiaHTML(noticia)               │   │
│  │   template literal → Bootstrap card    │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────────┐ │
│  │cargarNoticias    │  │cargarTodasLasNoticias │ │
│  │Destacadas()      │  │()                     │ │
│  │                  │  │                       │ │
│  │ #noticias-       │  │ #todas-noticias       │ │
│  │  destacadas      │  │ lee ?q=               │ │
│  │ sort desc        │  │ muestra #searchBar    │ │
│  │ slice(0,4)       │  │ o #noResults          │ │
│  └──────────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────┘
```


### establecimientos.js — Módulo de directorio

```
┌──────────────────────────────────────────────────────────┐
│                   establecimientos.js                     │
│                                                          │
│  Estado modular (module-level vars):                     │
│  ┌──────────────────────────────────────────────┐       │
│  │ let todos = []         ← todos los registros │       │
│  │ let filtrados = []     ← resultado de filtro │       │
│  │ let paginaActual = 1                          │       │
│  │ let porPagina = 20                            │       │
│  │ let filtroActivo = 'todos'                    │       │
│  │ let busqueda = ''                             │       │
│  └──────────────────────────────────────────────┘       │
│                                                          │
│  Carga:                                                  │
│  cargarEstablecimientos()                                │
│    ├── supabaseClient.from('slep_establecimientos')      │
│    │     .select('id, nombre_establecimiento,            │
│    │              direccion, nombre_director,            │
│    │              correo_director, nivel_educativo')     │
│    │     .order('nombre_establecimiento')                │
│    ├── todos = data                                      │
│    └── renderizar()                                      │
│                                                          │
│  Clasificación de nivel (getTipo):                       │
│  nivel_educativo ──► jardin | liceo | escuela            │
│  "parvularia"/"jardín"/"jardin" → "jardin"               │
│  "media"/"liceo"               → "liceo"                 │
│  cualquier otro                → "escuela"               │
│                                                          │
│  Filtrado (aplicarFiltros):                              │
│  todos[] ──filter(tipo AND texto)──► filtrados[]         │
│  paginaActual = 1                                        │
│  renderizar()                                            │
│                                                          │
│  ⚠️ NOTA: busqueda usa .toLowerCase() sin NFD normalize  │
│  (diferencia con noticias.js que sí usa NFD)             │
│                                                          │
│  Render dual (responsive):                               │
│  renderizar()                                            │
│    ├── renderTabla(pagina)    → #tablaBody               │
│    ├── renderCards(pagina)    → #cardsContainer          │
│    ├── renderPaginacion(..., 'paginacion')                │
│    └── renderPaginacion(..., 'paginacionMobile')         │
│                                                          │
│  Paginación:                                             │
│  renderPaginacion()                                      │
│    ├── max 5 botones visibles                            │
│    ├── botones anterior/siguiente                        │
│    └── irPagina(n) → scrollTo(top:0) + renderizar()     │
└──────────────────────────────────────────────────────────┘
```

---

## Data Models

### Noticia (noticias.js)

```javascript
{
    id:         Number,    // entero único, incremental (actualmente 1–11)
    titulo:     String,    // texto del titular
    resumen:    String,    // extracto descriptivo
    fecha:      String,    // ISO 8601: "YYYY-MM-DD" (usado para sorting)
    fechaTexto: String,    // legible en español: "DD de mes, YYYY"
    imagen:     String,    // ruta relativa desde public/
    enlace:     String     // ruta relativa a la página de detalle HTML
}
```

**Convención de crecimiento:** El array se mantiene con el elemento de mayor `id` (más reciente) al inicio. Al agregar una noticia se incrementa el `id` y se usa la fecha ISO más reciente.

### Establecimiento (Supabase `slep_establecimientos`)

| Campo | Tipo SQL | Descripción |
|---|---|---|
| `id` | integer PK | Identificador único |
| `nombre_establecimiento` | text | Nombre oficial del establecimiento |
| `direccion` | text | Dirección física en Valparaíso |
| `nombre_director` | text | Nombre del director/a (puede ser null) |
| `correo_director` | text | Email del director/a (puede ser null o vacío) |
| `nivel_educativo` | text | Descripción textual del nivel (parvularia, básica, media, etc.) |

**Clasificación derivada (getTipo):**

| nivel_educativo contiene | Tipo clasificado | Badge CSS |
|---|---|---|
| "parvularia", "jardín", "jardin" | `jardin` | `badge-jardin` |
| "media", "liceo" | `liceo` | `badge-liceo` |
| cualquier otro valor | `escuela` | `badge-escuela` |


### Preferencias de accesibilidad (localStorage)

| Clave | Valores posibles | Efecto en body |
|---|---|---|
| `altoContraste` | `'1'` (activo), `'0'` (inactivo) | clase `alto-contraste` |
| `tamanoTexto` | `'grande'`, `'pequeno'`, `'normal'` | clases `texto-grande` / `texto-pequeno` |

### Modal de Consulta Ciudadana (sessionStorage)

| Clave | Valor | Significado |
|---|---|---|
| (según implementación inline en index.html) | `'1'` | Modal ya fue mostrado en esta sesión |

---

## Flujos de Datos

### Flujo de noticias en homepage

```
DOMContentLoaded
      │
      ▼
cargarNoticiasDestacadas()
      │
      ▼
noticias.sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
      │
      ▼
.slice(0, 4)
      │
      ▼
.map(noticia => crearNoticiaHTML(noticia)).join('')
      │
      ▼
document.getElementById('noticias-destacadas').innerHTML = ...
```

### Flujo de noticias con búsqueda (?q=término)

```
Usuario teclea en navbar search → form submit
      │
      ▼
window.location = '/noticias?q=<término>'
      │
      ▼
noticias.html carga → DOMContentLoaded
      │
      ▼
cargarTodasLasNoticias()
      │
      ├─── obtenerParametroBusqueda() → lee URLSearchParams('q')
      │
      ├─── filtrarNoticias(termino)
      │         │
      │         ▼
      │    normalizarTexto(termino) → NFD + lowercase
      │    noticias.filter(n =>
      │        normalizarTexto(n.titulo).includes(termNorm) ||
      │        normalizarTexto(n.resumen).includes(termNorm)
      │    )
      │
      ├─── (si hay término) → mostrar #searchBar con término y count
      ├─── (si sin resultados) → mostrar #noResults
      │
      ▼
sort por fecha → .map(crearNoticiaHTML) → #todas-noticias.innerHTML
```

### Flujo de establecimientos

```
DOMContentLoaded
      │
      ▼
cargarEstablecimientos()
      │
      ├─── supabaseClient
      │      .from('slep_establecimientos')
      │      .select('id, nombre_establecimiento, ...')
      │      .order('nombre_establecimiento')
      │
      ├─── (success) → todos = data → filtrados = todos → renderizar()
      │
      └─── (error) → mensaje de error en #tablaBody y #cardsContainer

Usuario interactúa:
  ├─── input #buscadorEstablecimientos → busqueda = e.target.value → aplicarFiltros()
  ├─── click .chip → filtroActivo = btn.dataset.filtro → aplicarFiltros()
  └─── change #porPagina → porPagina = parseInt(e.target.value) → renderizar()

aplicarFiltros():
      │
      ├─── filtrados = todos.filter(e =>
      │         coincideTipo(getTipo(e.nivel_educativo), filtroActivo)
      │         AND
      │         coincideTexto(e.*, busqueda.toLowerCase())
      │    )
      │
      └─── paginaActual = 1 → renderizar()

renderizar():
      ├─── calcular slice(inicio, fin)
      ├─── actualizar #contadorResultados
      ├─── renderTabla(pagina) → #tablaBody
      ├─── renderCards(pagina) → #cardsContainer
      ├─── renderPaginacion(..., 'paginacion')
      └─── renderPaginacion(..., 'paginacionMobile')
```


### Flujo de accesibilidad (main.js)

```
DOMContentLoaded
      │
      ▼
aplicarPreferencias()
   ├─── localStorage.get('altoContraste') === '1'
   │       → body.classList.add('alto-contraste')
   │       → #acc-contraste.classList.add('active')
   │
   └─── localStorage.get('tamanoTexto')
           'grande' → body.addClass('texto-grande') + #acc-aumentar.active
           'pequeno' → body.addClass('texto-pequeno') + #acc-reducir.active

#acc-contraste click:
   → body.classList.toggle('alto-contraste')
   → localStorage.set('altoContraste', activo ? '1' : '0')

#acc-aumentar click:
   → body.classList.remove('texto-pequeno')
   → body.classList.toggle('texto-grande')
   → localStorage.set('tamanoTexto', activo ? 'grande' : 'normal')
   → #acc-reducir.classList.remove('active')

#acc-reducir click:
   → body.classList.remove('texto-grande')
   → body.classList.toggle('texto-pequeno')
   → localStorage.set('tamanoTexto', activo ? 'pequeno' : 'normal')
   → #acc-aumentar.classList.remove('active')
```

---

## Sistema de Estilos (custom.css)

### Paleta institucional

| Variable visual | Valor hex | Uso |
|---|---|---|
| Azul marino institucional | `#1B365D` | Navbar, footer, cards |
| Azul gobierno Chile | `#0055A4` | Franjas, hero gradient |
| Rojo gobierno Chile | `#FF4B3E` | Franja complementaria |
| Azul primario | `#0066CC` | Links y botones |
| Amarillo hover | `#ffd700` | Hover en accesos rápidos |
| Azul oscuro top-bar | `#0d1f3d` | Barra superior |
| Azul footer | `#1e3c72` | Pie de página |

### Componentes CSS clave

| Clase | Descripción |
|---|---|
| `.gov-stripe-header` | Franja tricolor chilena (8px, gradient azul/rojo), aparece antes del top-bar |
| `.gov-stripe-footer` | Franja tricolor en el footer (10px, 140px de ancho) |
| `.navbar-custom` | Navbar azul marino (#1B365D) con logo y enlaces blancos |
| `.top-bar` | Barra superior oscura (#0d1f3d) con accesos rápidos y redes sociales |
| `.footer-gov` | Footer azul marino (#1e3c72) con 4 columnas |
| `.feature-card` | Tarjeta Bootstrap con hover que eleva la sombra |
| `.acceso-card` | Tarjeta de acceso rápido con efecto flip CSS (frente/overlay) |
| `.nivel-badge .badge-jardin` | Badge verde para parvularia/jardín |
| `.nivel-badge .badge-liceo` | Badge azul para educación media/liceo |
| `.nivel-badge .badge-escuela` | Badge naranja para educación básica |
| `.btn-kit-primary` | Botón estilo Kit Digital Chile (azul) |
| `.btn-kit-secondary` | Botón estilo Kit Digital Chile (secundario) |
| `.alto-contraste` | Aplicada a `body` — modo alto contraste (texto negro sobre fondo blanco) |
| `.texto-grande` | Aplicada a `body` — aumenta tamaño base de texto |
| `.texto-pequeno` | Aplicada a `body` — reduce tamaño base de texto |
| `.bg-blue-gov` | Sección con gradient azul gobierno |

### Responsive

| Breakpoint Bootstrap 5 | px | Efecto |
|---|---|---|
| xs (default) | < 576px | Columna única |
| sm | ≥ 576px | — |
| md | ≥ 768px | Tabla establecimientos visible, cards ocultas |
| lg | ≥ 992px | Navbar desplegada, hamburguesa oculta |
| xl | ≥ 1200px | Layout completo |

La tabla de establecimientos usa `d-none d-md-block` y las cards usan `d-md-none` para el switch responsive.


---

## Correctness Properties

*Una propiedad es una característica o comportamiento que debe mantenerse verdadero en todas las ejecuciones válidas del sistema — esencialmente, una afirmación formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre especificaciones legibles por humanos y garantías de corrección verificables automáticamente.*

Las propiedades a continuación surgen del análisis de los criterios de aceptación y están orientadas a la lógica de JavaScript del lado del cliente — las funciones puras en `noticias.js`, `establecimientos.js` y `main.js`. No aplica PBT a la infraestructura NGINX/Supabase ni al renderizado visual.

---

### Property 1: Ordenamiento de noticias por fecha

*Para cualquier* array de noticias con al menos un elemento, la función de ordenamiento debe producir una secuencia donde cada noticia tiene una fecha ISO menor o igual a la noticia precedente (orden descendente).

**Validates: Requirements 2.6, 3.2, 3.8**

---

### Property 2: Filtrado de noticias insensible a mayúsculas y tildes

*Para cualquier* término de búsqueda no vacío y cualquier array de noticias, todas las noticias retornadas por `filtrarNoticias(termino)` deben tener el término normalizado (NFD + lowercase) presente en su `titulo` normalizado o en su `resumen` normalizado. Además, para cualquier término vacío o compuesto solo de espacios, `filtrarNoticias(termino)` debe retornar el array completo sin modificar.

**Validates: Requirements 3.3, 3.6, 3.9, 12.3**

---

### Property 3: Idempotencia de normalización de texto

*Para cualquier* string de texto, `normalizarTexto(normalizarTexto(x))` debe producir el mismo resultado que `normalizarTexto(x)`. Adicionalmente, para cualquier carácter acentuado y su equivalente sin acento, la función debe producir el mismo resultado (ej: `normalizarTexto("búsqueda") === normalizarTexto("busqueda")`).

**Validates: Requirements 3.6**

---

### Property 4: Esquema íntegro de objetos de noticia

*Para cualquier* objeto noticia en el array `noticias`, el objeto debe tener los seis campos obligatorios con los tipos correctos: `id` (Number), `titulo` (String no vacío), `resumen` (String no vacío), `fecha` (String en formato ISO 8601 parseable por `new Date()`), `fechaTexto` (String no vacío), `imagen` (String no vacío), `enlace` (String no vacío).

**Validates: Requirements 3.1**

---

### Property 5: Clasificación de nivel educativo

*Para cualquier* string de `nivel_educativo`, la función `getTipo()` debe retornar `'jardin'` si el string contiene "parvularia", "jardín" o "jardin"; debe retornar `'liceo'` si contiene "media" o "liceo"; y debe retornar `'escuela'` para cualquier otro valor (incluyendo null, undefined o string vacío).

**Validates: Requirements 4.6**

---

### Property 6: Composición correcta de filtros de establecimientos

*Para cualquier* array de establecimientos, texto de búsqueda y tipo de filtro activo, todos los elementos retornados por `aplicarFiltros()` deben cumplir simultáneamente ambas condiciones: (1) el `getTipo(e.nivel_educativo)` coincide con `filtroActivo` o `filtroActivo === 'todos'`, y (2) al menos uno de `nombre_establecimiento`, `direccion` o `nombre_director` contiene el texto de búsqueda en minúsculas (cuando el texto no está vacío).

**Validates: Requirements 4.3, 4.4, 4.5, 4.14**

---

### Property 7: URL de Google Maps correctamente codificada

*Para cualquier* string de dirección de un establecimiento, la URL de Google Maps generada debe tener la forma `https://maps.google.com/?q=` seguida de `encodeURIComponent(direccion + ', Valparaíso, Chile')`, sin caracteres sin codificar en el parámetro de query.

**Validates: Requirements 4.13**

---

### Property 8: Paginación con máximo 5 botones numéricos

*Para cualquier* `totalPaginas` mayor a 5 y cualquier `paginaActual`, la función `renderPaginacion()` debe generar exactamente 5 botones numéricos de página (excluyendo los botones anterior/siguiente), y los botones deben representar un rango contiguo de páginas que incluya `paginaActual`.

**Validates: Requirements 4.11**

---

### Property 9: Toggle de accesibilidad

*Para cualquier* estado inicial del `body` (con o sin las clases de accesibilidad), ejecutar el handler del botón de alto contraste debe resultar en el estado opuesto: si `body` tenía `alto-contraste`, debe perderla; si no la tenía, debe ganarla. Esta invariante debe mantenerse independientemente del estado previo.

**Validates: Requirements 8.1, 8.2, 8.3**

---

### Property 10: Exclusión mutua de tamaño de texto

*Para cualquier* estado inicial del `body`, si se activa el handler de "aumentar texto", entonces `body` no debe tener simultáneamente las clases `texto-grande` y `texto-pequeno`. De igual forma, si se activa "reducir texto", ambas clases no deben coexistir en el `body`.

**Validates: Requirements 8.6**

---

### Property 11: Round-trip de preferencias de accesibilidad en localStorage

*Para cualquier* combinación de preferencias (altoContraste ∈ {activo, inactivo}, tamanoTexto ∈ {grande, pequeno, normal}), si se activan las preferencias y luego se ejecuta `aplicarPreferencias()` (simulando recarga), el estado resultante del `body` y los botones debe ser idéntico al estado que se tenía antes de simular la recarga.

**Validates: Requirements 8.4, 8.5**


---

## Error Handling

### Errores de Supabase (establecimientos.js)

```javascript
try {
    const { data, error } = await supabaseClient.from(...)...;
    if (error) throw error;
    // procesar data
} catch (err) {
    // renderizar mensaje de error en DOM sin interrumpir la página
    document.getElementById('tablaBody').innerHTML =
        '<tr><td colspan="6" ...>Error al cargar los establecimientos</td></tr>';
    document.getElementById('cardsContainer').innerHTML =
        '<p ...>Error al cargar los establecimientos</p>';
}
```

**Comportamiento ante error de red o Supabase:**
- El resto de la página carga normalmente (header, footer, controles de filtro)
- Solo el contenido dinámico muestra el mensaje de error
- No se produce crash JS ni pantalla en blanco

### Resultados vacíos (establecimientos.js)

Cuando `aplicarFiltros()` produce un array vacío, `renderTabla()` y `renderCards()` muestran mensajes dedicados ("No se encontraron establecimientos") en lugar de dejar los contenedores vacíos.

### Resultados vacíos (noticias.js)

Cuando `filtrarNoticias()` retorna array vacío con un término activo, `cargarTodasLasNoticias()` muestra el elemento `#noResults` con el término buscado y limpia el contenedor de resultados. El formulario de búsqueda permanece funcional.

### Imágenes rotas

No hay manejo programático de imágenes rotas. El comportamiento es el nativo del navegador (alt text o ícono de imagen rota). Es una deuda técnica conocida.

### Formulario de contacto

El handler en `main.js` previene el submit por defecto y muestra un `alert()` como fallback. No hay integración con backend de correo.

---

## Testing Strategy

### Enfoque dual

El sitio no tiene tests actualmente. La estrategia propuesta para incorporar testing es:

1. **Tests de propiedad (property-based)** — para la lógica JS pura (`noticias.js`, `establecimientos.js`, `main.js`)
2. **Tests de ejemplo (unit/ejemplo)** — para comportamientos específicos del DOM y casos límite
3. **Tests smoke** — para verificar estructura estática del HTML (metaetiquetas, estructura del DOM, existencia de PDFs)
4. **Tests de integración** — para la conexión real con Supabase (1-3 ejecuciones)

### Librería recomendada para PBT

Para el contexto del proyecto (Node.js, Vanilla JS sin framework):
- **fast-check** — librería PBT para JavaScript/TypeScript, compatible con Jest/Vitest
- Mínimo 100 iteraciones por propiedad

### Configuración de tags de tests

Cada test de propiedad debe referenciar la propiedad del diseño:

```
Feature: sitio-institucional-slep, Propiedad N: <texto de la propiedad>
```

### Tests de propiedad (por módulo)

**noticias.js:**
- Propiedad 1: Ordenamiento de noticias — generar arrays con fechas aleatorias, verificar orden descendente
- Propiedad 2: Filtrado con búsqueda — generar términos y arrays aleatorios, verificar inclusión
- Propiedad 3: Idempotencia de `normalizarTexto` — generar strings con/sin acentos, verificar equivalencia
- Propiedad 4: Esquema de noticias — verificar que cada elemento del array tiene los campos y tipos requeridos

**establecimientos.js:**
- Propiedad 5: Clasificación de nivel — generar strings de `nivel_educativo`, verificar mapeo
- Propiedad 6: Composición de filtros — generar arrays y combinaciones de filtros, verificar intersección
- Propiedad 7: URL Google Maps — generar direcciones con caracteres especiales, verificar codificación
- Propiedad 8: Paginación — generar totalPaginas > 5 y paginaActual, verificar máximo 5 botones

**main.js:**
- Propiedad 9: Toggle de accesibilidad — generar estados iniciales del body, verificar toggle
- Propiedad 10: Exclusión mutua — verificar que activar un modo de texto desactiva el otro
- Propiedad 11: Round-trip localStorage — verificar que guardar y restaurar preserva el estado

### Tests de ejemplo (smoke y DOM)

- Verificar que cada página HTML contiene `.gov-stripe-header`, `.top-bar`, `nav.navbar-custom`, `footer.footer-gov`
- Verificar que el Footer contiene la dirección, correo y horarios correctos
- Verificar presencia de metaetiquetas SEO en cada página
- Verificar que los archivos PDF referenciados existen en `public/documentos/`
- Verificar que los 11 archivos en `public/noticias/` existen y corresponden a los `enlace` del array
- Verificar el manejo de error de Supabase (mock del cliente)

### Tests de integración (Supabase)

- 1-2 ejecuciones contra Supabase real para verificar que la tabla `slep_establecimientos` responde y tiene los campos esperados


---

## Decisiones de Diseño y Deuda Técnica

### Decisiones de diseño actuales

| Decisión | Justificación | Alternativa considerada |
|---|---|---|
| MPA estática sin build step | Máxima simplicidad operacional, NGINX sirve archivos sin configuración adicional, cualquier funcionario puede editar el HTML directamente | SPA con React/Vue, pero requiere build y despliegue más complejo |
| Noticias en array JS hardcodeado | Sin dependencias externas para el contenido editorial, funciona offline/sin BD | CMS headless (Strapi, Contentful), pero agrega complejidad y costo |
| Supabase para establecimientos | Los datos del directorio cambian frecuentemente (directores, correos). Supabase permite actualizar sin tocar código | Array hardcodeado como noticias, pero requeriría deploy por cada cambio |
| Bootstrap 5 vía CDN | Sin proceso de build, actualizaciones simples cambiando la versión en el `<link>` | Bundle local, pero requiere npm install y copia |
| Duplicación de header/footer | Máxima independencia de páginas — cualquier página es un archivo HTML completo autosuficiente | Includes server-side (PHP) o Web Components, pero romperían el modelo estático |
| Paleta Kit Digital Chile | Alineación con el sistema de diseño del Gobierno de Chile, coherencia visual con otros servicios del Estado | Marca propia SLEP, pero alejaría el sitio del estándar gubernamental |

### Deuda técnica documentada

| ID | Descripción | Impacto | Esfuerzo de mejora |
|---|---|---|---|
| DT-1 | **Header/footer duplicado** — cualquier cambio en navbar o footer requiere editar todos los archivos HTML | Alto (11 páginas de noticias + 9 páginas principales) | Medio (Web Components o SSG como Eleventy) |
| DT-2 | **Noticias hardcodeadas** — el array en `noticias.js` crece con cada publicación nueva | Medio (operacional) | Medio (Supabase table para noticias, igual que establecimientos) |
| DT-3 | **Búsqueda inconsistente** — `noticias.js` usa NFD normalization para tildes; `establecimientos.js` usa solo `toLowerCase()` | Bajo (afecta búsquedas con tildes en establecimientos) | Bajo (agregar `normalizarTexto` a establecimientos.js) |
| DT-4 | **Anon key de Supabase en código cliente** — la key es pública por diseño (anon key), pero su presencia hardcodeada en el repositorio es una práctica que dificulta la rotación | Bajo (la key está diseñada para uso público) | Bajo (variable de entorno en build o configuración NGINX) |
| DT-5 | **Sin nav activo en main.js** — documentación del memory-bank indica que debería estar ahí, pero no está implementado | Bajo (UX degradada en páginas sin script inline) | Bajo (agregar detección por `window.location.pathname` en main.js) |
| DT-6 | **Sin tests automatizados** — no hay tests unitarios, de integración ni E2E | Alto (riesgo de regresiones silenciosas) | Medio (setup de Vitest + fast-check) |
| DT-7 | **Sin CI/CD** — el despliegue es manual por SSH + cp | Medio (riesgo de deploy incompleto, sin rollback) | Medio (GitHub Actions + SSH deploy action) |
| DT-8 | **Sin manejo de imágenes rotas** — no hay `onerror` en imágenes de noticias o establecimientos | Bajo (experiencia visual degradada en noticias con imagen faltante) | Bajo (agregar `onerror="this.src='img/placeholder.jpg'"`) |


---

## Referencia de Estructura de Archivos

```
pagina-web/
├── server.js                          # Express: estáticos + /health + rutas limpias
├── package.json                       # Node.js ≥ 22.0.0, Express ^4.19.2
├── package-lock.json
├── public/                            # Web root (lo que se copia a NGINX)
│   ├── index.html                     # Homepage
│   ├── conocenos.html                 # Página institucional
│   ├── noticias.html                  # Listado de noticias con búsqueda
│   ├── participacion.html             # Mecanismos de participación ciudadana
│   ├── establecimientos.html          # Directorio de establecimientos (Supabase)
│   ├── documentacion.html             # Biblioteca de documentos públicos
│   ├── gestor-documental.html         # Guías del gestor documental (funcionarios)
│   ├── recursos-internos.html         # Recursos para funcionarios SLEP
│   ├── consulta-ciudadana.html        # Cuestionarios por estamento (PEL 2027-2033)
│   ├── header-template.html           # Referencia — NO se usa como include
│   ├── robots.txt                     # Directivas para bots de búsqueda
│   ├── sitemap.xml                    # Mapa del sitio para indexación
│   ├── css/
│   │   └── custom.css                 # Estilos globales (paleta, componentes, accesibilidad)
│   ├── js/
│   │   ├── main.js                    # Global: accesibilidad, navbar móvil, form contacto
│   │   ├── noticias.js                # Array noticias + render de cards + búsqueda
│   │   └── establecimientos.js        # Fetch Supabase + búsqueda/filtro/paginación/render
│   ├── img/                           # Imágenes UI: banners, logos, accesibilidad
│   ├── img_news/                      # Imágenes de noticias (subcarpeta por historia)
│   │   ├── laboratorios_computacion/
│   │   ├── kit_pedagogico/
│   │   ├── dia_del_estudiante/
│   │   ├── cuenta_publica_2026/
│   │   ├── comunicado_prensa/
│   │   ├── comision_tripartita/
│   │   ├── laguna_verde_sala_modulares/
│   │   └── consejo_local/
│   ├── noticias/                      # 11 páginas de detalle de noticias (standalone HTML)
│   │   ├── cuenta-publica-2025.html
│   │   ├── dia-del-estudiante.html
│   │   ├── kit-pedagogico-ganamar.html
│   │   ├── laboratorios-computacion.html
│   │   └── noticia1.html ... noticia7.html
│   ├── documentos/                    # PDFs organizados por categoría
│   │   ├── planificacion/
│   │   │   ├── PEL_2021-2027.pdf
│   │   │   ├── PAL_2025.pdf
│   │   │   ├── PAL 2026.pdf
│   │   │   └── banners/               # Formularios y PDFs de difusión
│   │   ├── COSOC ACTAS/               # Actas CLEP 2025
│   │   │   └── 2026/                  # Actas CLEP 2026
│   │   ├── Gestor_dcumental/          # 9 manuales del gestor documental en PDF
│   │   ├── informes/                  # (vacío — destinado a informes futuros)
│   │   └── reglamentos/               # (vacío — destinado a reglamentos futuros)
│   └── uploads/                       # Carpeta de staging para nuevos archivos
├── assets/                            # Carpeta legacy (supersedida por public/)
│   ├── css/styles.css
│   └── js/main.js
└── .amazonq/rules/memory-bank/        # Documentación del memory-bank
    ├── guidelines.md
    ├── product.md
    ├── structure.md
    └── tech.md
```

---

## Referencia de Despliegue

### Desarrollo local

```bash
npm install       # instala Express + nodemon
npm run dev       # nodemon con hot reload en localhost:3000
npm start         # node sin hot reload
```

### Producción (manual)

```bash
# Copiar public/ al html root de NGINX
sudo cp -R ~/slepv-website/public/* /opt/bitnami/nginx/html/

# Reiniciar NGINX
sudo /opt/bitnami/ctlscript.sh restart nginx
```

**Notas de despliegue:**
- No hay CI/CD automatizado — el deploy es siempre manual por SSH
- No hay proceso de rollback formal — se debe mantener una copia del estado previo antes de cada deploy
- Los PDFs en `public/documentos/` se sincronizan con el mismo comando `cp -R`
- NGINX sirve el directorio estático directamente sin configuración especial de rutas

