# Reimplementación del portal y CMS en PHP

Documentación de diseño, auditoría y revisión del Colegio Bandera del Perú.

**Estado:** la reimplementación PHP todavía no está iniciada. Estos documentos especifican el trabajo y sus criterios de aceptación; su publicación no implica que las correcciones estén implementadas. La aplicación existente utiliza React y Express.

## Documentos principales

| Documento | Contenido |
|---|---|
| [SDD de reimplementación PHP](SDD-REIMPLEMENTACION-PHP.md) | Arquitectura propuesta, 24 capacidades funcionales, UI/UX, datos, seguridad, migración, despliegue, pruebas y fases. |
| [Auditoría de la aplicación actual](AUDITORIA-ACTUAL.md) | 48 hallazgos con evidencia, prioridad, impacto, corrección propuesta y aceptación. |
| [Comparación de observaciones](COMPARACION-OBSERVACIONES-SDD.md) | Evaluación de 33 observaciones sobre el SDD 1.0 y recomendaciones para su siguiente revisión. |
| [Matriz de trazabilidad CSV](TRAZABILIDAD-SDD.csv) | Relación entre hallazgos, requisitos correctivos, criterios de aceptación y fases. |
| [Inventario de endpoints actuales](INVENTARIO-ENDPOINTS-ACTUALES.md) | 86 declaraciones HTTP detectadas en el código de la línea base; no es la matriz de rutas de la futura aplicación PHP. |
| [Evidencia de auditoría](evidencia-sdd/README.md) | Resultados de pruebas, lint y compilación, auditorías de dependencias, comprobaciones HTTP y capturas de escritorio/móvil. |

## Alcance y lectura

La auditoría y el SDD originales se elaboraron el 17 de noviembre de 2026 sobre el commit [`b2db12d1b731551cdc8807ec9c6068a7f8005c6a`](https://github.com/s2angelo9876-svg/Web-Colegio-Bandera-/commit/b2db12d1b731551cdc8807ec9c6068a7f8005c6a). La evidencia proviene de revisión de código y ejecución local con datos ficticios. No demuestra una intrusión ni una exposición de datos reales en producción.

El SDD conserva su versión 1.0. La comparación es un documento separado: sus recomendaciones no se consideran automáticamente incorporadas ni aprobadas.

El alcance de implementación solicitado comienza con **F0–F3**: cierre técnico del diseño, fundamentos PHP, noticias de extremo a extremo y módulos de contenido del CMS. Las fases posteriores permanecen descritas en el SDD.

Los fixtures SQL son exclusivamente para una base de auditoría aislada. No deben ejecutarse sobre producción. Los informes de dependencias reflejan la fecha de la auditoría y requieren reevaluación al preparar un nuevo release.
