# Requirements Document

## Introduction

El **Sitio Institucional del SLEP Valparaíso** es la presencia digital oficial del Servicio Local de Educación Pública de Valparaíso, organismo creado por la Ley 21.040 (Ley de Nueva Educación Pública de Chile). El sitio, disponible en https://slepvalparaiso.cl, centraliza información institucional, noticias, directorio de establecimientos educacionales, documentación pública y mecanismos de participación ciudadana.

Este documento captura retrospectivamente los requisitos funcionales del sitio ya construido y en producción, con el fin de establecer una línea base documentada que sustente mejoras futuras.

El sistema es una aplicación multi-página (MPA) estática, construida con HTML5, Bootstrap 5 y Vanilla JavaScript ES6+, servida por NGINX en producción. Los datos de establecimientos se obtienen desde Supabase; las noticias se almacenan como array hardcodeado en JavaScript.

---

## Glossary

- **Sitio**: El sitio web institucional del SLEP Valparaíso en https://slepvalparaiso.cl
- **SLEP**: Servicio Local de Educación Pública de Valparaíso
- **Navegacion**: El componente de navegación principal (navbar Bootstrap 5) presente en todas las páginas
- **Accesibilidad_Bar**: La barra de controles de accesibilidad (contraste, tamaño de texto) presente en páginas seleccionadas
- **Carousel**: El componente carrusel Bootstrap de "Información Destacada" en la página de inicio
- **Motor_Noticias**: El módulo JavaScript (`noticias.js`) que gestiona y renderiza las noticias desde el array hardcodeado
- **Motor_Establecimientos**: El módulo JavaScript (`establecimientos.js`) que consulta Supabase y gestiona búsqueda, filtro y paginación del directorio
- **Supabase_Client**: El cliente de Supabase JS v2 que realiza consultas a la tabla `slep_establecimientos`
- **COSOC**: Consejo de la Sociedad Civil — órgano fiscalizador externo
- **CLEP**: Consejo Local de Educación Pública
- **PEL**: Plan Educativo Local — instrumento estratégico de gestión educativa territorial
- **PAL**: Plan Anual Local — documento operativo anual derivado del PEL
- **OIRS**: Oficina de Información, Reclamos y Sugerencias — formulario externo en Typeform
- **Barra_Gubernamental**: La franja divisora con los colores del gobierno de Chile (`.gov-stripe-header`)
- **Top_Bar**: La barra superior con accesos rápidos a Trámites Online, correo de contacto y redes sociales
- **Footer**: El pie de página con navegación, contacto, redes sociales y enlaces de transparencia
- **Establecimiento**: Unidad educacional (escuela, liceo o jardín infantil/sala cuna) administrada por el SLEP
- **Apoderado**: Padre, madre o tutor legal de un estudiante

---

## Requirements

---

### Requisito 1: Estructura de Página y Navegación Global

**User Story:** Como ciudadano, quiero que todas las páginas del sitio tengan una estructura visual consistente con navegación clara, para poder orientarme y acceder a cualquier sección sin perderme.

#### Criterios de Aceptación

1. THE Sitio SHALL incluir en cada página la Barra_Gubernamental, el Top_Bar, la Navegacion y el Footer.
2. THE Navegacion SHALL mostrar los enlaces en este orden: Inicio, Conócenos, Noticias, Participación, Establecimientos y Documentación.
3. WHEN el usuario accede a una página del sitio, THE Navegacion SHALL marcar como activo el enlace correspondiente a la página actual mediante la clase CSS `active`. IF ninguna ruta coincide con la URL actual, THEN THE Navegacion SHALL no aplicar la clase `active` a ningún enlace.
4. WHEN el usuario hace clic en un enlace de la Navegacion en un dispositivo móvil con el menú desplegado, THE Navegacion SHALL colapsar el menú móvil automáticamente.
5. THE Top_Bar SHALL mostrar un enlace a Trámites Online (tramites.dep.gob.cl), un enlace de contacto al correo `oficinadepartes@slepvalparaiso.cl` y los iconos de Instagram, Facebook y YouTube del SLEP.
6. THE Footer SHALL mostrar la dirección física (Blanco 937, 2° piso, Valparaíso), el correo de contacto (oficinadepartes@slepvalparaiso.cl), los horarios de atención (lunes a jueves: 9:00–14:00 y 15:00–17:00; viernes: 9:00–14:00) y los enlaces de transparencia (Ley de Lobby, Transparencia Activa, Transparencia Pasiva, Trámites Online).
7. THE Navegacion SHALL colapsar en un botón tipo hamburguesa en pantallas con ancho inferior a 992 píxeles (breakpoint `lg` de Bootstrap).

