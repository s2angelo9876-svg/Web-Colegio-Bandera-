# Evidencia de la auditoría local

Fecha: 17/11/2026. Commit examinado: `b2db12d1b731551cdc8807ec9c6068a7f8005c6a`.

Estos archivos acompañan al [SDD](../SDD-REIMPLEMENTACION-PHP.md) y a la [auditoría](../AUDITORIA-ACTUAL.md). Son evidencia de la aplicación **actual**, no de una versión PHP implementada.

## Entorno y alcance

- Node `v24.22.1`, npm `11.9.0`; dependencias instaladas mediante `npm ci` y lockfiles existentes.
- PostgreSQL 17 en contenedor local. Base específica `colegio_audit_20261117`; seis migraciones del repositorio aplicadas por el arranque actual.
- Datos ficticios creados exclusivamente para observar publicaciones, borradores, contenido futuro, etiquetas y administrativos.
- API en puerto local 3001 y Vite en 5174, con proxy de desarrollo y URLs relativas configurados mediante archivos auxiliares fuera del checkout. Esa configuración de auditoría no demuestra que el script original de desarrollo esté completo.
- Chromium headless instalado en el entorno y Playwright disponible como herramienta de auditoría. Vistas de 1440×1000 y 390×844.
- No se probaron la base de producción, servicios externos, correo real, archivos personales ni hosting del colegio.

## Resultados conservados

| Archivo | Qué contiene | Qué no demuestra |
|---|---|---|
| [tests.log](tests.log) | 29 pruebas Jest y 14 Vitest aprobadas. | Paridad completa, seguridad o corrección de toda la UI. |
| [lint.log](lint.log) | Fallo de lint, 40 errores y 17 advertencias. | Que los 57 avisos sean fallos visibles o vulnerabilidades. |
| [build.log](build.log) | Build completado y advertencia de tamaño del fragmento administrativo. | Rendimiento real en teléfonos o velocidad del hosting. |
| [audit-frontend.json](audit-frontend.json) | Auditoría npm completa del frontend. | Explotación de todos los avisos. |
| [audit-backend.json](audit-backend.json) | Auditoría npm completa del backend. | Incidentes reales o exposición del despliegue no inspeccionado. |
| [audit-frontend-prod.json](audit-frontend-prod.json) | Consulta npm con `--omit=dev`. | Independencia de todos los paquetes/avisos contados. |
| [audit-backend-prod.json](audit-backend-prod.json) | Consulta npm con `--omit=dev`. | Que eliminar React resuelva riesgos del servidor. |
| [api.json](api.json) | Estado HTTP, formas de respuesta y comprobaciones sobre datos sintéticos. | Acceso a infraestructura o contenido real. |
| [browser.json](browser.json) | 22 observaciones DOM, errores de página, vistas y recorridos de lectura. | Auditoría completa con lectores de pantalla o todos los navegadores. |
| [keyboard.json](keyboard.json) | Ensayo puntual del submenú con foco y ratón apartado. | Certificación de accesibilidad del menú completo. |
| [manifest.json](manifest.json) | SHA-256 y tamaño de los archivos listados. | Firma de terceros o cadena de custodia forense. |

La comprobación inicial `keyboard_desktop_submenu` del archivo browser puede conservar hover del puntero de una interacción anterior. Para sacar conclusiones se utiliza el ensayo aislado `keyboard.json`, el código y la falta de atributos de estado, no esa observación inicial por sí sola.

Las capturas representan datos ficticios. En particular, una foto/URL ausente introducida como fixture sirve para observar construcción de URLs y fallbacks; no demuestra que una imagen concreta de producción esté rota. Los placeholders remotos y fuentes externas pueden fallar por la política de red del entorno. El primer intento de navegador con `networkidle` se interrumpió por timeout; el recorrido conservado terminó con `domcontentloaded` y espera acotada. No se describe ese timeout como un fallo general de carga en producción.

## Capturas

| Pantalla | Escritorio | Móvil |
|---|---|---|
| Inicio | [Ver](desktop-inicio.png) | [Ver](mobile-inicio.png) |
| Noticias | [Ver](desktop-noticias.png) | [Ver](mobile-noticias.png) |
| Comunicados | [Ver](desktop-comunicados.png) | [Ver](mobile-comunicados.png) |
| Mesa de partes | [Ver](desktop-mesa-partes.png) | [Ver](mobile-mesa-partes.png) |
| Dashboard | [Ver](desktop-admin.png) | [Ver](mobile-admin.png) |
| Administración de noticias | [Ver](desktop-admin-noticias.png) | [Ver](mobile-admin-noticias.png) |

El dashboard móvil muestra recorte dentro de su área principal aunque la medición de scroll horizontal global sea falsa. La captura de administración de noticias muestra ausencia de layout persistente. El comunicado ficticio de tipo urgente aparece como General y sin el cuerpo enviado por API.

## Reproducción segura

1. Usar la revisión indicada y un entorno local aislado con dependencias bloqueadas. No apuntar pruebas de escritura a producción.
2. Crear una base desechable separada; aplicar las migraciones y configurar usuario administrativo aleatorio mediante variables privadas. No copiar valores de secretos a este directorio.
3. Cargar los [fixtures sintéticos](fixtures.sql). Para repetir, recrear la base o gestionar fixtures por transacción/ID; el archivo no es una semilla de producción ni se afirma idempotente.
4. Iniciar backend y frontend de auditoría con proxy coherente. Verificar BD saludable antes de navegar.
5. Comparar listado público de noticias con la variante `admin=true`; consultar búsqueda por el marcador de borrador, estadísticas y diagnóstico. Registrar solo el resultado mínimo.
6. Validar paginación negativa y las rutas de sitemap; probar reordenamiento de administrativos con cuenta autorizada.
7. Para revocación, crear una cuenta de editor ficticia, iniciar sesión, cambiar su rol/eliminarla en esa base aislada y volver a consultar. No publicar tokens ni capturarlos en screenshots.
8. Navegar las rutas registradas en browser.json con ambos tamaños; probar Expandir Noticia, menú con teclado y navegación administrativa.
9. Ejecutar pruebas, lint, build y consultas npm; preservar código de salida. npm audit con hallazgos puede terminar distinto de cero y no equivale a una instalación fallida.
10. Detener los servicios propios de auditoría y eliminar la base sintética al terminar, conservando resultados saneados. No detener servicios previos del usuario.

Los scripts auxiliares de ejecución se crearon fuera del checkout para no modificar la aplicación. Este paquete conserva resultados y procedimiento, sin archivos .env, cookies, JWT o credenciales. La futura suite PHP deberá automatizar las regresiones descritas en la matriz de aceptación.
