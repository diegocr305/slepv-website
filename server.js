const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// static
app.use(express.static(path.join(__dirname, 'public')));

// healthcheck
app.get('/health', (_, res) => res.json({ ok: true }));

// root
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// rutas limpias
[
  'conocenos', 'noticias', 'participacion',
  'establecimientos', 'documentacion',
  'gestor-documental', 'recursos-internos',
  'consulta-ciudadana'
].forEach(ruta => {
  app.get(`/${ruta}`, (_, res) => {
    res.sendFile(path.join(__dirname, 'public', `${ruta}.html`));
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
