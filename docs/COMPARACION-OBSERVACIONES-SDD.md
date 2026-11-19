# Comparación del SDD 1.0 con las observaciones recibidas

Fecha: 17 de noviembre de 2026, America/Lima.  
Documento examinado: [SDD de reimplementación PHP, versión 1.0](SDD-REIMPLEMENTACION-PHP.md).  
Base de código referenciada: `b2db12d1b731551cdc8807ec9c6068a7f8005c6a`.  
Entrada de revisión: «Texto pegado.txt», observaciones sobre contradicciones, funcionamiento, migración y calidad documental.  
Estado: evaluación comparativa; las recomendaciones no constituyen una versión 1.1 aprobada ni cambios en la aplicación.

## 1. Dictamen

Las observaciones detectan vacíos reales y útiles para llevar el SDD desde un diseño amplio hasta una especificación ejecutable con menos decisiones implícitas. Deben incorporarse especialmente contratos de rutas, persistencia de revisiones, papelera, límites de tasa, caché, responsabilidades operativas y aceptación por módulo.

Sin embargo, varias afirmaciones necesitan matices: autoguardado y bloqueo optimista son compatibles; la búsqueda full-text en español no exige `unaccent` ni `pg_trgm`; 128 bits de aleatoriedad no impiden copiar un código; un release inmutable no presupone SSH; una matriz de roles fija no obliga a crear tablas configurables de permisos. Tampoco se deben convertir nuevas capacidades —varios adjuntos, 2FA o un servicio antivirus— en funcionalidades presuntamente existentes.

El SDD 1.0 mantiene valor como base de arquitectura y auditoría, pero conviene cerrar los puntos señalados antes de usarlo como especificación definitiva de desarrollo y aceptación. Los 48 hallazgos de la aplicación y estas 33 observaciones documentales son conjuntos distintos: no se deben sumar como si fueran 81 defectos comprobados.

## 2. Lo que ya estaba cubierto

La introducción del informe recibido es correcta: Argon2id, CSRF, SameSite, limitación de uso, outbox, idempotencia, tratamiento EXIF, SPF/DKIM/DMARC, exclusión mutua de cron y privacidad ya se mencionan en el SDD. Sus ubicaciones principales son §11.3, §13, §14 y §15. Su presencia no implica que todos sus contratos estén cerrados ni que estén implementados.

Los resultados conservados también coinciden: 43 pruebas, 48 hallazgos y conteos npm completos/frontend-backend de 37/14 y sin dependencias de desarrollo de 11/12. Son entradas reportadas por npm, no incidentes distintos ni explotación confirmada. No se repitió la auditoría de dependencias para esta comparación.

## 3. Comparación punto por punto

### 3.1 Supuestas contradicciones