---

### Requisito 2: Página de Inicio (Homepage)

**User Story:** Como ciudadano, quiero que la página de inicio me dé una visión rápida de las novedades, los accesos clave y la información institucional destacada, para orientarme sin necesidad de navegar por todo el sitio.

#### Criterios de Aceptación

1. THE Sitio SHALL mostrar en la página de inicio un banner hero con imagen institucional del SLEP Valparaíso en la parte superior del contenido principal.
2. THE Sitio SHALL mostrar en la página de inicio cuatro accesos rápidos enlazados: Información, Reclamos y Sugerencias (OIRS → Typeform externo); Intranet (→ valparaiso.caschile.cl); Establecimientos (→ /establecimientos); y Documentación (→ /documentacion).
3. WHEN el usuario carga la página de inicio por primera vez en la sesión Y existe una Consulta Ciudadana activa configurada, THE Sitio SHALL mostrar automáticamente un modal con información de la consulta activa.
4. IF no hay Consulta Ciudadana activa, THEN THE Sitio SHALL no mostrar el modal al cargar la página de inicio.
5. WHEN el usuario cierra el modal de la Consulta Ciudadana, THE Sitio SHALL registrar en `sessionStorage` que el modal ya fue mostrado y no volver a mostrarlo durante la misma sesión.
6. THE Sitio SHALL mostrar en la sección "Noticias Recientes" las 4 noticias más recientes según fecha ISO, ordenadas de más reciente a más antigua. IF hay menos de 4 noticias disponibles, THE Sitio SHALL mostrar todas las noticias existentes sin error.
7. THE Sitio SHALL mostrar en la página de inicio el Carousel de "Información Destacada" con 5 diapositivas que rotan automáticamente cada 4 segundos.
8. THE Carousel SHALL mostrar dos imágenes enlazadas por diapositiva y contar con controles de navegación anterior/siguiente.
9. THE Sitio SHALL mostrar en la página de inicio los tres banners de transparencia: Ley de Lobby, Transparencia Activa y Transparencia Pasiva, con sus respectivos enlaces al portal correspondiente.
10. THE Sitio SHALL incluir en la página de inicio metadatos Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) y datos estructurados JSON-LD de tipo `GovernmentOrganization`.

---

### Requisito 3: Módulo de Noticias

**User Story:** Como ciudadano o apoderado, quiero acceder a un listado actualizado de noticias del SLEP con la posibilidad de buscar y leer cada artículo completo, para mantenerme informado sobre la educación pública de Valparaíso.

#### Criterios de Aceptación

