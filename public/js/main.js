// Formulario básico de validación (puedes conectar con Supabase luego)
document.querySelector("form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Gracias por contactarte con SLEP Valparaíso. Pronto te responderemos.");
  e.target.reset();
});
