# Development Guidelines

## Code Quality Standards

### Formatting & Style
- 4-space indentation in JS files under `public/js/`; 2-space in `assets/js/`
- Use `const`/`let` — no `var`
- Arrow functions for short callbacks; named functions for reusable logic
- Template literals for HTML string generation (no string concatenation)
- Guard clauses with early returns: `if (!container) return;`

### Naming Conventions
- **Variables/functions:** camelCase (`filtroActivo`, `renderTabla`, `cargarEstablecimientos`)
- **Spanish naming throughout:** all variable, function, and parameter names are in Spanish to match the project's language context (`busqueda`, `filtrados`, `paginaActual`, `coincideTipo`)
- **CSS IDs/classes:** kebab-case in HTML (`noticias-destacadas`, `tablaBody`, `cardsContainer`)
- Functions named as actions: `cargar*`, `render*`, `aplicar*`, `obtener*`, `init*`

---

## Data Patterns

### News Data (noticias.js)
News is stored as a hardcoded JS array of objects at the top of the file:
```js
const noticias = [
    {
        id: 10,
        titulo: "...",
        resumen: "...",
        fecha: "2026-05-28",        // ISO format for sorting
        fechaTexto: "28 de mayo, 2026",  // Human-readable display string
        imagen: "img_news/folder/file.jpg",
        enlace: "noticias/slug.html"
    },
    // ...
];
```
- Always include both `fecha` (ISO, for `new Date()` sorting) and `fechaTexto` (display string)
- Images go in `public/img_news/<story-folder>/`
- Detail pages go in `public/noticias/<slug>.html`
- Sort descending by date: `.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))`

### Schools Data (establecimientos.js)
Schools are fetched from **Supabase** (not hardcoded):
```js
const { data, error } = await supabaseClient
    .from('slep_establecimientos')
    .select('id, nombre_establecimiento, direccion, nombre_director, correo_director, nivel_educativo')
    .order('nombre_establecimiento');
```
- Always wrap Supabase calls in `try/catch` and render an error state in the DOM on failure
- Module-level state variables for filter/pagination: `todos`, `filtrados`, `paginaActual`, `porPagina`, `filtroActivo`, `busqueda`

---

## Rendering Patterns

### DOM Rendering via innerHTML
All list rendering uses `.map().join('')` assigned to `element.innerHTML`:
```js
container.innerHTML = items.map(item => `<div>...</div>`).join('');
```

### Dual Render (Table + Cards)
The schools page renders the same data in two formats simultaneously — a desktop table and mobile cards — always call both:
```js
renderTabla(pagina);
renderCards(pagina);
```

### Empty State Pattern
Always handle empty results explicitly:
```js
if (pagina.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No se encontraron establecimientos</td></tr>';
    return;
}
```

### Google Maps URL Pattern
```js
const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(address + ', Valparaíso, Chile')}`;
```

---

## Event Handling

### DOMContentLoaded Entry Point
Every JS file uses a single `DOMContentLoaded` listener as the entry point:
```js
document.addEventListener('DOMContentLoaded', () => {
    // init calls here
});
```
or
```js
window.addEventListener('DOMContentLoaded', () => { ... });
```
Both patterns exist; `document.addEventListener` is preferred in newer files.

### Event Delegation Pattern (chip filters)
```js
document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filtroActivo = btn.dataset.filtro;
        aplicarFiltros();
    });
});
```

---

## Text / Search Patterns

### Accent-Insensitive Search
Always normalize text before comparison using NFD decomposition:
```js
function normalizarTexto(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
```

### URL Search Params
```js
const urlParams = new URLSearchParams(window.location.search);
return urlParams.get('q');
```

---

## HTML Conventions

### Nav Structure (repeated on every page)
- Bootstrap 5 navbar with `.navbar-custom` class
- Nav links use clean path routes (`href="/noticias"`, not `href="noticias.html"`) when served via Express; `.html` extension used in standalone HTML context
- Active link is set dynamically by JS, not hardcoded in HTML

### AOS Animations
Sections use `data-aos` attributes, initialized globally:
```html
<h2 data-aos="fade-down">...</h2>
<div data-aos="fade-up" data-aos-delay="100">...</div>
```

### Bootstrap Badges / Buttons
- Use `btn-danger` for primary CTAs ("Conoce más >", "Leer más")
- Use `btn-outline-primary` / `btn-outline-secondary` for secondary actions
- Level badges use custom classes: `nivel-badge badge-jardin`, `nivel-badge badge-liceo`, `nivel-badge badge-escuela`

### Government Stripe Divider
Use this div to separate major sections (matches Chilean government design system):
```html
<div class="gov-stripe-header"></div>
```

---

## Adding New Content

### Adding a New News Article
1. Add a new object to the `noticias` array in `public/js/noticias.js` (highest `id`, most recent `fecha` first)
2. Create `public/noticias/<slug>.html` for the detail page
3. Add images to `public/img_news/<story-folder>/`

### Adding a New School
Insert directly into the `slep_establecimientos` Supabase table — no code changes needed.

### Adding a New Page
1. Create `public/<page-name>.html`
2. Copy the full header/navbar and footer from an existing page
3. Add a route to `server.js` if needed (or rely on static file serving)
4. Add a nav link in every page's navbar HTML

---

## Deployment Reminder
After any change, copy to NGINX and restart:
```bash
sudo cp -R ~/slepv-website/public/* /opt/bitnami/nginx/html/
sudo /opt/bitnami/ctlscript.sh restart nginx
```