1. THE Motor_Noticias SHALL almacenar cada noticia con los campos: `id` (entero único), `titulo` (texto), `resumen` (texto), `fecha` (formato ISO 8601: YYYY-MM-DD), `fechaTexto` (cadena legible en español), `imagen` (ruta relativa), `enlace` (ruta relativa a la página de detalle).
2. WHEN el usuario accede a la página de noticias, THE Motor_Noticias SHALL renderizar todas las noticias ordenadas de más reciente a más antigua según el campo `fecha`.
3. WHEN el usuario submite el formulario de búsqueda con un término no vacío (no solo espacios) y de máximo 200 caracteres, THE Motor_Noticias SHALL filtrar y mostrar únicamente las noticias cuyo `titulo` o `resumen` contenga el término de búsqueda de forma insensible a mayúsculas y tildes (ej: "educacion" debe coincidir con "educación").
4. WHEN la búsqueda no produce resultados, THE Motor_Noticias SHALL mostrar un mensaje indicando que no se encontraron resultados para el término ingresado.
5. WHEN la búsqueda produce resultados, THE Motor_Noticias SHALL mostrar una barra informativa con el término buscado y la cantidad de resultados encontrados.
6. THE Motor_Noticias SHALL tratar los caracteres acentuados como equivalentes a sus variantes sin acento al comparar texto de búsqueda con títulos y resúmenes.
7. THE Sitio SHALL incluir páginas de detalle individuales para cada noticia publicada en la ruta `public/noticias/<slug>.html`, con al menos: título, fecha legible, imagen principal y cuerpo del artículo.
8. WHEN el usuario carga la página de inicio, THE Motor_Noticias SHALL renderizar en el contenedor `#noticias-destacadas` las 4 noticias más recientes. IF hay menos de 4 noticias, SHALL mostrar todas las disponibles sin error.
9. IF el usuario submite el formulario de búsqueda con un campo vacío o solo espacios, THEN THE Motor_Noticias SHALL mostrar todas las noticias sin filtro aplicado.

---

### Requisito 4: Directorio de Establecimientos

**User Story:** Como apoderado o ciudadano, quiero buscar y filtrar establecimientos educacionales administrados por el SLEP para encontrar el colegio que busco junto a su director y dirección.

#### Criterios de Aceptación

1. WHEN el usuario accede a la página de establecimientos, THE Motor_Establecimientos SHALL consultar la tabla `slep_establecimientos` de Supabase recuperando los campos: `id`, `nombre_establecimiento`, `direccion`, `nombre_director`, `correo_director`, `nivel_educativo`, ordenados alfabéticamente por nombre.
2. IF la consulta a Supabase falla, THEN THE Motor_Establecimientos SHALL mostrar un mensaje de error en el contenedor de tabla y en el contenedor de tarjetas sin interrumpir el resto de la página.
3. WHEN el usuario ingresa texto en el buscador de establecimientos, THE Motor_Establecimientos SHALL filtrar en tiempo real (con latencia máxima de 300ms) mostrando únicamente los establecimientos cuyo `nombre_establecimiento`, `direccion` o `nombre_director` contenga el texto ingresado, de forma insensible a mayúsculas y tildes.
4. WHEN el usuario selecciona un chip de filtro de nivel (Escuelas, Liceos, Jardines), THE Motor_Establecimientos SHALL aplicar el filtro de nivel sobre el conjunto ya filtrado por texto y marcar el chip como activo.
5. WHEN el usuario selecciona el chip "Todos", THE Motor_Establecimientos SHALL mostrar todos los establecimientos que coincidan con el texto de búsqueda activo, sin filtro de nivel adicional.
6. THE Motor_Establecimientos SHALL clasificar cada establecimiento como `jardin` si `nivel_educativo` contiene "parvularia", "jardín" o "jardin"; como `liceo` si contiene "media" o "liceo"; y como `escuela` en cualquier otro caso.
7. THE Motor_Establecimientos SHALL renderizar simultáneamente una vista de tabla (visible en pantallas ≥ 768px) y una vista de tarjetas (visible en pantallas < 768px) con los mismos datos paginados.
8. THE Motor_Establecimientos SHALL mostrar un contador de resultados indicando el rango visible y el total de establecimientos filtrados.
9. THE Motor_Establecimientos SHALL paginar los resultados con un valor por defecto de 20 establecimientos por página. THE Sitio SHALL mostrar un control de selector en la UI para que el usuario pueda cambiar el tamaño de página entre las opciones 10, 20 y 50.
10. WHEN la página cambia, THE Motor_Establecimientos SHALL hacer scroll al inicio de la página automáticamente.
11. WHEN el número total de páginas es mayor a 1, THE Motor_Establecimientos SHALL mostrar controles de paginación con botones anterior/siguiente y números de página (máximo 5 visibles a la vez).
12. WHEN un establecimiento tiene `correo_director` con valor no nulo y no vacío, THE Motor_Establecimientos SHALL mostrar un enlace `mailto:` con el correo del director en la tabla y en la tarjeta móvil.
13. THE Motor_Establecimientos SHALL generar para cada establecimiento un enlace a Google Maps con la dirección más ", Valparaíso, Chile" codificada como parámetro de URL.
14. WHEN el conjunto filtrado no contiene establecimientos, THE Motor_Establecimientos SHALL mostrar un mensaje "No se encontraron establecimientos" en la vista de tabla y en la vista de tarjetas.