| ID | Observación | Evaluación y tratamiento recomendado |
|---|---|---|
| OBS-01 | `storage/sessions` frente a sesiones PostgreSQL | **Válida como ambigüedad de implementación.** ADR-05 exige sesiones en servidor y §12.2 diseña una tabla, pero §6.2 conserva una carpeta sin explicar su papel. Elegir un manejador de sesiones PostgreSQL mediante `SessionHandlerInterface`/`session_set_save_handler`, con expiración, revocación y concurrencia definidas. Retirar la carpeta si no se utilizará; no mantener dos fuentes de autoridad implícitas. |
| OBS-02 | Un archivo por trámite frente a varios adjuntos | **Requiere una decisión de cardinalidad, no añadir una tabla automáticamente.** La línea base y el diccionario contemplan un archivo; algunas redacciones hablan de adjuntos de forma general. Preservar inicialmente un adjunto y explicitarlo es una solución válida. Si se aprueba multiplicidad, añadir `tramite_adjuntos`, máximo por expediente, límite total, orden, permisos y migración. |
| OBS-03 | Autoguardado frente a bloqueo optimista y contenido publicado | **Vacío importante; la incompatibilidad alegada no es inherente.** Ambos mecanismos pueden utilizar versiones. Falta distinguir la revisión de trabajo de la publicada. Diseñar revisiones, preview por revisión y publicación explícita; el autoguardado nunca cambia lo que ya ve el público. Detalle en §4.1 de este informe. |
| OBS-04 | Código de seguimiento con 128 bits | **Problema de ergonomía atendible, afirmación técnica exagerada.** Un código largo sí se puede copiar. Reducirlo a 8–10 símbolos cambia su entropía y no debe hacerse sin analizar exposición. Se puede separar un número de expediente legible, consulta manual restringida y token de enlace de alta entropía. Detalle en §4.2. |
| OBS-05 | Prioridad de H-03 frente a definición de P0 | **Inconsistencia de clasificación a resolver.** H-03 está marcado P1, pero la definición amplia de P0 puede incluir la exposición de cuentas/roles reproducida. Con esa definición, reclasificarlo a P0 es coherente; conservar P1 requiere distinguir explícitamente metadatos de cuenta y exposición sensible crítica, y aplicar la misma regla a los demás hallazgos. No es una calificación CVSS. |
| OBS-06 | Falta columna de permisos de la línea base | **Mejora válida, con una corrección factual.** Conviene documentar permiso actual, permiso objetivo y razón de cada cambio. En el código actual documentos, directivos y configuración ya exigen `soloAdmin`; el SDD no les retira un permiso de editor existente en esas rutas. Ver §4.3. |
| OBS-07 | Referencias al proceso de trabajo y a imágenes conceptuales | **Válida como mejora editorial.** Retirar del cuerpo normativo menciones a worktrees, agentes y conversación; describir herramientas auxiliares solo cuando sean evidencia necesaria de reproducibilidad. Mover limitaciones/procedencia de las imágenes a un anexo, manteniendo su carácter no oficial. No borrar hechos de la auditoría para hacer parecer que el arranque original funcionaba sin ajustes. |
| OBS-08 | Tokens/layout público demasiado tarde en el plan | **Válida.** F1 debe incluir tokens y layout público base, además del administrativo. F2 depende de ese sistema para el detalle de noticias. F5 queda como refinamiento, integración final, accesibilidad y validación de rendimiento. |
| OBS-09 | RCH no identificado | **Válida.** Identificar la referencia con nombre oficial verificado y URL `https://www.rch.edu.pe/`. Hasta verificar el nombre, usar “sitio de referencia visual rch.edu.pe”; no deducir una expansión de la sigla. Conservar la limitación de que su apariencia no fue inspeccionada. |

### 3.2 Contratos y funcionamiento

