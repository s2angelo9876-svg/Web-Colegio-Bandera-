# Auditoría de la aplicación actual y catálogo de correcciones

**Anexo normativo del [SDD](SDD-REIMPLEMENTACION-PHP.md).** Línea base `b2db12d1b731551cdc8807ec9c6068a7f8005c6a`, 17/11/2026. Todos los requisitos correctivos están pendientes de implementación.

Las fuentes con línea se refieren a esa revisión; E = ejecución local, C = código, R = riesgo pendiente de validación, D = decisión de diseño. La severidad es prioridad del proyecto, no CVSS. El entorno usó datos ficticios y no se auditó una instalación de producción.

## Resumen de 48 hallazgos

| ID | Prioridad | Evidencia | Hallazgo |
|---|---|---|---|
| [H-01](#h-01) | P0 | E+C | El parámetro admin=true permite leer borradores sin autenticación |
| [H-02](#h-02) | P0 | E+C | Buscador y estadísticas públicas revelan contenido no publicado |
| [H-03](#h-03) | P1 | E+C | Diagnóstico de esquema y usuarios accesible sin sesión |
| [H-04](#h-04) | P0 | E+C | Revocar rol o eliminar usuario no revoca su JWT |
| [H-05](#h-05) | P1 | C | Sesión duplicada en localStorage y fallback de autenticación débil en UI |
| [H-06](#h-06) | P1 | E+C | El limitador general está registrado después de la mayoría de rutas |
| [H-07](#h-07) | P1 | C+R | Los adjuntos de trámites comparten almacenamiento público |
| [H-08](#h-08) | P1 | C | La conexión PostgreSQL desactiva validación del certificado en producción |
| [H-09](#h-09) | P1 | C+R | La exportación CSV no neutraliza fórmulas |
| [H-10](#h-10) | P1 | C | El bootstrap permite crear un administrador con contraseña conocida |
| [H-11](#h-11) | P2 | C+R | Existe un endpoint temporal de reseteo administrativo |
| [H-12](#h-12) | P1 | C+R | No se identifica una protección CSRF explícita para las mutaciones con cookie |
| [H-13](#h-13) | P1 | E+C | La portada interpreta la respuesta de noticias con un formato incompatible |
| [H-14](#h-14) | P1 | E+C | Expandir Noticia es un botón inerte y no hay detalle público |
| [H-15](#h-15) | P1 | E+C | Comunicados espera contenido/categoria y la API devuelve descripcion/tipo |
| [H-16](#h-16) | P2 | C | La búsqueda de noticias solo filtra la página descargada y la búsqueda global no abre el resultado |
| [H-17](#h-17) | P1 | C | Construcción inconsistente de URLs de imágenes |
| [H-18](#h-18) | P1 | E+C | La navegación del CMS desaparece fuera del dashboard |
| [H-19](#h-19) | P1 | E+C | Dashboard móvil recortado por sidebar fijo |
| [H-20](#h-20) | P1 | C | El remitente no recibe el código en pantalla ni un acceso visible al seguimiento |
| [H-21](#h-21) | P1 | C | La bandeja de trámites no permite leer el expediente completo |
| [H-22](#h-22) | P2 | C | Formato y tamaño de adjuntos anunciados no coinciden con el servidor |
| [H-23](#h-23) | P1 | E+C | Reordenamiento de administrativos tiene ruta, esquema y contrato incompatibles |
| [H-24](#h-24) | P1 | E+C | Dos tablas para etiquetas de noticias y evolución incompleta de tags |
| [H-25](#h-25) | P1 | C+R | Escrituras editoriales y archivos carecen de atomicidad completa |
| [H-26](#h-26) | P1 | C | Etiquetas aplican una política de publicación diferente |
| [H-27](#h-27) | P2 | C | Los pilares editables no se consumen en Inicio |
| [H-28](#h-28) | P2 | C | Páginas institucionales y directivos están codificados en la interfaz |
| [H-29](#h-29) | P2 | C | Capacidades de API no tienen recorrido administrativo/público completo |
| [H-30](#h-30) | P2 | E+C | Semántica y estados accesibles de navegación incompletos |
| [H-31](#h-31) | P2 | C+R | Accesibilidad de modales y reordenamiento requiere un contrato uniforme |
| [H-32](#h-32) | P2 | E+C | Texto pequeño y etiquetado de controles insuficiente |
| [H-33](#h-33) | P2 | E+C | Fallos de carga pueden mostrarse como listas vacías |
| [H-34](#h-34) | P2 | E+C | Rutas desconocidas y metadatos globales perjudican navegación y SEO |
| [H-35](#h-35) | P2 | E+C | robots.txt anuncia un sitemap inexistente y el sitemap repite URLs |
| [H-36](#h-36) | P2 | C+D | Identidad y contacto contienen valores de ejemplo o sin validación |
| [H-37](#h-37) | P2 | C+D | Portada y navegación no materializan la nueva dirección visual |
| [H-38](#h-38) | P2 | C+R | Tema oscuro depende de sobrescrituras globales de utilidades |
| [H-39](#h-39) | P1 | E | El control lint del propio repositorio falla |
| [H-40](#h-40) | P2 | E+C | Arranque de desarrollo y herramientas no están definidos de forma reproducible |
| [H-41](#h-41) | P1 | E+R | La auditoría de dependencias reporta alertas de seguridad |
| [H-42](#h-42) | P1 | E+C | Las pruebas existentes no cubren los recorridos que fallan |
| [H-43](#h-43) | P2 | C+R | Las notificaciones son globales y accesibles a cualquier usuario autenticado |
| [H-44](#h-44) | P2 | C | Readiness y migraciones no representan correctamente fallo de dependencias |
| [H-45](#h-45) | P2 | C | Cron muta por GET y comparte secreto de autenticación como fallback |
| [H-46](#h-46) | P2 | C | Mutaciones pueden confirmar éxito sobre un ID inexistente |
| [H-47](#h-47) | P2 | E+C | Paginación negativa llega a SQL y filtra errores internos |
| [H-48](#h-48) | P2 | C+R+D | Privacidad, retención y minimización necesitan definición explícita |

## Detalle y criterios de cierre

<a id="h-01"></a>

### H-01 — El parámetro admin=true permite leer borradores sin autenticación

**Prioridad:** P0. **Evidencia:** E+C. **Capacidades:** RF-03,RF-04,RF-05. **Fase:** F1/F2.

**Fuentes:** [backend/controllers/noticiaController.js:24](../backend/controllers/noticiaController.js#L24), [backend/controllers/comunicadoController.js:6](../backend/controllers/comunicadoController.js#L6), [backend/controllers/eventoController.js:7](../backend/controllers/eventoController.js#L7), [backend/routes/noticiaRoutes.js:16](../backend/routes/noticiaRoutes.js#L16).

**Situación actual:** La consulta pública de noticias restringe estados; con admin=true omite ese filtro sin exigir sesión. En la base aislada, la consulta normal devolvió una publicación y la variante anónima devolvió tres, incluido AUDIT_BORRADOR_No publicar.

**Impacto y límite:** Exposición de contenido editorial no publicado. El mismo patrón existe en comunicados y eventos; la reproducción con fixtures se realizó en noticias.

**RC-H-01 — Corrección obligatoria:** Separar consultas públicas y administrativas; autorizar estas últimas en servidor. Ignorar o rechazar parámetros que intenten elevar privilegios. Aplicar una política pública común.

**AC-H-01 — Criterio de aceptación:** Anónimo y usuario sin permiso no obtienen borradores ni programados mediante parámetros, IDs, filtros o paginación. Un editor autorizado sí consulta sus listados internos.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-02"></a>

### H-02 — Buscador y estadísticas públicas revelan contenido no publicado

**Prioridad:** P0. **Evidencia:** E+C. **Capacidades:** RF-18,RF-24. **Fase:** F1/F2.

**Fuentes:** [backend/index.js:157](../backend/index.js#L157), [backend/controllers/statsController.js:48](../backend/controllers/statsController.js#L48), [backend/routes/statsRoutes.js:5](../backend/routes/statsRoutes.js#L5).

**Situación actual:** La búsqueda global no filtra estado/fecha. El endpoint de estadísticas es público y consulta noticias recientes sin ese filtro. Ambos devolvieron el título de un borrador sintético en peticiones anónimas.

**Impacto y límite:** Cerrar el listado principal no basta: otros canales revelan información reservada y métricas operativas.

**RC-H-02 — Corrección obligatoria:** Aplicar visibilidad centralizada a búsquedas/proyecciones públicas y exigir permiso para estadísticas internas. Separar estadísticas institucionales públicas expresamente aprobadas.

**AC-H-02 — Criterio de aceptación:** Buscar el título exacto de un borrador no lo revela; /admin/estadisticas exige sesión y capacidad; todas las proyecciones públicas excluyen contenido futuro.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-03"></a>

### H-03 — Diagnóstico de esquema y usuarios accesible sin sesión

**Prioridad:** P1. **Evidencia:** E+C. **Capacidades:** RF-15. **Fase:** F1.

**Fuentes:** [backend/routes/debugRoutes.js:6](../backend/routes/debugRoutes.js#L6), [backend/routes/debugRoutes.js:36](../backend/routes/debugRoutes.js#L36), [backend/index.js:149](../backend/index.js#L149).

**Situación actual:** Las rutas /api/_debug/debug/tables y /api/_debug/debug/test-query respondieron 200 sin autenticación. La primera enumeró 22 tablas locales; la segunda consulta identificadores, usernames y roles.

**Impacto y límite:** Divulgación innecesaria de estructura y cuentas. No se afirma que estas rutas estén expuestas en una instalación real no inspeccionada.

**RC-H-03 — Corrección obligatoria:** Eliminar diagnósticos de la superficie pública. Proporcionar comandos CLI y observabilidad mínima con permisos.

**AC-H-03 — Criterio de aceptación:** Las antiguas rutas devuelven 404 en producción y no hay una ruta HTTP equivalente que enumere usuarios/esquema sin autorización.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-04"></a>

### H-04 — Revocar rol o eliminar usuario no revoca su JWT

**Prioridad:** P0. **Evidencia:** E+C. **Capacidades:** RF-15,RF-16. **Fase:** F1.

**Fuentes:** [backend/middleware/authMiddleware.js:28](../backend/middleware/authMiddleware.js#L28), [backend/controllers/authController.js:42](../backend/controllers/authController.js#L42), [backend/controllers/authController.js:65](../backend/controllers/authController.js#L65).

**Situación actual:** El middleware verifica firma/expiración y confía en el rol del token. Tras degradar un editor sintético a user, su token creó una etiqueta con 201. Tras eliminarlo, verificar devolvió 200 y valido=true.

**Impacto y límite:** Una cuenta retirada conserva capacidades hasta expirar el token. Logout solo borra la cookie y no invalida otras copias del token.

**RC-H-04 — Corrección obligatoria:** Sesiones en servidor, usuario activo y versión de acceso comprobados por petición. Revocar al cambiar permisos, desactivar, recuperar contraseña o cerrar sesiones.

**AC-H-04 — Criterio de aceptación:** Sesión abierta pierde acceso en la siguiente petición después de revocación; logout invalida la sesión del servidor y una copia anterior no funciona.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-05"></a>

### H-05 — Sesión duplicada en localStorage y fallback de autenticación débil en UI

**Prioridad:** P1. **Evidencia:** C. **Capacidades:** RF-15. **Fase:** F1.

**Fuentes:** [frontend/src/context/authContext.jsx:17](../frontend/src/context/authContext.jsx#L17), [frontend/src/context/authContext.jsx:75](../frontend/src/context/authContext.jsx#L75), [frontend/src/services/api.js:14](../frontend/src/services/api.js#L14), [backend/controllers/authController.js:50](../backend/controllers/authController.js#L50).

**Situación actual:** El login devuelve JWT además de cookie HttpOnly; se guarda en localStorage. Si falla verificar, la UI acepta datos guardados y una comprobación local de estructura/expiración sin verificar firma.

**Impacto y límite:** Amplía exposición del token ante XSS y puede mostrar una sesión ficticia o desactualizada. Esto por sí solo no demuestra un bypass de las validaciones del backend.

**RC-H-05 — Corrección obligatoria:** Eliminar JWT del almacenamiento JS y fallbacks que restauren privilegios tras rechazo del servidor. Usar sesión de servidor y estados claros de reautenticación.

**AC-H-05 — Criterio de aceptación:** No hay token en localStorage; manipular datos del navegador no habilita páginas/acciones protegidas; una cookie válida es reconocida sin requerir evidencia en localStorage.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-06"></a>

### H-06 — El limitador general está registrado después de la mayoría de rutas

**Prioridad:** P1. **Evidencia:** E+C. **Capacidades:** RF-13,RF-15. **Fase:** F1.

**Fuentes:** [backend/index.js:79](../backend/index.js#L79), [backend/index.js:129](../backend/index.js#L129), [backend/index.js:154](../backend/index.js#L154).

**Situación actual:** apiLimiter se aplica después de montar routers que ya responden. Las peticiones probadas a noticias/diagnóstico no recibieron cabeceras de ese limitador. Login y tracking tienen limitadores específicos distintos.

**Impacto y límite:** El límite general anunciado no cubre los routers principales. No se ejecutó una prueba de carga o denegación de servicio.

**RC-H-06 — Corrección obligatoria:** Declarar limitación por categoría antes del despacho y del procesado de archivos; no depender de un middleware al final.

**AC-H-06 — Criterio de aceptación:** Pruebas con umbral reducido muestran 429/Retry-After para cada categoría protegida y no bloquean innecesariamente salud o activos.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-07"></a>

### H-07 — Los adjuntos de trámites comparten almacenamiento público

**Prioridad:** P1. **Evidencia:** C+R. **Capacidades:** RF-13. **Fase:** F1/F4/F6.

**Fuentes:** [backend/routes/mesaPartesRoutes.js:14](../backend/routes/mesaPartesRoutes.js#L14), [backend/config/storage.js:42](../backend/config/storage.js#L42), [backend/config/storage.js:53](../backend/config/storage.js#L53), [backend/index.js:98](../backend/index.js#L98).

**Situación actual:** Los adjuntos se procesan por el mismo adaptador que devuelve URL pública de Supabase o /uploads/mesa_partes. /uploads se sirve estáticamente. No hay clasificación privada en ese flujo.

**Impacto y límite:** Quien obtenga la URL puede acceder al adjunto fuera de la autorización del expediente. No se probaron archivos personales reales ni la política efectiva de un bucket remoto.

**RC-H-07 — Corrección obligatoria:** Clasificar archivos, usar ámbito privado y descargas autorizadas. Migrar/retirar los objetos públicos antiguos, no solo esconder el enlace.

**AC-H-07 — Criterio de aceptación:** Un PDF sintético privado no se descarga anónimamente ni por ID vecino; el usuario autorizado lo obtiene. Una URL pública antigua retirada deja de dar acceso.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-08"></a>

### H-08 — La conexión PostgreSQL desactiva validación del certificado en producción

**Prioridad:** P1. **Evidencia:** C. **Capacidades:** RF-15. **Fase:** F1/F7.

**Fuentes:** [backend/config/db.js:14](../backend/config/db.js#L14).

**Situación actual:** La configuración de producción utiliza ssl con rejectUnauthorized:false. La auditoría local funciona en desarrollo y no probó una conexión remota.

**Impacto y límite:** El cifrado puede no autenticar al servidor remoto; se debilita protección frente a intermediación.

**RC-H-08 — Corrección obligatoria:** Configurar CA/cadena y hostname válidos en el despliegue PHP/PDO. No desactivar verificación como solución a errores de conexión.

**AC-H-08 — Criterio de aceptación:** Con certificado válido conecta; con CA no confiable o hostname incorrecto falla. El procedimiento de despliegue conserva verificación TLS.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-09"></a>

### H-09 — La exportación CSV no neutraliza fórmulas

**Prioridad:** P1. **Evidencia:** C+R. **Capacidades:** RF-19. **Fase:** F4.

**Fuentes:** [backend/controllers/activityLogController.js:151](../backend/controllers/activityLogController.js#L151).

**Situación actual:** La función escape protege comillas y separadores pero no el comienzo de fórmulas. Títulos y detalles controlables pueden aparecer en el CSV.

**Impacto y límite:** Riesgo de interpretación de fórmulas al abrir la exportación en software de hojas de cálculo. No se ensayó ejecución de una fórmula en un equipo de personal.

**RC-H-09 — Corrección obligatoria:** Neutralizar prefijos peligrosos y conservar CSV válido. Definir aplicaciones destino, auditoría y límites de exportación.

**AC-H-09 — Criterio de aceptación:** Fixtures con =,+,-,@ y caracteres de control se abren como texto en aplicaciones acordadas; campos y filas no se alteran.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-10"></a>

### H-10 — El bootstrap permite crear un administrador con contraseña conocida

**Prioridad:** P1. **Evidencia:** C. **Capacidades:** RF-15,RF-16. **Fase:** F1/F7.

**Fuentes:** [backend/config/initDb.js:51](../backend/config/initDb.js#L51), [README.md:214](../README.md#L214).

**Situación actual:** Si la tabla está vacía y no se configuran semillas, se crea admin con una contraseña por defecto documentada. El entorno de auditoría usó valores aleatorios, no ese valor.

**Impacto y límite:** Una instalación nueva mal configurada puede comenzar con acceso predecible.

**RC-H-10 — Corrección obligatoria:** Alta inicial por CLI/invitación de un uso y configuración explícita; fallar en producción ante placeholders. Nunca crear una contraseña pública conocida.

**AC-H-10 — Criterio de aceptación:** Desplegar con BD vacía y sin bootstrap autorizado no produce una cuenta utilizable por defecto; la invitación válida expira y exige contraseña nueva.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-11"></a>

### H-11 — Existe un endpoint temporal de reseteo administrativo

**Prioridad:** P2. **Evidencia:** C+R. **Capacidades:** RF-16. **Fase:** F1.

**Fuentes:** [backend/routes/adminResetRoutes.js:23](../backend/routes/adminResetRoutes.js#L23), [backend/index.js:142](../backend/index.js#L142).

**Situación actual:** La ruta se monta siempre, pero solo opera con ENABLE_ADMIN_RESET=true y ADMIN_RESET_SECRET configurado. No se demostró que esté habilitada en producción.

**Impacto y límite:** Canal adicional de recuperación que depende de secretos/configuración temporal y del limitador general mal ubicado.

**RC-H-11 — Corrección obligatoria:** No llevar este endpoint a PHP. Recuperación por token de un uso y CLI de emergencia restringida y auditada.

**AC-H-11 — Criterio de aceptación:** Ruta antigua 404; recuperación ordinaria y operación CLI cuentan con pruebas de autorización y revocación de sesiones.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-12"></a>

### H-12 — No se identifica una protección CSRF explícita para las mutaciones con cookie

**Prioridad:** P1. **Evidencia:** C+R. **Capacidades:** RF-15. **Fase:** F1.

**Fuentes:** [backend/index.js:59](../backend/index.js#L59), [backend/controllers/authController.js:12](../backend/controllers/authController.js#L12), [backend/routes/authRoutes.js:21](../backend/routes/authRoutes.js#L21).

**Situación actual:** Se usan cookies y CORS/SameSite, pero no se observa un token CSRF o middleware equivalente por acción. La posibilidad de explotación cross-site concreta no fue probada.

**Impacto y límite:** Defensa incompleta ante escenarios que dependen del origen, sitio y despliegue. CORS no es sustituto universal de autorización/CSRF.

**RC-H-12 — Corrección obligatoria:** CSRF en formularios y mutaciones fetch, validación de origen como defensa adicional y métodos seguros.

**AC-H-12 — Criterio de aceptación:** Una mutación sin token o con token de otra sesión devuelve 403 y no cambia BD; una petición válida funciona; GET no modifica estado.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-13"></a>

### H-13 — La portada interpreta la respuesta de noticias con un formato incompatible

**Prioridad:** P1. **Evidencia:** E+C. **Capacidades:** RF-01,RF-03. **Fase:** F2/F5.

**Fuentes:** [frontend/src/pages/Inicio.jsx:48](../frontend/src/pages/Inicio.jsx#L48), [backend/controllers/noticiaController.js:82](../backend/controllers/noticiaController.js#L82).

**Situación actual:** La portada asigna resNoticias.data y llama map. El backend entrega {data,pagination}. La excepción se captura y las novedades quedan vacías aunque existe una noticia pública sintética.

**Impacto y límite:** La comunidad no ve publicaciones recientes; un fallo técnico se presenta como ausencia de publicaciones.

**RC-H-13 — Corrección obligatoria:** Contrato único y proyección de portada en servidor. Estados distintos para sin contenido y fallo de consulta.

**AC-H-13 — Criterio de aceptación:** Con una noticia y un comunicado publicados aparecen novedades; si falla la fuente se informa error sin afirmar catálogo vacío.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-14"></a>

### H-14 — Expandir Noticia es un botón inerte y no hay detalle público

**Prioridad:** P1. **Evidencia:** E+C. **Capacidades:** RF-03,RF-24. **Fase:** F2.

**Fuentes:** [frontend/src/pages/Noticias.jsx:68](../frontend/src/pages/Noticias.jsx#L68), [frontend/src/App.jsx:99](../frontend/src/App.jsx#L99).

**Situación actual:** El botón no tiene handler/destino y el router solo ofrece /noticias. Al pulsarlo no cambió URL ni contenido del documento en la prueba local.

**Impacto y límite:** No se puede leer la noticia completa ni compartir una publicación individual.

**RC-H-14 — Corrección obligatoria:** Página de detalle SSR por ID/slug y enlace real desde tarjetas, buscador, portada y etiquetas.

**AC-H-14 — Criterio de aceptación:** Pulsar/activar con teclado abre la noticia completa; la URL abre directamente y tiene título/canonical propios, también sin JS.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-15"></a>

### H-15 — Comunicados espera contenido/categoria y la API devuelve descripcion/tipo

**Prioridad:** P1. **Evidencia:** E+C. **Capacidades:** RF-04. **Fase:** F3.

**Fuentes:** [frontend/src/pages/Comunicados.jsx:21](../frontend/src/pages/Comunicados.jsx#L21), [frontend/src/pages/Comunicados.jsx:60](../frontend/src/pages/Comunicados.jsx#L60), [backend/controllers/comunicadoController.js:25](../backend/controllers/comunicadoController.js#L25).

**Situación actual:** Un comunicado sintético urgente apareció como General y sin su texto. Los nombres de campos no coinciden entre la UI y el contrato backend.

**Impacto y límite:** Pérdida de lectura y prioridad; filtros públicos incoherentes con el CMS.

**RC-H-15 — Corrección obligatoria:** Definir cuerpo/tipo canónicos y catálogo único; mapear datos heredados en migración, no perderlos ni rellenar categorías falsas.

**AC-H-15 — Criterio de aceptación:** Un comunicado urgente muestra su texto completo y categoría correcta; filtros y conteos coinciden con los datos.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-16"></a>

### H-16 — La búsqueda de noticias solo filtra la página descargada y la búsqueda global no abre el resultado

**Prioridad:** P2. **Evidencia:** C. **Capacidades:** RF-03,RF-24. **Fase:** F2/F5.

**Fuentes:** [frontend/src/pages/Noticias.jsx:95](../frontend/src/pages/Noticias.jsx#L95), [frontend/src/pages/Noticias.jsx:110](../frontend/src/pages/Noticias.jsx#L110), [frontend/src/components/Navbar.jsx:112](../frontend/src/components/Navbar.jsx#L112).

**Situación actual:** El listado descarga seis noticias y filtra en memoria. Las sugerencias de búsqueda global navegan al listado del tipo sin seleccionar el elemento encontrado.

**Impacto y límite:** Un resultado existente puede parecer ausente; el usuario pierde la referencia y debe buscar otra vez.

**RC-H-16 — Corrección obligatoria:** Búsqueda paginada en servidor, parámetros en URL y enlaces directos a detalles públicos.

**AC-H-16 — Criterio de aceptación:** Encontrar una noticia fuera de la página 1 funciona y volver desde su detalle conserva filtros/página.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-17"></a>

### H-17 — Construcción inconsistente de URLs de imágenes

**Prioridad:** P1. **Evidencia:** C. **Capacidades:** RF-03,RF-06,RF-12. **Fase:** F2/F6.

**Fuentes:** [frontend/src/pages/Noticias.jsx:35](../frontend/src/pages/Noticias.jsx#L35), [frontend/src/pages/AdminNoticias.jsx:144](../frontend/src/pages/AdminNoticias.jsx#L144), [frontend/src/pages/AdminGaleria.jsx:150](../frontend/src/pages/AdminGaleria.jsx#L150), [backend/config/storage.js:42](../backend/config/storage.js#L42).

**Situación actual:** Varias vistas anteponen UPLOADS_URL a valores que el backend ya guarda como URL absoluta o /uploads/...; otras vistas sí contemplan startsWith(http).

**Impacto y límite:** Imágenes rotas según procedencia y pantalla. El fallback externo puede ocultar el fallo y añadir dependencia de un tercero.

**RC-H-17 — Corrección obligatoria:** Guardar clave/ámbito/proveedor y generar URL en un adaptador único; migrar formatos heredados con pruebas.

**AC-H-17 — Criterio de aceptación:** Medio local, URL externa autorizada y archivo migrado se ven en listado, edición y detalle sin prefijos duplicados.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-18"></a>

### H-18 — La navegación del CMS desaparece fuera del dashboard

**Prioridad:** P1. **Evidencia:** E+C. **Capacidades:** RF-15,RF-23. **Fase:** F1.

**Fuentes:** [frontend/src/routes/AdminRoutes.jsx:35](../frontend/src/routes/AdminRoutes.jsx#L35), [frontend/src/pages/Admin.jsx:246](../frontend/src/pages/Admin.jsx#L246).

**Situación actual:** Admin contiene sidebar y dashboard como página índice; los demás módulos son rutas hermanas sin ese layout. La captura de /admin/noticias no tiene navegación administrativa.

**Impacto y límite:** El personal pierde contexto, acceso a otros módulos y salida de sesión al cambiar de pantalla.

**RC-H-18 — Corrección obligatoria:** Layout administrativo común que envuelve todos los módulos; navegación por capacidades, título y breadcrumb persistentes.

**AC-H-18 — Criterio de aceptación:** Abrir cualquier módulo por enlace o URL directa mantiene navegación, cuenta y módulo activo en escritorio y móvil.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-19"></a>

### H-19 — Dashboard móvil recortado por sidebar fijo

**Prioridad:** P1. **Evidencia:** E+C. **Capacidades:** RF-18,RF-23. **Fase:** F1/F5.

**Fuentes:** [frontend/src/pages/Admin.jsx:248](../frontend/src/pages/Admin.jsx#L248), [frontend/src/pages/Admin.jsx:309](../frontend/src/pages/Admin.jsx#L309).

**Situación actual:** A 390 px la barra lateral mantiene w-64 y el contenido queda en una columna mínima con texto y controles cortados. scrollWidth no lo detectó porque hay recorte/overflow interno.

**Impacto y límite:** El dashboard no resulta operable en teléfono aunque no exista scroll horizontal global.

**RC-H-19 — Corrección obligatoria:** Navegación colapsable superpuesta, área principal completa y pruebas visuales de recorte además de overflow.

**AC-H-19 — Criterio de aceptación:** A 320/390/768 px se leen títulos, cifras y acciones; menú móvil accesible y sin contenido tapado.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-20"></a>

### H-20 — El remitente no recibe el código en pantalla ni un acceso visible al seguimiento

**Prioridad:** P1. **Evidencia:** C. **Capacidades:** RF-13. **Fase:** F4.

**Fuentes:** [frontend/src/pages/MesaPartes.jsx:196](../frontend/src/pages/MesaPartes.jsx#L196), [backend/controllers/mesaPartesController.js:158](../backend/controllers/mesaPartesController.js#L158), [backend/routes/mesaPartesRoutes.js:20](../backend/routes/mesaPartesRoutes.js#L20).

**Situación actual:** La API devuelve codigo_seguimiento, pero la pantalla solo guarda mensaje y reinicia el formulario. El componente no implementa la consulta de seguimiento que sí existe en API.

**Impacto y límite:** Una persona sin correo recibido puede perder la referencia del expediente; la capacidad de seguimiento queda inaccesible desde ese flujo.

**RC-H-20 — Corrección obligatoria:** Constancia persistente/impresa con código, fecha y enlace; formulario de seguimiento completo y privado.

**AC-H-20 — Criterio de aceptación:** Con correo vacío o SMTP caído se muestra código utilizable y puede consultarse el estado desde la web.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-21"></a>

### H-21 — La bandeja de trámites no permite leer el expediente completo

**Prioridad:** P1. **Evidencia:** C. **Capacidades:** RF-13. **Fase:** F4.

**Fuentes:** [frontend/src/pages/AdminMesaPartes.jsx:171](../frontend/src/pages/AdminMesaPartes.jsx#L171), [backend/controllers/mesaPartesController.js:118](../backend/controllers/mesaPartesController.js#L118).

**Situación actual:** La tabla muestra asunto, nombre/DNI, fecha, selector de estado y eliminar. No presenta fundamentación, dirección/contacto completos, adjunto ni ficha de lectura del trámite.

**Impacto y límite:** El personal puede cambiar el estado sin disponer de la información necesaria para atender la solicitud.

**RC-H-21 — Corrección obligatoria:** Ficha privada con datos completos autorizados, archivo, historial, comentarios y transiciones confirmadas.

**AC-H-21 — Criterio de aceptación:** Un administrador abre un expediente, lee fundamento, descarga adjunto y registra transición con historial y autor.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-22"></a>

### H-22 — Formato y tamaño de adjuntos anunciados no coinciden con el servidor

**Prioridad:** P2. **Evidencia:** C. **Capacidades:** RF-13,RF-07. **Fase:** F2/F4.

**Fuentes:** [frontend/src/pages/MesaPartes.jsx:367](../frontend/src/pages/MesaPartes.jsx#L367), [backend/middleware/uploadMiddleware.js:11](../backend/middleware/uploadMiddleware.js#L11), [backend/middleware/uploadMiddleware.js:36](../backend/middleware/uploadMiddleware.js#L36).

**Situación actual:** El formulario anuncia 10 MB y admite selección DOC/DOCX; el backend permite hasta 15 MiB y solo detecta imágenes/PDF. MAX_IMAGE_BYTES está declarado pero no controla ese flujo.

**Impacto y límite:** Errores tardíos y expectativas incorrectas; usuarios preparan documentos que el servicio rechaza.

**RC-H-22 — Corrección obligatoria:** Política única por contexto en UI, PHP, proxy y ayuda; mensajes específicos 413/415 y control real de dimensiones.

**AC-H-22 — Criterio de aceptación:** Límites exactos y tipo permitido coinciden en selector/ayuda/servidor; archivos inválidos no quedan publicados ni huérfanos.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-23"></a>

### H-23 — Reordenamiento de administrativos tiene ruta, esquema y contrato incompatibles

**Prioridad:** P1. **Evidencia:** E+C. **Capacidades:** RF-09. **Fase:** F3.

**Fuentes:** [backend/routes/administrativoRoutes.js:23](../backend/routes/administrativoRoutes.js#L23), [backend/routes/administrativoRoutes.js:37](../backend/routes/administrativoRoutes.js#L37), [backend/controllers/administrativoController.js:62](../backend/controllers/administrativoController.js#L62), [backend/utils/reorder.js:22](../backend/utils/reorder.js#L22), [backend/migrations/001_initial.sql:103](../backend/migrations/001_initial.sql#L103).

**Situación actual:** PUT /:id se registra antes de /reordenar y captura esa palabra como ID; la prueba devolvió 400 ID inválido. Además no existe columna orden y el helper espera objetos {id,orden}, no IDs simples. El listado ordena por id DESC.

**Impacto y límite:** La función no puede persistir ni reflejar el orden con el contrato actual; corregir solo una capa no basta.

**RC-H-23 — Corrección obligatoria:** Ruta inequívoca, columna/migración, contrato único, transacción y lectura por orden/id.

**AC-H-23 — Criterio de aceptación:** Reordenar dos personas devuelve éxito, actualiza posiciones y cambia el orden público después de recargar; IDs inválidos rechazan toda la operación.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-24"></a>

### H-24 — Dos tablas para etiquetas de noticias y evolución incompleta de tags

**Prioridad:** P1. **Evidencia:** E+C. **Capacidades:** RF-17. **Fase:** F1/F6.

**Fuentes:** [backend/migrations/003_workflow_fase6.sql:74](../backend/migrations/003_workflow_fase6.sql#L74), [backend/migrations/006_tags.sql:15](../backend/migrations/006_tags.sql#L15), [backend/controllers/noticiaController.js:72](../backend/controllers/noticiaController.js#L72), [backend/controllers/tagsController.js:35](../backend/controllers/tagsController.js#L35).

**Situación actual:** Las migraciones crean noticias_tags y noticia_tags. La BD aislada contiene ambas; los controladores consultan principalmente noticias_tags. CREATE TABLE IF NOT EXISTS de tags en 006 no añade created_at a la tabla anterior.

**Impacto y límite:** Riesgo de asociaciones divergentes y de asumir un esquema diferente al real durante una migración.

**RC-H-24 — Corrección obligatoria:** Una tabla canónica, unión/deduplicación de relaciones y ALTER explícito para evolución; reporte de discrepancias.

**AC-H-24 — Criterio de aceptación:** Importar relaciones distintas en ambas tablas conserva la unión válida y deja una sola fuente de lectura, con esquema comprobado.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-25"></a>

### H-25 — Escrituras editoriales y archivos carecen de atomicidad completa

**Prioridad:** P1. **Evidencia:** C+R. **Capacidades:** RF-03,RF-06,RF-13. **Fase:** F2/F4.

**Fuentes:** [backend/controllers/noticiaController.js:106](../backend/controllers/noticiaController.js#L106), [backend/controllers/noticiaController.js:172](../backend/controllers/noticiaController.js#L172), [backend/routes/mesaPartesRoutes.js:12](../backend/routes/mesaPartesRoutes.js#L12), [backend/controllers/tagsController.js:99](../backend/controllers/tagsController.js#L99).

**Situación actual:** Noticia/etiquetas se escriben mediante consultas separadas; reemplazar etiquetas borra antes de insertar. Subidas se promueven antes de terminar validación/BD. No hay compensación general de archivos.

**Impacto y límite:** Un fallo intermedio puede dejar contenido parcial, asociaciones perdidas o archivos huérfanos. No se produjo un fallo destructivo sobre datos reales.

**RC-H-25 — Corrección obligatoria:** Transacciones por caso de uso y estados/compensación para almacenamiento externo. Conservar el medio anterior hasta confirmar.

**AC-H-25 — Criterio de aceptación:** Inyectar fallo entre contenido/etiquetas deja BD consistente; una validación fallida no publica el archivo ni pierde el medio previo.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-26"></a>

### H-26 — Etiquetas aplican una política de publicación diferente

**Prioridad:** P1. **Evidencia:** C. **Capacidades:** RF-17. **Fase:** F2/F3.

**Fuentes:** [backend/controllers/tagsController.js:174](../backend/controllers/tagsController.js#L174), [backend/controllers/tagsController.js:182](../backend/controllers/tagsController.js#L182), [backend/controllers/tagsController.js:206](../backend/controllers/tagsController.js#L206).

**Situación actual:** Contenido por etiqueta exige publicado pero no fecha alcanzada. Conteos/nube incluyen asociaciones sin filtrar visibilidad. Una publicación marcada publicada con fecha futura puede divergir del listado principal.

**Impacto y límite:** Canal adicional para adelantar información o inferir contenidos ocultos.

**RC-H-26 — Corrección obligatoria:** Compartir predicado de visibilidad con listas/detalles/buscador y aplicar el mismo filtro antes de contar.

**AC-H-26 — Criterio de aceptación:** Con reloj controlado, ningún canal de etiquetas revela contenido futuro; conteos coinciden con elementos públicos accesibles.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-27"></a>

### H-27 — Los pilares editables no se consumen en Inicio

**Prioridad:** P2. **Evidencia:** C. **Capacidades:** RF-12. **Fase:** F3.

**Fuentes:** [frontend/src/pages/AdminConfigInicio.jsx:18](../frontend/src/pages/AdminConfigInicio.jsx#L18), [frontend/src/pages/Inicio.jsx:86](../frontend/src/pages/Inicio.jsx#L86).

**Situación actual:** La configuración permite guardar pilar1/2/3 título y descripción, pero Inicio define su propio array fijo sin leer esas claves.

**Impacto y límite:** El personal recibe confirmación de guardado sin ver el cambio esperado en la web.

**RC-H-27 — Corrección obligatoria:** Esquema de configuración tipado y conexión de cada campo a su bloque; preview con la misma plantilla pública.

**AC-H-27 — Criterio de aceptación:** Cambiar cada título/descripción modifica el bloque correcto sin despliegue; claves desconocidas se rechazan.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-28"></a>

### H-28 — Páginas institucionales y directivos están codificados en la interfaz

**Prioridad:** P2. **Evidencia:** C. **Capacidades:** RF-02,RF-10. **Fase:** F3.

**Fuentes:** [frontend/src/pages/SeccionInstitucion.jsx:25](../frontend/src/pages/SeccionInstitucion.jsx#L25), [frontend/src/pages/Directivos.jsx:4](../frontend/src/pages/Directivos.jsx#L4), [backend/routes/directivoRoutes.js:10](../backend/routes/directivoRoutes.js#L10).

**Situación actual:** Textos institucionales y directivos se definen en JSX; no se conectan con un CMS de páginas ni con la API de directivos para esa presentación. El organigrama referencia un recurso ausente del inventario público.

**Impacto y límite:** Actualizar información requiere modificar código; pueden divergir nombres/datos administrados y publicados. La exactitud institucional de los textos no fue validada.

**RC-H-28 — Corrección obligatoria:** Páginas y directivos editables, fuentes canónicas, organigrama válido con alternativa textual y validación editorial.

**AC-H-28 — Criterio de aceptación:** Cambiar una ficha o texto desde CMS actualiza la página; archivo faltante genera estado explícito, no contenido gráfico vacío.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-29"></a>

### H-29 — Capacidades de API no tienen recorrido administrativo/público completo

**Prioridad:** P2. **Evidencia:** C. **Capacidades:** RF-10,RF-11,RF-14. **Fase:** F3/F4.

**Fuentes:** [frontend/src/routes/AdminRoutes.jsx:33](../frontend/src/routes/AdminRoutes.jsx#L33), [frontend/src/App.jsx:112](../frontend/src/App.jsx#L112), [backend/routes/admisionRoutes.js:9](../backend/routes/admisionRoutes.js#L9), [backend/routes/carruselRoutes.js:10](../backend/routes/carruselRoutes.js#L10), [backend/routes/directivoRoutes.js:10](../backend/routes/directivoRoutes.js#L10).

**Situación actual:** Admisiones redirige a mesa de partes; carrusel y directivos tienen endpoints pero no módulos equivalentes en AdminRoutes. Inicio no consume la gestión de carrusel.

**Impacto y límite:** Una lista de endpoints puede dar falsa impresión de CMS completo. Dos finalidades diferentes quedan mezcladas.

**RC-H-29 — Corrección obligatoria:** Matriz RF explícita; completar interfaces de las capacidades existentes y separar admisión/trámite. No retirar tablas por estar ocultas.

**AC-H-29 — Criterio de aceptación:** Cada módulo tiene entrada por permiso, formulario, listado, lectura pública cuando aplica y prueba de recorrido completo.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-30"></a>

### H-30 — Semántica y estados accesibles de navegación incompletos

**Prioridad:** P2. **Evidencia:** E+C. **Capacidades:** RF-23,RF-24. **Fase:** F1/F5.

**Fuentes:** [frontend/src/components/Navbar.jsx:138](../frontend/src/components/Navbar.jsx#L138), [frontend/src/components/Navbar.jsx:158](../frontend/src/components/Navbar.jsx#L158), [frontend/src/components/Navbar.jsx:163](../frontend/src/components/Navbar.jsx#L163), [frontend/src/components/Navbar.jsx:224](../frontend/src/components/Navbar.jsx#L224).

**Situación actual:** Escudo navega mediante div con onClick; submenús dependen de group-hover; botones no exponen aria-expanded/controls. El botón móvil devolvió expanded=null. La navegación pública examinada no tiene main.

**Impacto y límite:** Dificulta orientación y operación con teclado/tecnología de asistencia. La comprobación puntual de hover/foco no equivale a auditoría completa con lector de pantalla.

**RC-H-30 — Corrección obligatoria:** Enlaces y botones semánticos, disclosure accesible, main y salto al contenido; pruebas con teclado sin ratón.

**AC-H-30 — Criterio de aceptación:** Menú opera con Enter/Espacio/Escape y declara estado; escudo accesible por teclado; una región principal y enlace de salto por página.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-31"></a>

### H-31 — Accesibilidad de modales y reordenamiento requiere un contrato uniforme

**Prioridad:** P2. **Evidencia:** C+R. **Capacidades:** RF-06,RF-23. **Fase:** F1/F3/F5.

**Fuentes:** [frontend/src/components/ReorderModal.jsx:46](../frontend/src/components/ReorderModal.jsx#L46), [frontend/src/components/HelpCenterModal.jsx:22](../frontend/src/components/HelpCenterModal.jsx#L22), [frontend/src/components/LivePreviewModal.jsx:1](../frontend/src/components/LivePreviewModal.jsx#L1).

**Situación actual:** Hay implementaciones distintas de modales y manejo de Escape/scroll; declarar role=dialog no demuestra trampa de foco, fondo inerte y retorno. No se recorrieron manualmente todos los modales.

**Impacto y límite:** Riesgo de perder foco o dejar acciones fuera de alcance. No se afirma que todos los modales actuales fallen de la misma manera.

**RC-H-31 — Corrección obligatoria:** Componente/contrato común de dialog; reordenamiento con botones y teclado además del arrastre.

**AC-H-31 — Criterio de aceptación:** Cada modal supera secuencia Tab/Shift+Tab/Escape/retorno; el orden puede guardarse sin arrastrar ni usar ratón.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-32"></a>

### H-32 — Texto pequeño y etiquetado de controles insuficiente

**Prioridad:** P2. **Evidencia:** E+C. **Capacidades:** RF-13,RF-23. **Fase:** F1/F5.

**Fuentes:** [frontend/src/pages/Noticias.jsx:54](../frontend/src/pages/Noticias.jsx#L54), [frontend/src/pages/MesaPartes.jsx:367](../frontend/src/pages/MesaPartes.jsx#L367), [frontend/src/pages/AdminMesaPartes.jsx:186](../frontend/src/pages/AdminMesaPartes.jsx#L186).

**Situación actual:** Se usan textos de 8–10 px para etiquetas/acciones y metadatos. La inspección DOM detectó el input de adjunto sin label asociado; selectores de estado por fila carecen de nombre contextual.

**Impacto y límite:** Lectura y selección más difíciles, especialmente móvil y baja visión; el error no se resuelve solo con cambiar colores.

**RC-H-32 — Corrección obligatoria:** Escala tipográfica legible, áreas táctiles, labels vinculados y nombres accesibles específicos por recurso.

**AC-H-32 — Criterio de aceptación:** Controles sin nombre/label no aparecen en análisis; pruebas a 200 % y móvil conservan legibilidad y objetivo táctil.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-33"></a>

### H-33 — Fallos de carga pueden mostrarse como listas vacías

**Prioridad:** P2. **Evidencia:** E+C. **Capacidades:** RF-01,RF-03. **Fase:** F2/F5.

**Fuentes:** [frontend/src/pages/Noticias.jsx:102](../frontend/src/pages/Noticias.jsx#L102), [frontend/src/pages/Inicio.jsx:68](../frontend/src/pages/Inicio.jsx#L68).

**Situación actual:** Noticias ignora la excepción de carga y termina el spinner; el inicio captura el error de contrato y conserva un estado vacío. No hay una distinción consistente entre error y falta de datos.

**Impacto y límite:** El visitante recibe una afirmación incorrecta y no sabe si reintentar.

**RC-H-33 — Corrección obligatoria:** Estados explícitos de vacío/error/sin coincidencias y reintento; registrar correlación sin detalles internos.

**AC-H-33 — Criterio de aceptación:** Simular 500, desconexión y catálogo realmente vacío produce mensajes distintos y recuperación operable.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-34"></a>

### H-34 — Rutas desconocidas y metadatos globales perjudican navegación y SEO

**Prioridad:** P2. **Evidencia:** E+C. **Capacidades:** RF-24. **Fase:** F2/F5.

**Fuentes:** [frontend/src/App.jsx:136](../frontend/src/App.jsx#L136), [frontend/index.html:9](../frontend/index.html#L9).

**Situación actual:** Una ruta inexistente terminó en Inicio en ambas vistas. Título, canonical y Open Graph son globales y fijos; no representan cada contenido o entorno.

**Impacto y límite:** Se ocultan enlaces rotos y se pierde contexto al compartir/indexar. Un fallback SPA no equivale a un 404 correcto.

**RC-H-34 — Corrección obligatoria:** HTML SSR con estado 404, página de ayuda y metadatos propios, dominio configurable y detalle canonical.

**AC-H-34 — Criterio de aceptación:** Ruta inválida devuelve 404 sin redirigir a inicio; dos noticias tienen títulos/canonical/OG distintos y válidos.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-35"></a>

### H-35 — robots.txt anuncia un sitemap inexistente y el sitemap repite URLs

**Prioridad:** P2. **Evidencia:** E+C. **Capacidades:** RF-24. **Fase:** F5.

**Fuentes:** [backend/routes/seoRoutes.js:15](../backend/routes/seoRoutes.js#L15), [backend/routes/seoRoutes.js:20](../backend/routes/seoRoutes.js#L20), [backend/routes/seoRoutes.js:46](../backend/routes/seoRoutes.js#L46).

**Situación actual:** robots anuncia /api/sitemap.xml, pero la ruta real es /sitemap.xml: se observaron 404 y 200 respectivamente. Cada noticia agrega de nuevo /noticias en vez de un detalle único.

**Impacto y límite:** Descubrimiento incorrecto y duplicación de URLs; además las consultas no siguen una política editorial común.

**RC-H-35 — Corrección obligatoria:** Generador con dominio único, URLs públicas de detalle, deduplicación, fechas reales y exclusión de privados.

**AC-H-35 — Criterio de aceptación:** La URL declarada en robots responde XML válido; no hay loc duplicados ni páginas privadas/futuras.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-36"></a>

### H-36 — Identidad y contacto contienen valores de ejemplo o sin validación

**Prioridad:** P2. **Evidencia:** C+D. **Capacidades:** RF-01,RF-02,RF-12. **Fase:** F0/F5.

**Fuentes:** [frontend/src/components/Footer.jsx:70](../frontend/src/components/Footer.jsx#L70), [frontend/src/components/Footer.jsx:161](../frontend/src/components/Footer.jsx#L161), [frontend/src/pages/Inicio.jsx:23](../frontend/src/pages/Inicio.jsx#L23), [frontend/src/pages/SeccionInstitucion.jsx:55](../frontend/src/pages/SeccionInstitucion.jsx#L55).

**Situación actual:** Hay teléfono con patrón de ejemplo, enlaces genéricos a redes, cifras por defecto y lemas diferentes entre secciones. No se verificó su exactitud con el colegio.

**Impacto y límite:** Puede publicarse información incorrecta o inconsistente. No se concluye que cada dato actual sea falso; requiere autoridad editorial.

**RC-H-36 — Corrección obligatoria:** Catálogo de datos oficiales con responsable/fecha; URLs de redes validadas y métricas opcionales con fuente. No importar datos de la imagen conceptual.

**AC-H-36 — Criterio de aceptación:** Revisión institucional confirma cada contacto/lema/cifra; no quedan enlaces genéricos ni placeholders visibles en producción.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-37"></a>

### H-37 — Portada y navegación no materializan la nueva dirección visual

**Prioridad:** P2. **Evidencia:** C+D. **Capacidades:** RF-01,RF-23. **Fase:** F0/F5.

**Fuentes:** [frontend/src/pages/Inicio.jsx:118](../frontend/src/pages/Inicio.jsx#L118), [frontend/src/pages/Inicio.jsx:168](../frontend/src/pages/Inicio.jsx#L168), [frontend/src/components/Navbar.jsx:30](../frontend/src/components/Navbar.jsx#L30).

**Situación actual:** El hero domina casi una pantalla con fondo azul; la fotografía está oculta bajo lg. Mesa de partes aparece dentro de Académico. Son decisiones existentes que deben revisarse frente al nuevo encargo.

**Impacto y límite:** La prioridad de servicios y presencia fotográfica móvil no coinciden con la propuesta aprobable de blanco/rojo/marino.

**RC-H-37 — Corrección obligatoria:** Prototipo institucional con fotografía móvil, jerarquía editorial, accesos rápidos y agrupación Servicios. Validar referencia RCH antes de cerrar composición.

**AC-H-37 — Criterio de aceptación:** Prototipos y versión construida en anchos objetivo permiten encontrar comunicados/trámites y muestran identidad oficial sin ocultar información esencial.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-38"></a>

### H-38 — Tema oscuro depende de sobrescrituras globales de utilidades

**Prioridad:** P2. **Evidencia:** C+R. **Capacidades:** RF-22. **Fase:** F1/F5.

**Fuentes:** [frontend/src/index.css:95](../frontend/src/index.css#L95), [frontend/src/index.css:104](../frontend/src/index.css#L104), [frontend/src/context/ThemeContext.jsx:1](../frontend/src/context/ThemeContext.jsx#L1).

**Situación actual:** Se redefinen globalmente clases como bg-white y text-slate-400 para dark, además de reglas específicas. Existe soporte de movimiento reducido; no se afirma que falte.

**Impacto y límite:** Aumenta riesgo de contrastes/estilos inesperados y hace costoso verificar componentes. No se midieron todas las combinaciones de contraste actuales.

**RC-H-38 — Corrección obligatoria:** Tokens de tema y componentes propios, pruebas de contraste y estados en claro/oscuro sin perder la función existente.

**AC-H-38 — Criterio de aceptación:** Cada componente objetivo cumple contraste y foco en ambos temas; los cambios de tema no alteran clasificación de estados ni legibilidad.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-39"></a>

### H-39 — El control lint del propio repositorio falla

**Prioridad:** P1. **Evidencia:** E. **Capacidades:** RF-23. **Fase:** F1/F7.

**Fuentes:** [frontend/eslint.config.js:1](../frontend/eslint.config.js#L1), [.github/workflows/ci.yml:77](../.github/workflows/ci.yml#L77).

**Situación actual:** npm run lint terminó con 40 errores y 17 advertencias. Incluye variables sin uso, reglas de hooks y organización de exports; no todos significan una falla funcional.

**Impacto y límite:** La línea base no cumple su pipeline de calidad y su trabajo frontend-build depende de ese control.

**RC-H-39 — Corrección obligatoria:** En la nueva plataforma establecer controles PHP/JS/CSS adecuados y verdes; conservar el reporte actual como deuda, sin trasladar reglas React innecesarias.

**AC-H-39 — Criterio de aceptación:** El pipeline de la versión PHP ejecuta y aprueba controles acordados; no los deshabilita para simular éxito.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-40"></a>

### H-40 — Arranque de desarrollo y herramientas no están definidos de forma reproducible

**Prioridad:** P2. **Evidencia:** E+C. **Capacidades:** RF-23. **Fase:** F1/F7.

**Fuentes:** [backend/package.json:8](../backend/package.json#L8), [frontend/vite.config.js:1](../frontend/vite.config.js#L1), [package.json:8](../package.json#L8), [.github/workflows/ci.yml:49](../.github/workflows/ci.yml#L49).

**Situación actual:** dev:backend llama nodemon pero no figura en dependencias. Vite no define proxy a la API. El entorno se pudo preparar con helpers externos y Node --watch; no implica que npm run dev funcione sin ellos.

**Impacto y límite:** Un nuevo desarrollador necesita conocimiento no expresado por los scripts. Las versiones deben fijarse y mantenerse compatibles.

**RC-H-40 — Corrección obligatoria:** Documentar arranque PHP y servidor de pruebas; configuración por entorno y chequeos que fallen claramente ante requisitos faltantes.

**AC-H-40 — Criterio de aceptación:** Desde un entorno vacío compatible, instrucciones bloqueadas instalan, migran y arrancan sin cambios de código/lockfile ni herramientas implícitas.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-41"></a>

### H-41 — La auditoría de dependencias reporta alertas de seguridad

**Prioridad:** P1. **Evidencia:** E+R. **Capacidades:** RF-15,RF-23. **Fase:** F1/F7.

**Fuentes:** [frontend/package-lock.json:1](../frontend/package-lock.json#L1), [backend/package-lock.json:1](../backend/package-lock.json#L1).

**Situación actual:** Auditorías completas: frontend 37 entradas, backend 14; con omit=dev: frontend 11 y backend 12. JSON preservados, incluyendo avisos directos/transitivos y severidades.

**Impacto y límite:** Requiere análisis de exposición y actualización; un aviso de paquete no demuestra explotación. Eliminar React no corrige automáticamente todas las clases de riesgo.

**RC-H-41 — Corrección obligatoria:** Inventario mínimo, versiones fijadas, auditoría de Composer/JS/aplicación, análisis de aplicabilidad y revisiones periódicas. No trasladar bibliotecas innecesarias.

**AC-H-41 — Criterio de aceptación:** Release sin críticos/altos aplicables sin resolver; excepciones justificadas, responsable y caducidad. Registrar inventario y ejecutar controles en CI.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-42"></a>

### H-42 — Las pruebas existentes no cubren los recorridos que fallan

**Prioridad:** P1. **Evidencia:** E+C. **Capacidades:** RF-01,RF-15,RF-23. **Fase:** F1/F7.

**Fuentes:** [backend/__tests__/authMiddleware.test.js:12](../backend/__tests__/authMiddleware.test.js#L12), [backend/__tests__/validators.test.js:1](../backend/__tests__/validators.test.js#L1), [frontend/src/__tests__/sanitize.test.js:1](../frontend/src/__tests__/sanitize.test.js#L1).

**Situación actual:** 43 pruebas aprobaron; cubren helpers/validadores/middleware. No hay en ese conjunto cobertura E2E que detecte botón de noticia inerte, contrato de portada o revocación por BD.

**Impacto y límite:** Una suite verde puede coexistir con funciones principales rotas. CI levanta PostgreSQL pero eso no demuestra que se prueben todos los repositorios.

**RC-H-42 — Corrección obligatoria:** Pruebas de integración con BD, permisos cruzados, navegadores, migración y recuperación; matriz RF/RC/AC.

**AC-H-42 — Criterio de aceptación:** Regresiones deliberadas de contrato, permisos o detalle hacen fallar la prueba correspondiente; las pruebas requeridas realmente ejecutan casos.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-43"></a>

### H-43 — Las notificaciones son globales y accesibles a cualquier usuario autenticado

**Prioridad:** P2. **Evidencia:** C+R. **Capacidades:** RF-20. **Fase:** F4.

**Fuentes:** [backend/routes/notificationRoutes.js:12](../backend/routes/notificationRoutes.js#L12), [backend/controllers/notificationController.js:12](../backend/controllers/notificationController.js#L12), [backend/controllers/notificationController.js:74](../backend/controllers/notificationController.js#L74), [backend/utils/notifier.js:1](../backend/utils/notifier.js#L1).

**Situación actual:** Hay is_read en la notificación global, sin destinatario. El router exige verificarToken pero no permiso por tipo/destinatario. Se generan mensajes con nombre y asunto de remitente.

**Impacto y límite:** Marcar como leído puede afectar a todo el personal; cuentas sin permiso de trámites podrían conocer datos por notificaciones. Ese acceso por rol no se ensayó con datos reales.

**RC-H-43 — Corrección obligatoria:** Destinatarios y estado individual, política por asunto y minimización de PII; enlaces autorizados.

**AC-H-43 — Criterio de aceptación:** Leer como editor no cambia la bandeja de otro usuario ni revela notificaciones de trámites fuera de su permiso.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-44"></a>

### H-44 — Readiness y migraciones no representan correctamente fallo de dependencias

**Prioridad:** P2. **Evidencia:** C. **Capacidades:** RF-23. **Fase:** F1/F7.

**Fuentes:** [backend/index.js:27](../backend/index.js#L27), [backend/index.js:106](../backend/index.js#L106), [backend/config/initDb.js:67](../backend/config/initDb.js#L67).

**Situación actual:** initDb se dispara sin esperar su conclusión y captura fallos para seguir arrancando. Health devuelve JSON con status=error pero HTTP 200 si falla BD.

**Impacto y límite:** Un balanceador o monitor que use solo HTTP puede declarar lista una aplicación no funcional.

**RC-H-44 — Corrección obligatoria:** Migraciones CLI antes de promover release; liveness y readiness separados con HTTP 503 cuando corresponde.

**AC-H-44 — Criterio de aceptación:** Con BD caída o migración requerida, readiness falla y no se declara lista la versión; diagnóstico interno permite identificar el problema.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-45"></a>

### H-45 — Cron muta por GET y comparte secreto de autenticación como fallback

**Prioridad:** P2. **Evidencia:** C. **Capacidades:** RF-03,RF-04,RF-05. **Fase:** F2/F7.

**Fuentes:** [backend/routes/cronRoutes.js:7](../backend/routes/cronRoutes.js#L7), [backend/controllers/cronController.js:28](../backend/controllers/cronController.js#L28).

**Situación actual:** GET publish-scheduled actualiza tablas y acepta CRON_SECRET o JWT_SECRET. La ejecución no registra el mismo conjunto de eventos que una operación editorial de usuario.

**Impacto y límite:** Acoplamiento de secretos, semántica HTTP insegura y trazabilidad parcial; no se probó acceso sin secreto.

**RC-H-45 — Corrección obligatoria:** Cron CLI con bloqueo y caso de uso compartido, o integración autenticada separada si fuera imprescindible. Claves por propósito.

**AC-H-45 — Criterio de aceptación:** GET público no publica; tarea repetida es idempotente, auditada y no usa clave de sesiones para otro propósito.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-46"></a>

### H-46 — Mutaciones pueden confirmar éxito sobre un ID inexistente

**Prioridad:** P2. **Evidencia:** C. **Capacidades:** RF-03,RF-09,RF-13. **Fase:** F2/F4.

**Fuentes:** [backend/controllers/noticiaController.js:166](../backend/controllers/noticiaController.js#L166), [backend/controllers/administrativoController.js:32](../backend/controllers/administrativoController.js#L32), [backend/controllers/mesaPartesController.js:199](../backend/controllers/mesaPartesController.js#L199).

**Situación actual:** Varias actualizaciones/borrados no comprueban rowCount antes de responder éxito; cambiar estado puede confirmar aunque no haya expediente.

**Impacto y límite:** El personal recibe confirmaciones falsas y la auditoría puede describir cambios no realizados.

**RC-H-46 — Corrección obligatoria:** Comprobar existencia/versión, autorización y filas afectadas; 404/409 según caso y auditoría solo de operaciones reales.

**AC-H-46 — Criterio de aceptación:** IDs inexistentes o eliminados concurrentemente no producen mensaje de guardado; el usuario puede regresar a lista o recargar.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-47"></a>

### H-47 — Paginación negativa llega a SQL y filtra errores internos

**Prioridad:** P2. **Evidencia:** E+C. **Capacidades:** RF-03,RF-24. **Fase:** F1/F2.

**Fuentes:** [backend/controllers/noticiaController.js:20](../backend/controllers/noticiaController.js#L20), [backend/controllers/noticiaController.js:92](../backend/controllers/noticiaController.js#L92).

**Situación actual:** page=-1 y limit=-1 respondieron 500 con OFFSET/LIMIT must not be negative. Se limita el máximo pero no el mínimo de forma consistente.

**Impacto y límite:** Entrada inválida se convierte en error de servidor y revela detalles de implementación; resultados vacíos/páginas pueden ser incoherentes.

**RC-H-47 — Corrección obligatoria:** Validar rangos/tipos antes de consultar, contrato único de paginación y errores públicos controlados.

**AC-H-47 — Criterio de aceptación:** Negativos, cero, arrays, texto y desbordamientos generan 422 o normalización documentada, nunca SQL público ni 500 por validación.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

<a id="h-48"></a>

### H-48 — Privacidad, retención y minimización necesitan definición explícita

**Prioridad:** P2. **Evidencia:** C+R+D. **Capacidades:** RF-13,RF-14. **Fase:** F0/F4/F7.

**Fuentes:** [frontend/src/App.jsx:98](../frontend/src/App.jsx#L98), [frontend/src/pages/MesaPartes.jsx:112](../frontend/src/pages/MesaPartes.jsx#L112), [backend/controllers/mesaPartesController.js:171](../backend/controllers/mesaPartesController.js#L171), [backend/index.js:94](../backend/index.js#L94).

**Situación actual:** El router no ofrece una página específica de privacidad; el flujo solicita datos personales y consulta DNI por GET. Los logs de acceso pueden registrar esa URL según despliegue.

**Impacto y límite:** Falta una especificación completa de finalidad, acceso y conservación. No se emite una conclusión jurídica ni se afirma qué registran los sistemas reales no inspeccionados.

**RC-H-48 — Corrección obligatoria:** Inventario de datos, aviso por finalidad, consulta POST, logs saneados y política institucional de retención/acceso/purga.

**AC-H-48 — Criterio de aceptación:** Revisión del responsable confirma texto y retención; no hay DNI en URL/logs/analítica; eliminación y recuperación siguen la política aprobada.

**Estado de cierre:** pendiente. Para cerrar: commit PHP, prueba ejecutada, resultado y revisión.

## Interpretación y pendientes

Este catálogo cubre los hallazgos de la revisión descrita, no garantiza haber descubierto todo defecto posible. La ausencia de un hallazgo sobre un flujo no inspeccionado no demuestra su corrección. El diseño establece pruebas adicionales para cubrir esa incertidumbre. Los datos de npm son avisos reportados, no incidentes ni una prueba de explotación.
