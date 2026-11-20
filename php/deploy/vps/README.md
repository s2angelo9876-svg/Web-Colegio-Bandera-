# Publicar el portal PHP en un VPS

Usa un VPS Linux actualizado con Docker Engine, Compose v2 y OpenSSL. Configura el registro DNS del dominio hacia el VPS y permite tráfico TCP en 80 y 443. La configuración publica esos puertos en IPv4. Si usas un registro AAAA, verifica también la conexión pública por IPv6.

Caddy obtiene y renueva el certificado público, redirige HTTP a HTTPS y envía HSTS. PHP-FPM queda en la red privada de Compose. PostgreSQL escucha por un socket Unix en el mismo VPS y autentica con SCRAM. La cuenta de PHP tiene permisos operativos sobre tablas concretas. La cuenta que posee el esquema se usa durante migraciones y administración por consola.

## Arranque

Desde la raíz del repositorio, entra al directorio de despliegue.

```bash
cd php/deploy/vps
cp -n .env.example .env
```

Edita `.env` con el nombre del dominio, por ejemplo `colegio.example.org`, y un correo real para ACME. Ejecuta los siguientes comandos con la misma cuenta de despliegue. Los secretos se generan en un directorio privado y se conservan en ejecuciones posteriores.

```bash
sh init-secrets.sh
docker compose up -d --build
docker compose ps -a
```

El paso `migrate` debe terminar con código 0. Comprueba el arranque desde un equipo externo al VPS y sustituye el dominio de ejemplo por el real.

```bash
curl -sSI http://colegio.example.org/
curl -fsSI https://colegio.example.org/health/ready
```

La primera respuesta debe ser 308 hacia HTTPS. La segunda debe ser 200 y contener `Strict-Transport-Security`. Examina el estado con `docker compose logs --tail=80 edge app migrate worker`. El proceso `worker` materializa publicaciones programadas y limpia sesiones y límites vencidos.

## Cuentas y SSH

Crea la primera cuenta administrativa desde una sesión de Bash en el VPS. Introduce la contraseña desde el gestor de contraseñas del colegio.

```bash
read -rsp 'Contraseña del administrador: ' COLEGIO_ADMIN_PASSWORD
printf '\n'
printf '%s\n' "$COLEGIO_ADMIN_PASSWORD" | docker compose run --rm --no-deps -T migrate php bin/console.php account administrador admin
unset COLEGIO_ADMIN_PASSWORD
```

En Debian o Ubuntu, crea primero una cuenta de operación con `sudo` y una clave SSH. Verifica que puede iniciar sesión en una segunda terminal. En el firewall del proveedor y del sistema conserva el puerto SSH configurado para las redes de administración y permite 80 y 443 para el público. Docker publica únicamente los puertos del servicio `edge`.

Instala la plantilla de OpenSSH desde el VPS y conserva la sesión actual durante el cambio.

```bash
sudo install -m 0644 ssh/00-colegio.conf /etc/ssh/sshd_config.d/00-colegio.conf
sudo sshd -t
sudo sshd -T | grep -E '^(permitrootlogin|passwordauthentication|kbdinteractiveauthentication|pubkeyauthentication) '
```

Confirma que root, contraseña y autenticación interactiva devuelven `no` y que la clave pública devuelve `yes`. Recarga con `sudo systemctl reload ssh` y vuelve a verificar el acceso en la segunda terminal.

Si el host usa systemd y tiene Fail2ban instalado, la plantilla de SSH registra y limita intentos repetidos de acceso. Valida el jail antes de recargarlo.

```bash
sudo install -m 0644 ssh/colegio-sshd.local /etc/fail2ban/jail.d/colegio-sshd.local
sudo fail2ban-client -t
sudo systemctl reload fail2ban
sudo fail2ban-client status sshd
```

Activa MFA en el proveedor del VPS y en GitHub. Ante acceso sospechoso, preserva los registros de SSH y de despliegue, aísla el tráfico necesario desde el proveedor y revoca las claves y sesiones afectadas. Recupera desde una revisión e imagen verificadas y rota los secretos alcanzados por el incidente. Para revocar una cuenta del portal, ejecuta `docker compose run --rm --no-deps -T migrate php bin/console.php disable USUARIO`.

## Respaldo y actualizaciones

Programa respaldos de PostgreSQL según la retención del colegio. Cifra y conserva una copia fuera del VPS. El volcado incluye publicaciones, archivos, revisiones, cuentas y eventos editoriales.

```bash
umask 077
mkdir -p "$HOME/colegio-backups"
backup="$HOME/colegio-backups/colegio-$(date -u +%Y%m%dT%H%M%SZ).dump"
docker compose exec -T db sh -ec '
    export PGPASSWORD=$(cat /run/secrets/db_migrator)
    pg_dump -h /var/run/postgresql -U colegio_migrator -Fc colegio_php
' > "$backup.part" && mv "$backup.part" "$backup"
```

Prueba la restauración en un proyecto de Compose separado y con una base vacía. Conserva la variable `backup` con la ruta del volcado que quieres probar.

```bash
docker compose -p colegio-restauracion up -d --wait db
docker compose -p colegio-restauracion exec -T db sh -ec '
    export PGPASSWORD=$(cat /run/secrets/db_migrator)
    pg_restore -h /var/run/postgresql -U colegio_migrator --exit-on-error -d colegio_php
' < "$backup"
```

Verifica cuentas, publicaciones y descargas tras la restauración antes de promoverla. Mantén el volumen de PostgreSQL y el de certificados durante las actualizaciones. Aplica las actualizaciones de seguridad del sistema operativo y compila con imágenes base recientes.

```bash
docker compose pull db
docker compose build --pull
docker compose up -d
docker compose exec -T app php -v
```

Desde la raíz del repo, `bash php/tests/vps.sh` valida el despliegue aislado con una CA local. La emisión del certificado público, las reglas del firewall, las sesiones SSH y el respaldo externo se comprueban en el VPS real.