| ID | Observación | Evaluación y tratamiento recomendado |
|---|---|---|
| OBS-10 | Falta matriz detallada de rutas objetivo | **Válida y prioritaria.** §7.2 enumera familias, no todos los contratos. Añadir método, ruta, controlador/caso de uso, permiso, visibilidad, CSRF, límite, caché, respuesta y aceptación. Incluir `/buscar`, sugerencias, preview por revisión, guardado, orden, etiquetas, papelera, auditoría, correo y cuenta. El inventario de 86 rutas actuales no sustituye esta matriz futura. |
| OBS-11 | Faltan tablas auxiliares | **Parcialmente válida.** Faltan decisiones explícitas de persistencia para límites, revisiones/páginas, taxonomías, preferencias y versiones de claves. No todas requieren una tabla propia: roles y tipos cerrados pueden estar en configuración/CHECK; revisiones pueden cubrir páginas y noticias; preferencias pueden tener estructura validada por usuario. Elegir el mecanismo antes de cerrar el diccionario. Ver §4.4. |
| OBS-12 | Papelera sin diseño completo | **Válida, pero no exige un estado editorial `eliminado`.** Ya existe `deleted_at` en los campos comunes. Definir baja, restauración, purga, retención y relación con revisiones/medios. Se puede conservar estado editorial y usar eliminación lógica separada; no duplicar estado y timestamp sin invariantes. |
| OBS-13 | Backend y contrato de caché sin decidir | **Válida.** `storage/cache` aparece en el árbol, pero faltan backend, claves, TTL, coherencia entre procesos y comportamiento ante caída. Elegir archivos fuera de raíz pública o un adaptador alternativo; APCu puede ser opcional. En varios nodos hacen falta coordinación o caché por nodo con invalidación definida. |
| OBS-14 | No hay 2FA | **Cierto, es una nueva mejora de seguridad.** Recomendar TOTP para administradores y evaluar obligatoriedad para editores. Definir enrolamiento, reautenticación, secreto protegido, códigos de respaldo hasheados, revocación y recuperación. No declarar equivalencia con la línea base ni imponerlo como requisito ya aprobado. |
| OBS-15 | Escaneo antimalware de adjuntos sin decidir | **Válida como decisión de seguridad pendiente.** MIME y decodificación no equivalen a antivirus. Determinar servicio local/remoto, cuarentena, tiempo límite, fallos/reintentos y política de liberación. ClamAV es una alternativa, no un requisito universal compatible con todo hosting. Datos personales no se envían a un tercero sin evaluar confidencialidad y tratamiento. |
| OBS-16 | Full-text español exige `unaccent` y `pg_trgm` | **La afirmación es incorrecta.** PostgreSQL trae configuración full-text `spanish`. `unaccent` facilita normalización de tildes y `pg_trgm` búsqueda por similitud; son capacidades adicionales. Incluirlas en hosting solo si se eligen. Se comprobó búsqueda española nativa sin esas extensiones instaladas en la base usada para la comprobación; ver §4.5. |
| OBS-17 | Orígenes CSP, terceros y `noindex` | **Válida.** El SDD da criterios pero no un inventario por directiva. Definir dominios necesarios para `frame-src`, `img-src`, `connect-src`, etc., embeds aprobados y si se cargan tras acción del visitante. Añadir `X-Robots-Tag: noindex` a áreas privadas. YouTube nocookie no equivale a ausencia de tratamiento de datos; noindex no equivale a control de acceso. |
| OBS-18 | Catálogo de correos ausente | **Válida.** Documentar plantilla, disparador transaccional, destinatario autorizado, campos permitidos, clave de deduplicación, reintentos y vínculo de recuperación. Mínimo: constancia, cambio de estado, recuperación e invitación. Evitar adjuntos o fundamentos completos si no son necesarios. |
| OBS-19 | Imágenes en línea, tablas y embeds no decididos | **Aclaración válida.** §13.3 enumera lo permitido y no incluye esos elementos. Falta declarar expresamente si están prohibidos o forman parte del editor aprobado. Conservar la paridad del editor actual no obliga a añadir funciones que no tenía. Si se habilitan, definir carga, sanitización, accesibilidad y renderizado de cada una. |
| OBS-20 | Métricas sin matriz de alertas | **Válida.** Añadir umbral/duración, severidad, destinatario por rol operativo, canal independiente, escalamiento, silencio y prueba. No es obligatorio un SaaS concreto: puede ser monitor externo con logging estructurado. Una caída del SMTP de la aplicación no puede inutilizar el único canal de alerta de esa misma caída. |
| OBS-21 | RPO de 24 horas demasiado amplio para trámites | **Riesgo bien señalado; el objetivo ya figuraba como propuesta sujeta a validación.** RPO es pérdida máxima tolerada, no tiempo de recuperación. Proponer ≤1 hora para el servicio de trámites y contrastarlo con presupuesto/operación; bajar el número exige respaldo/PITR y cobertura de archivos coherentes. La aceptación de otro objetivo debe ser explícita. |
| OBS-22 | Release inmutable presupone SSH/symlinks | **La equivalencia es incorrecta; la necesidad de un plan de despliegue concreto sí es válida.** Se puede generar un artefacto inmutable en CI y transferirlo por otros medios. Si no hay shell, definir mecanismo del proveedor para migraciones/cron, mantenimiento y promoción segura. Si no existe forma controlada de cumplir esos requisitos, el plan de hosting no es compatible. No crear un endpoint público de migración como atajo. |

### 3.3 Migración

| ID | Observación | Evaluación y tratamiento recomendado |
|---|---|---|
| OBS-23 | Compatibilidad de `/uploads/*` | **Válida.** El SDD conserva URLs de forma general, pero conviene definir mapeo o redirección de medios públicos, dominio antiguo, tipos de respuesta y duración del servicio. Los archivos privados antiguos se retiran: no deben pasar por ese alias público. |
| OBS-24 | Bajar TTL 48 horas antes | **Buena práctica condicionada al cambio real de DNS.** Planificar según TTL vigente y ventanas de propagación; 48 horas es una pauta, no una garantía. No aplica igual si solo se cambia el backend detrás de un proxy/CDN sin modificar DNS. |
| OBS-25 | Consumidores externos de `/api/*` | **Válida y prioritaria.** Inventariar aplicaciones, integraciones y scripts consumidores; elegir compatibilidad, versión o baja anunciada con pruebas. Cambiar a SSR no demuestra que todos los endpoints se puedan retirar. |
| OBS-26 | Usuario de lectura en el origen | **Válida.** Extracción con cuenta de mínimos privilegios; permisos adicionales solo si son necesarios y documentados para exportación consistente. Escritura/corte/mantenimiento son operaciones separadas con otra identidad autorizada. La herramienta de importación escribe únicamente en el destino. |

