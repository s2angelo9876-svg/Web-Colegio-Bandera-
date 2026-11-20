# Auditoría de interfaz del portal PHP

Revisé 46 pantallas con datos sintéticos. El recorrido incluyó portada, institución, noticias, comunicados, eventos y calendario, galería, documentos y descarga, directorios, etiquetas, búsqueda, errores e ingreso. En el CMS cubrí el inicio del panel, los listados de cada módulo, creación, edición, vista previa, papelera y orden de registros.

## Parpadeo al navegar

Cada enlace abre un documento nuevo. La versión inicial dibujaba el documento con el tema del sistema y el menú móvil desplegado. El script diferido leía la preferencia guardada y plegaba el menú después de ese dibujo. Reproduje el efecto retrasando la respuesta de `site.js` al abrir Eventos y Noticias.

| Escenario | Antes | Después |
| --- | --- | --- |
| Móvil de 390 px con modo oscuro guardado | El fondo pasó de `#F7F6F3` a `#111A28` y el encabezado bajó de 220,5 a 70,6 px | Fondo oscuro y encabezado de 70,6 px desde el primer dibujo |
| Móvil de 390 px siguiendo el sistema | El encabezado bajó de 220,5 a 70,6 px | Encabezado de 70,6 px desde el primer dibujo |
| Escritorio de 1440 px con modo claro guardado sobre sistema oscuro | El fondo pasó de `#111A28` a `#F7F6F3` | Fondo claro desde el primer dibujo |

El documento carga una inicialización breve desde el mismo origen antes de la hoja de estilos. El menú y el tema funcionan mientras se carga el resto del JavaScript. En móvil y escritorio, las capturas antes y después de liberar el script diferido coincidieron píxel por píxel. También comprobé el botón Atrás, la sincronización del tema entre pestañas y la navegación con JavaScript desactivado.

## Hallazgos y correcciones

| Área | Hallazgo | Corrección |
| --- | --- | --- |
| Nombre de enlace | El nombre accesible de la marca difería del texto visible. La comprobación falló en los 92 escaneos iniciales. | El nombre del enlace se obtiene del texto visible de la marca. |
| Jerarquía de contenido | Los catálogos y el calendario saltaban de H1 a H3. La comprobación falló 20 veces entre ambos tamaños. | Las tarjetas de catálogo usan H2. Las tarjetas dentro de una sección con H2 usan H3. El calendario tiene un encabezado de sección. |
| Formularios | El borde claro de los campos tenía un contraste de 2,18:1 sobre blanco y 1,96:1 sobre la superficie secundaria. | El nuevo borde tiene un contraste de 3,42:1 sobre blanco y 3,07:1 sobre la superficie secundaria. |
| Navegación | El enlace activo dependía del color y el menú abierto podía invadir el alto visible en horizontal. | El enlace activo tiene subrayado. El menú cabe en pantallas bajas, permite desplazamiento, mantiene enlaces de 44 px y se cierra al salir con el foco. Escape devuelve el foco al botón. |

## Verificación

- Ejecuté axe-core 4.14.1 sobre las 46 pantallas en móvil oscuro de 390 px y escritorio claro de 1440 px. Los 92 escaneos posteriores registraron cero hallazgos para las reglas ejecutadas.
- Comprobé nueve recorridos públicos y editoriales en nueve anchos entre 320 y 1440 px. Las 81 comprobaciones registraron cero desbordes horizontales.
- Revisé visualmente la portada, el calendario, la galería y el editor. La evidencia corresponde a Chromium. La evaluación de contraste incluye texto, foco y borde de campos en ambos temas.
- Pasaron las 278 comprobaciones HTTP y de estado, las migraciones y la suite de navegador. La regresión comprueba el tema y el menú con el script secundario interceptado.

Consulté las guías de tema, navegación, accesibilidad, contraste y tamaños táctiles para interpretar los hallazgos y verificar las correcciones. [Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance)