---

### Requisito 5: Biblioteca de Documentación Pública

**User Story:** Como ciudadano u organismo de fiscalización, quiero acceder a documentos oficiales del SLEP (planes, actas, informes) para ejercer mi derecho a la información pública.

#### Criterios de Aceptación

1. THE Sitio SHALL mostrar en la página de documentación los documentos de planificación: Plan Estratégico Local (PEL) 2021-2027, Plan Anual Local (PAL) 2025 y Plan Anual Local (PAL) 2026, con enlace a cada PDF.
2. THE Sitio SHALL mostrar en la página de documentación las actas del Consejo Local de Educación Pública (CLEP) de los años 2025 y 2026, con enlace a cada PDF.
3. WHEN el usuario selecciona un acta de la lista, THE Sitio SHALL mostrar una vista previa del PDF en la misma página. IF el navegador no puede cargar el PDF en el visor integrado, THE Sitio SHALL mostrar un enlace alternativo de descarga directa.
4. WHEN el usuario selecciona un acta, THE Sitio SHALL mostrar un botón "Descargar PDF" enlazado al archivo correspondiente con apertura en nueva pestaña.
5. WHEN el usuario hace clic en un chip de año (2026/2025) en la sección de actas, THE Sitio SHALL mostrar únicamente las actas del año seleccionado y ocultar las del año no seleccionado.
6. THE Sitio SHALL permitir filtrar los documentos de planificación por tipo (Planes Estratégicos, Reglamentos, Actas, Informes) mediante un selector desplegable. WHEN se combinan filtros de tipo y año, THE Sitio SHALL mostrar únicamente los documentos que cumplan ambos criterios simultáneamente (lógica AND). IF la combinación de filtros no devuelve documentos, THE Sitio SHALL mostrar un mensaje indicando que no hay documentos para los filtros seleccionados.
7. THE Sitio SHALL permitir filtrar los documentos de planificación por año mediante un selector desplegable.
8. THE Sitio SHALL servir los PDFs directamente desde la ruta `public/documentos/` con apertura en nueva pestaña.

---

### Requisito 6: Participación Ciudadana

**User Story:** Como ciudadano o miembro de la comunidad educativa, quiero conocer los mecanismos de participación del SLEP y acceder a los procesos activos para ejercer mi derecho a participar en la gestión educativa pública.

#### Criterios de Aceptación

1. THE Sitio SHALL mostrar en la página de participación los cuatro mecanismos formales: Consejo Local de Educación Pública (CLEP), Consejo de la Sociedad Civil (COSOC), Cuenta Pública Participativa y Consulta Ciudadana PEL.
2. THE Sitio SHALL mostrar un enlace al formulario OIRS externo (Typeform: formularioenlinea.typeform.com/to/ycl1lDwq) en la sección de participación.
3. THE Sitio SHALL indicar visualmente cuáles mecanismos de participación están activos (mediante badge o indicador de estado).
4. WHEN el Consejo Local está activo, THE Sitio SHALL mostrar un enlace directo a la sección de actas del CLEP en la página de documentación.
5. WHEN la Cuenta Pública está disponible, THE Sitio SHALL mostrar un enlace directo al PDF de la última Cuenta Pública disponible.