### 3.4 Calidad y completitud documental

| ID | Observación | Evaluación y tratamiento recomendado |
|---|---|---|
| OBS-27 | Falta alcance formal dentro/fuera | **Válida.** La matriz RF delimita bastante, pero conviene una declaración contractual de incluidos, excluidos y mejoras nuevas. Aula virtual, notas, pagos, multidioma y app móvil deben declararse fuera salvo acuerdo adicional; conservar páginas TIC no significa construir un LMS. |
| OBS-28 | Control documental, glosario y referencias | **Válida parcialmente.** Hay versión, fecha, commit y referencias genéricas, pero faltan historial, autoría/responsables de revisión, glosario y bibliografía específica. Añadir enlaces/versiones/fecha de consulta solo cuando se hayan comprobado. No inventar aprobadores ni firmas. |
| OBS-29 | Responsables/fechas de DP y esfuerzo por fase | **Válida.** Hay momento límite relativo pero no dueño claro. Añadir rol responsable, estado, dependencia, fecha objetivo/compromiso por confirmar y criterio de cierre. Estimar esfuerzo por perfiles y jornadas con supuestos; no fingir un calendario comprometido sin equipo, disponibilidad y volumen de datos. |
| OBS-30 | RF-08 y RF-21 sin hallazgo/AC propios | **Válida respecto a aceptación; no es obligatorio inventar un hallazgo.** La matriz CSV está orientada a H y no cubre por sí sola todos los RF. Crear matriz RF→diseño→AC→prueba; docentes requiere CRUD/permisos/foto/orden y visitas requiere exclusiones/definición de conteo. AC-14 toca orden de personal, pero no cubre por completo RF-08. |
| OBS-31 | Tokens de tema oscuro sin valores | **Válida.** El objetivo de contraste está, pero no la paleta oscura concreta. Añadir superficies, texto, bordes, foco y estados en ambos temas y su verificación. No elegir valores oscuros solo invirtiendo colores. |
| OBS-32 | Normativa de privacidad y Libro de Reclamaciones | **Válida como precisión documental y revisión institucional.** Citar Ley N.° 29733 y verificar el reglamento aplicable y su vigencia antes de producción. Determinar el régimen pertinente del Libro de Reclamaciones para esta institución educativa pública; no asumir automáticamente el régimen de un proveedor privado. Ver §4.6. |
| OBS-33 | No se recibieron anexos y falta lista de rutas probadas | **Los anexos existen; falta facilitar el paquete y una lista legible en el cuerpo.** Se comprobaron CSV con 48 filas, inventario con 86 declaraciones y evidencia con 22 observaciones sobre 11 rutas. Ver §5. La ausencia en el material recibido no demuestra ausencia del archivo original. |

## 4. Resoluciones técnicas que no conviene aplicar literalmente

### 4.1 Revisiones, autoguardado y publicación

El control optimista compara la versión que editó el cliente con la del servidor. Un autoguardado puede utilizar exactamente ese control. El problema real es qué contenido está editando.

La versión siguiente debería separar:

1. Identidad del contenido y referencia a su revisión publicada.
2. Revisión de trabajo, con autor, contenido, versión y fecha de actualización.
3. Previsualización autorizada de una revisión específica.
4. Operación “Publicar revisión” que valida la revisión y cambia atómicamente la referencia pública, audita e invalida caché.

Un autoguardado de una noticia publicada modifica la revisión de trabajo, no la publicación vigente. Las respuestas devuelven la versión nueva; se ordenan o descartan respuestas tardías del cliente. Conflictos entre editores se resuelven con 409 y comparación/recarga, no sobreescritura silenciosa. La programación debe fijar la revisión que publicará para evitar que un cambio posterior se publique sin intención.

Un `version` entero en la fila sirve para detectar cambios, pero no conserva por sí mismo el historial de contenido ni una publicación anterior. El diseño de revisiones puede cubrir noticias, comunicados y páginas; no es obligatorio crear `pagina_versiones` aparte si existe un modelo general con integridad definida.

### 4.2 Códigos de seguimiento

Con un alfabeto de 32 símbolos y generación uniforme: 8 caracteres aportan 40 bits, 10 aportan 50 y 26 aportan 130. El año y el prefijo no suman aleatoriedad. El DNI es un identificador que puede ser conocido por terceros; no debe tratarse como un secreto fuerte.

