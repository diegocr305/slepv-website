// Activadores de accesibilidad (tamaño fuente / contraste)
(function () {
  const body = document.body;
  const minus = document.querySelector('.a11y-font-minus');
  const normal = document.querySelector('.a11y-font-default');
  const plus = document.querySelector('.a11y-font-plus');
  const contrast = document.querySelector('.a11y-contrast-toggle');

  let scale = 100;

  function applyScale() {
    body.style.fontSize = `${scale}%`;
  }

  minus?.addEventListener('click', () => { scale = Math.max(85, scale - 5); applyScale(); });
  plus?.addEventListener('click', () => { scale = Math.min(130, scale + 5); applyScale(); });
  normal?.addEventListener('click', () => { scale = 100; applyScale(); });
  contrast?.addEventListener('click', () => body.classList.toggle('a11y-contrast'));
})();