---

### Requisito 7: Consulta Ciudadana PEL

**User Story:** Como miembro de la comunidad educativa (apoderado, docente, estudiante, directivo u otro estamento), quiero acceder al cuestionario de la consulta ciudadana correspondiente a mi estamento para contribuir al diagnóstico del Plan Educativo Local 2027-2033.

#### Criterios de Aceptación

1. THE Sitio SHALL mostrar en la página de consulta ciudadana los seis estamentos: Padres/madres/apoderados, Estudiantes, Docentes, Asistentes de la educación, Asistentes de jardines y salas cuna, y Equipos directivos.
2. WHILE un cuestionario de estamento está activo, THE Sitio SHALL mostrar un enlace funcional al cuestionario externo (SurveyMonkey u otra plataforma) con el estado "Activo" claramente indicado.
3. WHILE un cuestionario de estamento no está disponible aún, THE Sitio SHALL mostrar la fecha estimada de apertura y deshabilitar el botón de acceso (texto "Próximamente").
4. THE Sitio SHALL mostrar la fecha de cierre del proceso de consulta en la sección principal de la página.
5. THE Sitio SHALL mostrar instrucciones específicas de participación para el estamento "Apoderados" indicando que se debe ingresar el RUT del estudiante sin puntos ni dígito verificador.
6. THE Sitio SHALL indicar que el proceso activo corresponde al diagnóstico para el Plan Educativo Local del período 2027-2033.

---

### Requisito 8: Accesibilidad

**User Story:** Como usuario con necesidades especiales, quiero poder ajustar el contraste y el tamaño del texto del sitio para poder leer el contenido sin dificultad.

#### Criterios de Aceptación

1. THE Accesibilidad_Bar SHALL ofrecer un botón de alto contraste que alterne la clase `alto-contraste` en el elemento `body`.
2. THE Accesibilidad_Bar SHALL ofrecer un botón para aumentar el texto que alterne la clase `texto-grande` en el elemento `body`.
3. THE Accesibilidad_Bar SHALL ofrecer un botón para reducir el texto que alterne la clase `texto-pequeno` en el elemento `body`.
4. WHEN el usuario activa alto contraste o modifica el tamaño de texto, THE Sitio SHALL persistir la preferencia en `localStorage` con las claves `altoContraste` y `tamanoTexto`.
5. WHEN el usuario recarga una página, THE Sitio SHALL restaurar automáticamente las preferencias de accesibilidad guardadas en `localStorage` antes de renderizar el contenido.
6. WHEN el usuario activa el aumento de texto, THE Accesibilidad_Bar SHALL desactivar visualmente el botón de reducción de texto, y viceversa, para que ambos estados sean mutuamente excluyentes.
7. THE Sitio SHALL incluir atributos `alt` descriptivos en todas las imágenes con contenido informativo.
8. THE Sitio SHALL incluir atributos `aria-label` en todos los iconos de redes sociales que no contienen texto visible.

---

### Requisito 9: Optimización para Motores de Búsqueda y Metadatos

**User Story:** Como administrador del SLEP, quiero que el sitio esté correctamente etiquetado para motores de búsqueda y redes sociales, para que los ciudadanos puedan encontrar información del SLEP fácilmente.

#### Criterios de Aceptación

1. THE Sitio SHALL incluir en cada página las metaetiquetas: `charset`, `viewport`, `description`, `keywords` y `author`.
2. THE Sitio SHALL incluir un favicon (`vector v slep.png`) en todas las páginas.
3. THE Sitio SHALL incluir en la página de inicio metadatos Open Graph: `og:title`, `og:description`, `og:image`, `og:url` y `og:type`.
4. THE Sitio SHALL incluir en la página de inicio datos estructurados JSON-LD de tipo `GovernmentOrganization` con nombre, descripción, dirección y URL de la organización.
5. THE Sitio SHALL incluir un archivo `robots.txt` en la raíz del directorio público.
6. THE Sitio SHALL incluir un archivo `sitemap.xml` en la raíz del directorio público.