La decisión tiene tres dimensiones: facilidad de dictado, resistencia a enumeración y sensibilidad de lo que devuelve la consulta. Un código de 128 bits no es imposible de copiar, pero su transcripción manual es menos cómoda. Un código corto con DNI y límites puede ser adecuado para una respuesta mínima después de evaluar volumen, ataques distribuidos y colisiones; no equivale a una credencial de alta entropía.

Recomendación para revisar el SDD: distinguir número legible de expediente y token de enlace; ofrecer Copiar/Imprimir; definir consulta manual y datos mínimos; mantener los adjuntos bajo permiso administrativo. No reducir entropía de un token que actualmente se usa como autorización sin rediseñar el acceso.

### 4.3 Permisos reales de la línea base

Se contrastaron los middlewares del repositorio, no solo los nombres visibles del menú:

| Operación actual | Permiso que exige el backend | Consecuencia para la revisión |
|---|---|---|
| Alta/baja de documentos | `verificarToken` + `soloAdmin` | El editor ya carece de ese permiso. La edición/versionado objetivo es una mejora frente a esta API. |
| Alta/edición/baja de directivos | `verificarToken` + `soloAdmin` | Mantener administrador no reduce permisos del editor en esas rutas. |
| Actualizar configuración | `verificarToken` + `soloAdmin` | Mismo criterio. |
| Alta/edición/orden de docentes | `verificarToken` + `adminOEditor` | Debe conservarse para editor; baja exige administrador. |

