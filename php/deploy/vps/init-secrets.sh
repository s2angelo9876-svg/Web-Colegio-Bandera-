#!/bin/sh
set -eu
cd "$(dirname "$0")"

umask 077
secrets_dir=${COLEGIO_SECRETS_DIR:-./secrets}
mkdir -p -- "$secrets_dir"
if [ -L "$secrets_dir" ] || [ "$(stat -c '%a:%u' -- "$secrets_dir")" != "700:$(id -u)" ]; then
    echo 'El directorio de credenciales debe pertenecer al usuario de despliegue y tener permisos 0700.' >&2
    exit 1
fi

# Docker mounts each file into only the services that need it. The
# private directory protects these readable files on the VPS itself.
temporary=
trap 'if [ -n "$temporary" ]; then rm -f -- "$temporary"; fi' EXIT
for secret in db_owner db_migrator db_app mfa_key; do
    destination=$secrets_dir/$secret
    if [ ! -e "$destination" ] && [ ! -L "$destination" ]; then
        temporary=$(mktemp "$secrets_dir/.secret.XXXXXXXX")
        openssl rand -hex 32 > "$temporary"
        chmod 0444 "$temporary"
        if ! ln -- "$temporary" "$destination" && [ ! -f "$destination" ]; then
            exit 1
        fi
        rm -f -- "$temporary"
        temporary=
    fi
    if [ -L "$destination" ] || [ ! -f "$destination" ] || [ "$(wc -c < "$destination")" -ne 65 ] \
        || [ "$(stat -c '%a:%u' -- "$destination")" != "444:$(id -u)" ] \
        || ! grep -Eq '^[a-f0-9]{64}$' "$destination"; then
        printf 'Revisa el archivo de credencial %s antes de continuar.\n' "$destination" >&2
        exit 1
    fi
done
printf 'Credenciales de PostgreSQL y clave de verificación preparadas en %s.\n' "$secrets_dir"
