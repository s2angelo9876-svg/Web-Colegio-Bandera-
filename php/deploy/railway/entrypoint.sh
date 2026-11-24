#!/usr/bin/env bash
set -euo pipefail

cd /app
die() { printf '%s\n' "$1" >&2; exit 1; }

[[ ${COLEGIO_DB_HOST:-} =~ ^[a-zA-Z0-9][a-zA-Z0-9-]*\.railway\.internal$ ]] \
    || die 'COLEGIO_DB_HOST debe ser el dominio privado de PostgreSQL en Railway.'
[[ ${COLEGIO_DB_NAME:-} =~ ^[a-zA-Z0-9_]+$ ]] || die 'Configura COLEGIO_DB_NAME.'
COLEGIO_DB_PORT=${COLEGIO_DB_PORT:-5432}
[[ $COLEGIO_DB_PORT =~ ^[0-9]{1,5}$ ]] && (( 10#$COLEGIO_DB_PORT >= 1 && 10#$COLEGIO_DB_PORT <= 65535 )) \
    || die 'COLEGIO_DB_PORT debe ser un puerto válido.'
: "${COLEGIO_DB_CA_B64:?Configura la CA de PostgreSQL en COLEGIO_DB_CA_B64.}"

certificate=$(mktemp /tmp/colegio-db-ca.XXXXXXXX)
children=()
cleanup() {
    if (( ${#children[@]} )); then
        kill "${children[@]}" 2>/dev/null || true
        wait "${children[@]}" 2>/dev/null || true
    fi
    rm -f -- "$certificate"
}
trap cleanup EXIT
trap 'exit 0' TERM INT
printf '%s' "$COLEGIO_DB_CA_B64" | base64 --decode > "$certificate" || die 'La CA debe estar codificada en Base64.'
openssl x509 -noout -in "$certificate" || die 'No se pudo leer el certificado de la CA de PostgreSQL.'
chmod 0444 "$certificate"

export COLEGIO_ENV=production
export COLEGIO_DSN="pgsql:host=$COLEGIO_DB_HOST;port=$COLEGIO_DB_PORT;dbname=$COLEGIO_DB_NAME;sslmode=verify-full;sslrootcert=$certificate;connect_timeout=3"

case ${1:-serve} in
    migrate|account|mfa-enroll)
        export COLEGIO_DB_USER="${COLEGIO_MIGRATION_DB_USER:?Configura el usuario de migración.}"
        export COLEGIO_DB_PASSWORD="${COLEGIO_MIGRATION_DB_PASSWORD:?Configura la contraseña de migración.}"
        if [[ $1 != migrate ]]; then
            php bin/console.php "$@"
        else
            php deploy/railway/database-role.php
            php bin/console.php migrate
            if [[ ${COLEGIO_DEMO_DATA:-1} == 1 ]]; then
                php demo/import.php
            fi
            php deploy/vps/database-grants.php
        fi
        exit
        ;;
    serve) ;;
    *) die 'Comandos disponibles: serve, migrate, account, mfa-enroll.' ;;
esac

[[ ${RAILWAY_PUBLIC_DOMAIN:-} =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$ ]] \
    || die 'Genera el dominio público del servicio del portal en Railway.'
export PORT=${PORT:-8080}
[[ $PORT =~ ^[0-9]{1,5}$ ]] && (( 10#$PORT >= 1 && 10#$PORT <= 65535 )) || die 'PORT debe ser un puerto válido.'
export COLEGIO_PUBLIC_ORIGIN="https://$RAILWAY_PUBLIC_DOMAIN"
export COLEGIO_DB_USER=colegio_app
export COLEGIO_DB_PASSWORD="${COLEGIO_APP_PASSWORD:?Configura la contraseña de la aplicación.}"
unset COLEGIO_MIGRATION_DB_USER COLEGIO_MIGRATION_DB_PASSWORD COLEGIO_APP_PASSWORD COLEGIO_DB_CA_B64

export XDG_DATA_HOME=/tmp/colegio-caddy-data XDG_CONFIG_HOME=/tmp/colegio-caddy-config
php-fpm --nodaemonize --fpm-config /app/deploy/railway/php-fpm.conf &
children+=("$!")
runuser -u www-data -- sh deploy/vps/worker.sh &
children+=("$!")
runuser -u www-data -- caddy run --config /app/deploy/railway/Caddyfile --adapter caddyfile &
children+=("$!")

wait -n "${children[@]}"
die 'Se detuvo un proceso del portal.'