---

### Requisito 10: Transparencia y Cumplimiento Normativo

**User Story:** Como ciudadano o fiscalizador, quiero acceder fácilmente a los portales de transparencia y cumplimiento normativo del SLEP, para ejercer mis derechos garantizados por la Ley de Transparencia y la Ley de Lobby.

#### Criterios de Aceptación

1. THE Sitio SHALL mostrar en la página de inicio, en una sección destacada, los enlaces a: la plataforma Ley del Lobby (leylobby.gob.cl/instituciones/AJ029), el Portal de Transparencia Activa y el Portal de Transparencia Pasiva del SLEP.
2. THE Footer SHALL incluir en todas las páginas los enlaces a: Ministerio de Educación, Ley de Lobby, Transparencia Activa, Transparencia Pasiva y Trámites Online.
3. THE Sitio SHALL proporcionar acceso a Trámites Online mediante el sistema DEP (tramites.dep.gob.cl/tramites/iniciar/173) desde la Top_Bar y el Footer de todas las páginas.
4. THE Sitio SHALL mostrar en la página de participación los mecanismos COSOC y CLEP como instancias formales de fiscalización ciudadana con sus respectivos enlaces a las actas.

---

### Requisito 11: Páginas de Recursos Internos para Funcionarios

**User Story:** Como funcionario del SLEP, quiero acceder a recursos internos y guías del gestor documental desde el sitio institucional, para poder realizar mis tareas sin depender de comunicación directa.

#### Criterios de Aceptación

1. THE Sitio SHALL disponer de la página `gestor-documental.html` con guías descargables en PDF del sistema gestor documental interno.
2. THE Sitio SHALL disponer de la página `recursos-internos.html` para funcionarios del SLEP.
3. WHERE el funcionario necesita acceder a la intranet, THE Sitio SHALL proporcionar un enlace a valparaiso.caschile.cl desde la página de inicio (acceso rápido "Intranet") y desde el Carousel de información destacada.
4. THE Sitio SHALL servir los documentos del gestor documental (manuales PDF) desde la ruta `public/documentos/Gestor_dcumental/`.

---

### Requisito 12: Búsqueda Global de Noticias

**User Story:** Como usuario, quiero buscar noticias del SLEP desde cualquier página del sitio, para encontrar rápidamente artículos sobre temas que me interesen.

#### Criterios de Aceptación

1. THE Navegacion SHALL incluir un campo de búsqueda visible en la barra de navegación en pantallas de escritorio.
2. WHEN el usuario submite el formulario de búsqueda con un término no vacío, THE Sitio SHALL redirigir al usuario a la página de noticias con el parámetro de búsqueda `q` en la URL (por ejemplo: `/noticias?q=término`).
3. WHEN la página de noticias carga con el parámetro `q` en la URL, THE Motor_Noticias SHALL leer el parámetro y aplicar el filtro de búsqueda automáticamente sobre el array de noticias.
4. IF el usuario submite el formulario de búsqueda con un campo vacío, THEN THE Sitio SHALL no redirigir al usuario y mantener la página actual.

---

### Requisito 13: Animaciones y Experiencia Visual

**User Story:** Como usuario, quiero que las secciones aparezcan de forma progresiva y agradable al hacer scroll, para tener una experiencia de navegación moderna y atractiva.

#### Criterios de Aceptación

1. THE Sitio SHALL inicializar la librería AOS (Animate On Scroll) en todas las páginas con duración de 800ms, easing `ease-in-out`, ejecución única (`once: true`) y offset de 100px.
2. THE Sitio SHALL aplicar atributos `data-aos` en encabezados de sección, tarjetas y filas de contenido para activar animaciones `fade-down` y `fade-up` según el elemento.
3. WHERE se usan retrasos escalonados en filas de tarjetas, THE Sitio SHALL aplicar `data-aos-delay` incremental (100ms, 200ms, 300ms) para animar los elementos en secuencia.
