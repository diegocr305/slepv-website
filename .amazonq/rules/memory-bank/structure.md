# Project Structure

## Root Layout
```
pagina-web/
├── server.js               # Express entry point — serves static files from /public
├── package.json            # Node.js project metadata and scripts
├── public/                 # Web root served by Express and copied to NGINX
│   ├── index.html          # Homepage
│   ├── conocenos.html      # About us page
│   ├── noticias.html       # News listing page
│   ├── participacion.html  # Citizen participation page
│   ├── establecimientos.html # Schools directory page
│   ├── documentacion.html  # Public document library
│   ├── gestor-documental.html # Internal document management guide
│   ├── recursos-internos.html # Staff internal resources
│   ├── header-template.html   # Shared header snippet (reference)
│   ├── css/
│   │   └── custom.css      # Site-wide custom styles
│   ├── js/
│   │   ├── main.js         # Global JS — nav active state, AOS init, news loader for homepage
│   │   ├── noticias.js     # News listing page logic — renders all news cards
│   │   └── establecimientos.js # Schools directory — search, filter, render
│   ├── img/                # Site images and banners
│   ├── img_news/           # News article images and media (per-story subfolders)
│   ├── noticias/           # Individual news article HTML pages
│   ├── documentos/         # Public PDFs (planificacion, COSOC, reglamentos, manuals)
│   ├── uploads/            # Upload staging folder
│   ├── robots.txt
│   └── sitemap.xml
├── assets/                 # Legacy/alternate asset folder (css, img, js) — largely superseded by public/
│   ├── css/styles.css
│   └── js/main.js
└── .amazonq/rules/memory-bank/  # Amazon Q Memory Bank documentation
```

## Core Components & Relationships

- **server.js** is a thin Express wrapper — its only job is to serve `public/` as static files and provide a `/health` endpoint. All routing is file-based HTML.
- **public/js/main.js** runs on every page: sets the active nav link, initializes AOS animations, and on the homepage loads the latest 3 news items from the shared news data array.
- **public/js/noticias.js** owns the news data array (array of news objects) and renders all cards on `noticias.html`.
- **public/js/establecimientos.js** owns the schools data array and handles search/filter UI on `establecimientos.html`.
- Individual news pages live in `public/noticias/*.html` and are standalone HTML files.

## Architectural Pattern
Static-first multi-page application (MPA):
- No frontend framework (Vanilla JS + Bootstrap 5)
- Data is hardcoded in JS files (no API/database)
- Server is purely a static file server
- Deployment = copy `public/` to NGINX html root
