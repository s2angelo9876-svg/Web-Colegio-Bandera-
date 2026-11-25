# Portal institucional en PHP

La aplicación usa PHP 8.6, PostgreSQL 16, HTML renderizado en servidor, CSS propio y JavaScript nativo. El CMS y el portal usan el mismo origen. El portal anterior conserva su flujo de desarrollo.

## Desarrollo

Desde la raíz del repositorio:

```bash
php/bin/dev start
php/bin/dev test
COLEGIO_BROWSER_TESTS=1 php/bin/dev test
```

El script requiere Docker, Bash, OpenSSL y curl. La prueba de navegador usa Playwright para Python y Chromium instalado. Se puede señalar un binario con `COLEGIO_CHROMIUM`. La suite comprueba el esquema nuevo, la actualización 001/002 → 004 y la respuesta ante la caída de PostgreSQL. La modalidad de pruebas crea y elimina sus propios contenedores y su base sintética. El servicio de desarrollo usa el puerto 4170 y la prueba usa el 4171. El script imprime la ubicación del archivo local de credenciales con permisos restrictivos. La cuenta inicial es `admin`.

Para detener el entorno de desarrollo y conservar los datos en Docker:

```bash
docker stop colegio-php-web colegio-php-pg
```

## Vista con contenido de muestra

Desde la raíz del repositorio, ejecuta `bash php/bin/dev demo` y abre `http://localhost:4172`. La vista usa otros contenedores y credenciales locales. Su base empieza con noticias, comunicados, agenda, galería, documentos PDF y directorios por área. El panel incluye un borrador y un comunicado programado. Las fotos de actividades son ilustrativas y la del frontis viene del repositorio.

En Windows, con Docker Desktop activo e integrado con Ubuntu, ejecuta este comando desde PowerShell en la raíz del repositorio.

```powershell
wsl.exe -d Ubuntu --exec /bin/bash php/bin/dev demo
```

La carga se aplica a una base editorial vacía. Luego puedes editar los registros en el panel y conservar los cambios al reiniciar. Para detener la vista, usa `docker stop colegio-php-demo-web colegio-php-demo-pg`.

Si el panel pide actualizar la base después de descargar una versión nueva, ejecuta el comando de arranque que usaste para iniciar el portal. Si la demo ya está corriendo, puedes aplicar las migraciones en ese mismo contenedor desde PowerShell.

```powershell
wsl.exe -d Ubuntu --exec docker exec colegio-php-demo-web php bin/console.php migrate
```

Para el entorno normal en el puerto 4170, usa el contenedor `colegio-php-web`.

## Editar el portal desde el CMS

Con una cuenta de administrador, abre **Diseño y contenido del portal** en el panel (`/admin/portal`). Busca los ajustes por nombre o campo, o filtra por sección. Guarda el borrador, abre **Vista previa** y publica cuando esté listo. El panel indica cuándo hay una versión publicada y un borrador pendiente. Puedes programar su publicación en hora de Lima. **Retirar publicación** vuelve a mostrar los valores predeterminados de ese ajuste.

- **Identidad y navegación.** Cambia el escudo, el icono de la pestaña, el nombre del portal, los colores, la tipografía y los espacios. Añade, agrupa, ordena o quita enlaces del menú y del pie.
- **Página de inicio.** Edita los títulos, botones, fotos, visibilidad, orden y cantidad de contenido en los bloques. Usa **Configuración del inicio** para el título, el lema, la foto de portada, los pilares, las cifras y el contacto. Las diapositivas y sus enlaces se editan en **Carrusel**.
- **Páginas públicas.** Edita las cabeceras, fotos, introducciones, enlaces, descripciones para buscadores y mensajes sin resultados. Cada ficha, publicación, foto o PDF se sigue editando en su módulo correspondiente.
- **Textos y recursos.** Personaliza los paneles de Institución, el retrato de respaldo, las etiquetas de filtros y calendario, los botones comunes y los títulos de páginas de estado.

En **Mesa de Partes y FUT** puedes editar los requisitos, el horario, los canales de presentación y consulta, y los datos de contacto. Los campos de contacto vacíos usan los datos publicados en **Configuración del inicio** cuando están disponibles. Puedes usar la guía de esta pantalla o editar la ficha de Institución con el identificador `mesa-partes`.

El botón **Descargar FUT** ofrece un modelo referencial rellenable y etiquetado. Usa **Cargar FUT oficial** en el panel para publicar el PDF del colegio bajo el identificador `fut`. La descarga conserva la misma dirección cuando publicas una versión nueva. Edita **Privacidad del portal** para publicar el texto que apruebe el colegio. En **Docentes**, usa **Área de enseñanza** para agrupar las tarjetas.

## Operación

El despliegue preparado para un VPS Linux incluye Caddy, PHP-FPM y PostgreSQL por socket local. [Arranque, SSH y restauración](deploy/vps/README.md)

Configura `COLEGIO_ENV=production`, `COLEGIO_DSN`, `COLEGIO_DB_USER`, `COLEGIO_DB_PASSWORD` y `COLEGIO_PUBLIC_ORIGIN` en el proceso PHP. Expón solo `public/` y dirige las rutas dinámicas a `public/index.php`. Usa HTTPS, una identidad PostgreSQL de migración con permisos DDL y una identidad de aplicación con los permisos DML necesarios. Para una base remota usa `sslmode=verify-full` y la CA correspondiente en el DSN de PostgreSQL. El origen configurado debe ser HTTPS y coincidir con el origen público real del portal. Se usa para CSRF, enlaces canónicos y sitemap. En producción las cookies de sesión usan Secure. El script local configura HTTP solo para desarrollo.

El despliegue de VPS lee la contraseña de la base desde `COLEGIO_DB_PASSWORD_FILE`. El servidor HTTPS marca `HTTPS=on` mediante FastCGI para que la aplicación acepte la solicitud en modo producción.

Usa PHP 8.6 con PDO PostgreSQL, Argon2id, Sodium, DOM, mbstring, GD con JPEG/PNG/WebP, EXIF y fileinfo. Instala qpdf, timeout y prlimit. Configura un límite de carga PHP de 15 MiB, límite de solicitud de 16 MiB y `display_errors=Off`. Antes de habilitar tráfico, ejecuta `php bin/console.php migrate` y comprueba `/health/ready`. Para crear o actualizar cuentas, usa `php bin/console.php account USUARIO ROL` y proporciona la clave por entrada estándar. `php bin/console.php disable USUARIO` desactiva la cuenta. Configura una tarea de sistema para ejecutar `php bin/console.php publish` y otra para `php bin/console.php cleanup`. Los horarios editoriales se ingresan en hora de Lima. La tarea de publicación materializa las revisiones vencidas y las lecturas muestran la revisión programada al alcanzar el horario, aunque la tarea todavía no se haya ejecutado.

El rol `editor` guarda y previsualiza borradores en sus módulos. `publisher` también publica, programa, retira y reordena publicaciones en los módulos autorizados. En producción las cuentas `admin` requieren verificación TOTP. Configura una clave de 32 bytes en formato hexadecimal mediante `COLEGIO_MFA_KEY` o `COLEGIO_MFA_KEY_FILE` y activa la cuenta con `php bin/console.php mfa-enroll USUARIO`. Conserva la clave en el gestor de secretos del entorno.

Consulta los [criterios de aceptación](DESIGN.md) y los [controles de seguridad](SECURITY.md). El [sistema visual para Stitch](design/DESIGN.md) documenta los estilos del portal y del CMS.

La [guía de Railway](deploy/railway/README.md) prepara una vista pública temporal con una base de prueba nueva.
