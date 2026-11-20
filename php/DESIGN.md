# Diseño técnico de la reimplementación

Esta revisión aplica las decisiones técnicas F0–F3 del SDD 1.0 publicado en GitHub en `fbe29e9`. Vincula rutas, permisos y pruebas con las observaciones de la auditoría. La portada usa los recursos del repositorio. La composición visual y los datos oficiales se aprueban con el colegio antes de la carga institucional. [SDD y anexos](https://github.com/s2angelo9876-svg/Web-Colegio-Bandera-/tree/fbe29e907b102d93106fd9f45acab2e4591e007d/docs)

## Contratos

| Ruta | Método | Acceso y resultado |
| --- | --- | --- |
| `/`, `/{módulo}`, `/{módulo}/{slug}` | GET | Portada, listado paginado y detalle con la revisión pública vigente. URL ausente devuelve 404. |
| `/buscar?q=…`, `/tags`, `/tags/{slug}` | GET | Texto completo en español y etiquetas sobre revisiones públicas. |
| `/robots.txt`, `/sitemap.xml` | GET | Sitemap de páginas vigentes cuando se configura el origen canónico. |
| `/medio/{id}` | GET | Medio de la revisión pública vigente. `tam=mini` solicita la variante ligera. |
| `/documentos/{slug}/descargar` | GET | Descarga estable del PDF vigente. El enlace histórico de un PDF previamente publicado redirige a esta ruta mientras su documento siga público. |
| `/health/live`, `/health/ready` | GET | El primero comprueba el proceso. El segundo exige PostgreSQL y las migraciones aplicadas y devuelve 503 cuando la aplicación no está lista. |
| `/medio/{id}?revision={id}` | GET | Medio de la revisión accesible solo al rol con permiso de vista previa. |
| `/admin/ingresar` | GET, POST | Formulario y autenticación con CSRF y rotación del identificador de sesión. |
| `/admin/salir` | POST | Elimina la sesión y redirige al formulario de ingreso. |
| `/admin/{módulo}[/{id}]` | GET | Listado, papelera y editor según rol. `/nuevo` abre el alta. |
| `/admin/{módulo}/{id}/vista?revision={id}` | GET | Vista previa autorizada con historial reciente. |
| `/admin/{módulo}/{id}/guardar` | POST | Guarda una revisión. El identificador 0 crea. JSON devuelve 201 en alta y 200 en edición. El 409 conserva la versión base y el contenido enviado en la respuesta HTML. |
| `/admin/{módulo}/{id}/{acción}` | POST | Publica, programa, cancela programación, retira, archiva o restaura. Autoriza rol, CSRF y versión. |
| `/admin/{módulo}/reordenar` | GET, POST | Devuelve el conjunto completo. El POST guarda posiciones consecutivas bajo bloqueo transaccional. |
| `/admin/etiquetas` | GET, POST | Administrador y editor consultan y crean. El administrador renombra, archiva o restaura. |
| `bin/console.php` | CLI | Migra, provisiona, revoca, materializa publicación y limpia sesiones y límites caducados. |

## Permisos de escritura

| Módulo | Regla en el sistema anterior | Regla en PHP |
| --- | --- | --- |
| Noticias, comunicados, eventos | Administrador o editor en alta y edición. Baja administrativa. | El editor guarda, publica, programa y retira. El administrador también mueve a papelera y restaura. |
| Galería y carrusel | Administrador o editor en alta y orden. Baja administrativa. | El editor también ordena el conjunto. Papelera y restauración son administrativas. |
| Docentes | Administrador o editor en alta, cambios y orden. Baja administrativa. | Misma regla que galería. |
| Documentos, administrativos, directivos, inicio | Mutaciones administrativas. | Administración exclusiva. |
| Páginas institucionales | Contenido existente en plantillas. | Administración exclusiva hasta validar responsables editoriales. |

Las cuentas previas con `publisher` conservan acceso con las mismas capacidades editoriales. Las sesiones se guardan en PostgreSQL con hash del token, generación de la cuenta, 30 minutos de inactividad y ocho horas de duración absoluta. Cambiar contraseña, cambiar rol o desactivar la cuenta revoca el acceso en la siguiente petición. Los límites de ingreso por cuenta e IP se coordinan en PostgreSQL.

## Publicación, archivos y retención

Cada cambio guarda contenido, etiquetas, medio y evento editorial en una transacción. La consola evita la revocación del último administrador activo. Una entrada tiene punteros a la revisión de trabajo, publicada y programada. La programación congela el identificador de revisión y puede cancelarse mientras siga futura. La publicación vigente conserva su fecha. Los cambios posteriores de trabajo permanecen privados y la vista previa de inicio ejecuta la misma plantilla pública. Se aplica la misma selección de revisión al detalle, portada, búsqueda, etiquetas, sitemap y archivos. La caché de estas respuestas está desactivada con `no-store` hasta disponer de un requisito de carga. La vista previa está autorizada y las rutas administrativas llevan `noindex`.

Se admite un medio por revisión. JPEG, PNG y WebP se decodifican con un máximo de 10 MiB y 12 megapíxeles, y se convierten a WebP con orientación corregida y variantes de hasta 1600 y 640 píxeles. Los documentos admiten PDF de hasta 15 MiB con comprobación estructural de qpdf. El formato no permitido devuelve 415 y el tamaño excedido 413. PostgreSQL conserva los binarios junto con la revisión. Los enlaces HTTPS de vídeo se abren en su origen. El reproductor integrado de YouTube se carga tras una acción del visitante. Los expedientes privados tendrán su propio contrato en F4. Su cardinalidad inicial prevista es un adjunto y el código de consulta no autorizará su descarga.

La papelera cancela la programación y restaura como borrador. Las revisiones y archivos asociados se conservan hasta definir retención y purga con el colegio. La portabilidad de archivos, privacidad, respaldos, restauración, accesibilidad y compatibilidad con consumidores externos se validarán antes de un cambio de plataforma.

## Trazabilidad de requisitos

| RF | Implementación y aceptación |
| --- | --- |
| 01 | Portada renderizada con destacados y novedades. Pruebas HTTP sobre noticias e inicio. |
| 02 | Páginas institucionales versionadas y redirecciones de secciones anteriores. Prueba de redirección y lectura. La publicación de material institucional requiere revisión. |
| 03 | Edición enriquecida, detalle, revisión pública separada, búsqueda, etiquetas y programación. Pruebas de ciclo, conflicto, medio y visibilidad. |
| 04–10 | Comunicados, eventos, galería, documentos, docentes, administrativos y directivos usan el flujo editorial. Pruebas de alta, edición, publicación, papelera y restauración por módulo, además de filtros, calendario, descarga estable y orden público verificable. |
| 11 | Diapositivas ordenadas, controles de selección y alternativa en la lista de destacados. |
| 12 | Foto o carrusel, lema, pilares, cuatro métricas con fuente, acceso configurable y contacto. Pruebas de vista previa y proyección pública. |
| 13–14 | Mesa de partes y admisiones reservadas a F4. Falta validar privacidad, límites de anexos y catálogo de comunicaciones. |
| 15–16 | Cuentas, roles y revocación por consola. Gestión web, cambio y recuperación de cuenta se reservan a fases posteriores. |
| 17 | Etiquetas por revisión, slug normalizado, archivo lógico y conteo aplicado solo a publicaciones vigentes. La migración 003 reconcilia las variantes del esquema PHP anterior. |
| 18–21 | Dashboard de métricas, actividad, notificaciones y visitas reservados a F4. |
| 22 | Tokens claros y oscuros, selector persistente y pruebas de contraste de texto, enlaces, botones y foco. |
| 23 | Ayuda, bienvenida y recorridos reservados a F4. |
| 24 | Detalles enlazables, búsqueda española, 301 históricas de navegación y sitemap según visibilidad. Los consumidores de la API antigua se deben inventariar antes del corte. |

## Cierre de decisiones y operación

El equipo técnico mantiene los contratos, la revisión de dependencias, los permisos y las pruebas. El colegio valida identidad, textos, fuentes de cifras y retención antes del uso institucional. La operación valida alojamiento, configuración TLS, restauración, tráfico representativo y redirecciones de integraciones antes del corte. El flujo PHP se verificó con datos sintéticos y una actualización desde el esquema PHP anterior. La migración de la base React/Express y sus ficheros corresponde a F6.

Consulta los controles técnicos y la evidencia que se debe conservar para el SGSI. [Seguridad y operación](SECURITY.md)
