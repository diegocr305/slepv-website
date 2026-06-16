# Technology Stack

## Runtime & Server
- **Node.js** ≥ 22.0.0 (local dev server only)
- **Express** ^4.19.2 — minimal static file server
- **NGINX** (Bitnami) — production web server at https://slepvalparaiso.cl

## Frontend
- **HTML5** — multi-page static HTML
- **Bootstrap 5** — layout, navbar, carousel, modals, grid (loaded via CDN)
- **AOS (Animate On Scroll)** — scroll animations (CDN)
- **Font Awesome** — icons (CDN)
- **Vanilla JavaScript (ES6+)** — no frontend framework

## Dev Dependencies
- **nodemon** ^3.1.0 — auto-restart during local development

## CDN Dependencies (no local install)
- Bootstrap 5 CSS + JS Bundle
- AOS CSS + JS
- Font Awesome 6 (Free)

## Development Commands
```bash
npm install          # install dependencies
npm run dev          # start with nodemon (hot reload on js/html/css changes)
npm start            # start with plain node
```
Local dev server: http://localhost:3000

## Deployment
See README.md — deployment is manual copy of `public/` to NGINX:
```bash
sudo cp -R ~/slepv-website/public/* /opt/bitnami/nginx/html/
sudo /opt/bitnami/ctlscript.sh restart nginx
```

## No Build Step
There is no bundler, transpiler, or build process. Files are served as-is.