Fuentes: [documentos](../backend/routes/transparenciaRoutes.js#L12), [directivos](../backend/routes/directivoRoutes.js#L12), [configuración](../backend/routes/configuracionRoutes.js#L6), [docentes](../backend/routes/docenteRoutes.js#L12) y [definición de roles](../backend/middleware/authMiddleware.js#L45).

La nueva columna de línea base será útil para todas las capacidades. El acceso accidental a borradores, notificaciones privadas o estadísticas por un endpoint mal protegido se registra como defecto a corregir, no como derecho de usuario que haya que conservar por paridad.

### 4.4 Modelo de persistencia: decidir antes de añadir tablas

- **Límites de tasa:** con varios procesos PHP y sin Redis, elegir almacenamiento coordinado. Una tabla PostgreSQL con clave normalizada/HMAC, ventana, contador, vencimiento, actualización atómica y limpieza es una opción. Un array en memoria por petición no sirve; APCu puede no coordinar varios nodos.
- **Roles/capacidades:** si son fijos, configuración PHP versionada y políticas testeadas bastan. Si el CMS permitirá administrarlos, hacen falta entidades/relaciones y controles contra autoescalada y pérdida del último administrador.
- **Catálogos:** categorías documentales editables justifican tabla; tipos cerrados de comunicado pueden usar CHECK/configuración. Lo incompleto en el SDD es no cerrar la opción.
- **Preferencias:** persistir de forma estructurada por usuario, con versión del tour y migración de preferencias. Puede ser tabla propia o campos JSON validados; no mezclarlo con credenciales.
- **Claves:** registrar identificador/versión, nunca la clave, para cifrado y HMAC. Rotar cifrado y rotar índices HMAC son operaciones diferentes; necesitan transición de lectura/reindexado y recuperación probada.
- **Papelera:** `deleted_at`/`deleted_by` con reglas explícitas puede evitar ampliar el estado editorial. Definir restauración segura, programación vencida, medios compartidos, retención y purga. La papelera editorial no determina la retención legal de expedientes.

### 4.5 Comprobación de full-text español

Se ejecutó una consulta de solo lectura sobre la base local de sistema `postgres`:

```sql
SELECT cfgname FROM pg_ts_config WHERE cfgname = 'spanish';
SELECT to_tsvector('spanish', 'Educación para las familias');
SELECT extname FROM pg_extension WHERE extname IN ('unaccent', 'pg_trgm');
```

Resultados: configuración `spanish`, vector `'educ':1 'famili':4` y ninguna fila para esas dos extensiones. Esto demuestra la disponibilidad del análisis lingüístico nativo en ese PostgreSQL sin instalar ambas extensiones. No demuestra compatibilidad de un hosting comercial concreto.

`unaccent` y `pg_trgm` se pueden proponer para búsquedas sin tildes/similitud y medir su utilidad; no deben convertirse en requisitos obligatorios por confundirlos con full-text español. Referencia técnica para la implementación: [configuración de búsqueda textual de PostgreSQL](https://www.postgresql.org/docs/current/textsearch-configuration.html).

### 4.6 Seguridad y operación requieren decisiones de negocio

TOTP, antivirus y un RPO menor mejoran protección pero tienen costo, soporte y recuperación asociados. Su evaluación debe quedar en ADR/decisiones pendientes con responsable y condición de salida. Cuando un riesgo haga inaceptable publicar sin un control, documentar ese criterio; no presentarlo retrospectivamente como requisito que el usuario ya había aprobado.

Para RPO de una hora, una periodicidad nominal de dump no basta: comprobar último backup exitoso, duración, copia fuera del servidor, consistencia de archivos, recuperación de claves y restauración. WAL/PITR mejora recuperación de PostgreSQL, pero no respalda por sí solo las fotografías/adjuntos de otro almacenamiento.

En privacidad, especificar la Ley N.° 29733 y revisar el reglamento aplicable; entre las normas a contrastar está el Decreto Supremo N.° 016-2024-JUS. La versión siguiente debe registrar fuentes oficiales y validación de vigencia. El régimen de reclamaciones aplicable a una entidad educativa pública requiere revisión propia; una casilla de consentimiento genérica o el texto de un colegio privado no resuelven ese análisis.

## 5. Anexos existentes y cobertura real

Se verificó la presencia de:

- [Auditoría con los 48 hallazgos](AUDITORIA-ACTUAL.md).
- [Matriz de trazabilidad de hallazgos, 48 filas](TRAZABILIDAD-SDD.csv).
- [Inventario estático de 86 declaraciones HTTP actuales](INVENTARIO-ENDPOINTS-ACTUALES.md).
- [Guía de evidencia, capturas y resultados](evidencia-sdd/README.md).
- [Observaciones del navegador](evidencia-sdd/browser.json) y [comprobaciones API](evidencia-sdd/api.json).

Las once rutas observadas en navegador fueron:

| Públicas | Administrativas |
|---|---|
| `/` | `/admin` |
| `/noticias` | `/admin/noticias` |
| `/comunicados` | `/admin/config-inicio` |
| `/mesa-partes` | `/admin/mesa-partes` |
| `/organigrama` | `/admin/usuarios` |
| `/ruta-inexistente` — prueba de fallback/404 | — |

Cada una se observó a 1440×1000 y 390×844: 22 observaciones. No son once módulos completamente probados, 22 pruebas E2E exhaustivas ni una certificación de accesibilidad. Los endpoints probados por HTTP se documentan por separado en `api.json`.

La carencia real de trazabilidad es que el CSV vincula hallazgos, mientras la aceptación debe cubrir **todos** los RF, incluidos los que no tienen defecto identificado. Añadir pruebas propias de RF-08 y RF-21 y comprobar la cobertura completa de los otros requerimientos.

Para RF-21, definir visitas agregadas, exclusión de administración/salud/activos/previews y tratamiento de bots conocidos. Un filtro de User-Agent no demuestra exclusión de todo bot; expresar ese límite. No convertir el contador en una métrica de personas únicas sin un diseño diferente.

## 6. Orden recomendado para una versión 1.1

### Antes de implementar el núcleo

1. Cerrar sesiones, autorización de línea base/objetivo, clasificación de H-03 y trazabilidad RF→AC.
2. Resolver revisiones/publicación/autoguardado y la cardinalidad de adjuntos.
3. Completar matriz de rutas y diccionario, incluyendo persistencia de límites, preferencias y claves.
4. Mover tokens/layout público base a F1 y definir papelera/caché.
5. Formalizar alcance, dueños de decisiones y supuestos de estimación.

### Antes de cerrar hosting, migración y producción

6. Decidir 2FA, escaneo de archivos, RPO/RTO y capacidades reales del alojamiento.
7. Inventariar consumidores API, compatibilidad de medios públicos y extracción de mínimos privilegios.
8. Completar catálogo de correo, terceros/CSP/noindex y matriz de alertas.
9. Planificar DNS solo si aplica, demostrar backup/restauración y cerrar revisión institucional/legal.

### Antes de aprobar el paquete documental

10. Añadir control de cambios, glosario, fuentes verificadas, tokens oscuros, rutas observadas y anexos accesibles desde un índice único.

Estas recomendaciones detallan los cambios de diseño que justifican una versión siguiente. El SDD 1.0 y los informes originales se mantienen como línea base de la comparación; no se afirma que los puntos estén ya corregidos en esos documentos o en código PHP.
