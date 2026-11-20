# Controles técnicos orientados a ISO/IEC 27001:2022

| Control | Aplicación en PHP | Evidencia |
| --- | --- | --- |
| A.5.15–A.5.18 y A.8.5 · Acceso, identidades y autenticación | Roles autorizados en servidor, alta y revocación por CLI, protección del último administrador, Argon2id con conversión en login, sesiones revocables y límites por cuenta e IP. | Matriz de permisos, revocación, expiración, cierre de sesión, conversión de bcrypt y prueba de último administrador. |
| A.8.9 y A.8.24 · Configuración y criptografía | Variables externas para secretos, tokens aleatorios almacenados como hash, cookie segura en producción, PostgreSQL remoto con verificación TLS y separación del rol de migración. | Configuración de operación, prueba de cookies, comprobación de disponibilidad y parámetros de producción. |
| A.8.15 y A.8.16 · Registro y monitoreo | Eventos editoriales en la misma transacción que la mutación. Eventos de acceso con fecha e ID de solicitud. Salud del proceso y comprobación separada de PostgreSQL y migraciones. | Aserciones sobre publicación programada única y respuesta 503 al detener el PostgreSQL de pruebas. |
| A.8.25, A.8.26, A.8.28 y A.8.29 · Desarrollo, requisitos, código y pruebas | PDO preparado, validación contextual, CSRF con comprobación de origen, CSP, sanitización HTML y verificación de medios. Integración automatizada con datos desechables y prueba de actualización. | Flujo `.github/workflows/php.yml` y pruebas de permisos, CSRF, concurrencia, publicación, formatos, descarga y navegador. |
| A.8.31 · Separación de entornos | Base y credenciales independientes por prueba, uso local de HTTP y configuración de HTTPS en producción. | Arranque reproducible en Docker y prueba del esquema desde cero. |

## Riesgos y responsables

- El responsable del colegio aprueba las cuentas, las funciones editoriales, el contenido oficial y los plazos de conservación. La papelera y las versiones se conservan mientras se define la retención. El operador debe ejecutar la limpieza programada de sesiones y límites caducados.
- El responsable técnico configura respaldo y restauración, revisa actualizaciones de PHP, GD y qpdf y conserva la evidencia de pruebas. La comprobación estructural de PDF y la descarga como adjunto reducen riesgos de procesamiento y exposición. La política institucional decide escaneo adicional y cuarentena.
- Operación protege el registro con acceso restringido y retención definida. Los eventos de aplicación incluyen referencias y tipos de evento, sin contraseñas, tokens ni cuerpos de formularios. Configura el proxy para evitar registrar parámetros sensibles y para resolver la IP del cliente solo desde intermediarios de confianza.
- Antes de promover un release, operación prueba HTTPS, acceso mínimo a BD, monitoreo, copias restaurables, rendimiento, compatibilidad externa y datos autorizados por la institución. El responsable del SGSI determina alcance, aplicabilidad y evidencias organizativas conforme a ISO/IEC 27001:2022. [ISO/IEC 27001:2022](https://www.iso.org/standard/82875.html)

La configuración de VPS añade HTTPS y HSTS en el proxy, restringe el usuario operativo de PostgreSQL y aporta plantillas de OpenSSH y Fail2ban. El operador valida estas plantillas, el certificado público, el firewall y la restauración en el host de destino. [Controles y procedimientos del VPS](deploy/vps/README.md)
