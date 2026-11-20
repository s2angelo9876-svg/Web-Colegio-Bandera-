#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../deploy/vps"

umask 077
state=$(mktemp -d /tmp/colegio-vps-test.XXXXXXXX)
project="colegio-vps-${state##*.}"
project="${project,,}"
http_port=${COLEGIO_VPS_TEST_HTTP_PORT:-4180}
https_port=${COLEGIO_VPS_TEST_HTTPS_PORT:-4443}
export COLEGIO_DOMAIN=colegio.test COLEGIO_ACME_EMAIL=admin@colegio.test
export COLEGIO_SECRETS_DIR="$state/secrets"
export COLEGIO_HTTP_BIND="127.0.0.1:$http_port" COLEGIO_HTTPS_BIND="127.0.0.1:$https_port"

# The test CA is used only in this disposable stack.
awk '1; /^https:\/\/\{\$COLEGIO_DOMAIN\} \{$/ { print "\ttls internal" }' Caddyfile > "$state/Caddyfile"
chmod 0644 "$state/Caddyfile"
cat > "$state/override.yml" <<YAML
services:
  edge:
    volumes:
      - "$state/Caddyfile:/etc/caddy/Caddyfile:ro"
YAML
stack=(docker compose -p "$project" -f compose.yml -f "$state/override.yml")
cleanup() {
    local result=$?
    if (( result )); then
        "${stack[@]}" ps -a >&2 || true
        "${stack[@]}" logs --tail 16 >&2 || true
    fi
    "${stack[@]}" down --volumes --remove-orphans >/dev/null
    rm -rf -- "$state"
}
trap cleanup EXIT

sh init-secrets.sh >/dev/null
checksums=$(sha256sum "$state/secrets/"*)
sh init-secrets.sh >/dev/null
[[ $(sha256sum "$state/secrets/"*) == "$checksums" ]]
"${stack[@]}" up -d --build

origin="https://$COLEGIO_DOMAIN"
request=(curl --silent --show-error --noproxy '*' --max-time 8)
secure=("${request[@]}" --connect-to "$COLEGIO_DOMAIN:443:127.0.0.1:$https_port" --cacert "$state/ca.crt")
for attempt in {1..20}; do
    if "${stack[@]}" exec -T edge cat /data/caddy/pki/authorities/local/root.crt > "$state/ca.crt" 2>/dev/null \
        && "${secure[@]}" -f -o /dev/null "$origin/health/ready" 2>/dev/null; then
        break
    fi
    sleep 1
done
"${secure[@]}" -f -o /dev/null "$origin/health/ready"

[[ $("${request[@]}" -o /dev/null -D "$state/headers" -w '%{http_code}' \
    -H "Host: $COLEGIO_DOMAIN" "http://127.0.0.1:$http_port/noticias?pagina=1") == 308 ]]
tr -d '\r' < "$state/headers" | grep -Fxi "Location: $origin/noticias?pagina=1" >/dev/null
"${secure[@]}" -f -D "$state/headers" -o /dev/null "$origin/"
grep -qi '^strict-transport-security: max-age=31536000' "$state/headers"
grep -qi '^content-security-policy:' "$state/headers"
for asset in /site.css /navigation.css /site-start.js /assets/manrope.woff2 /images/escudo.jpeg; do
    "${secure[@]}" -f -o /dev/null "$origin$asset"
done
"${stack[@]}" exec -T edge test ! -e /srv/public/index.php

openssl rand -hex 24 | tr -d '\n' > "$state/admin-password"
"${stack[@]}" run --rm --no-deps -T migrate php bin/console.php account admin admin < "$state/admin-password"
"${secure[@]}" -f -c "$state/cookies" -D "$state/headers" -o "$state/login" "$origin/admin/ingresar"
for flag in secure httponly samesite=lax; do
    grep -qi "^set-cookie:.*$flag" "$state/headers"
done
csrf=$(sed -n 's/.*name="_csrf" value="\([a-f0-9]*\)".*/\1/p' "$state/login")
[[ ${#csrf} == 64 ]]
[[ $("${secure[@]}" -b "$state/cookies" -c "$state/cookies" -o /dev/null -w '%{http_code}' \
    -H "Origin: $origin" --data-urlencode "_csrf=$csrf" --data-urlencode 'username=admin' \
    --data-urlencode "password@$state/admin-password" "$origin/admin/ingresar") == 303 ]]
"${secure[@]}" -f -b "$state/cookies" -o "$state/panel" "$origin/admin"
grep -Fq 'Panel de contenidos' "$state/panel"
"${secure[@]}" -f -b "$state/cookies" -o "$state/editor" "$origin/admin/noticias/nuevo"
csrf=$(sed -n 's/.*name="_csrf" value="\([a-f0-9]*\)".*/\1/p' "$state/editor" | head -1)
[[ ${#csrf} == 64 ]]
[[ $("${secure[@]}" -b "$state/cookies" -o "$state/saved" -w '%{http_code}' \
    -H "Origin: $origin" -H 'Accept: application/json' \
    --form-string "_csrf=$csrf" --form-string 'version=0' --form-string 'title=Noticia sintética' \
    --form-string 'slug=prueba-vps' --form-string 'body=Comprobación de producción' \
    --form-string 'tags=Control editorial' -F 'media=@../../public/images/escudo.jpeg' \
    "$origin/admin/noticias/0/guardar") == 201 ]]
news=$(sed -nE 's/.*"id":([0-9]+).*/\1/p' "$state/saved")
[[ $news =~ ^[0-9]+$ ]]
[[ $("${secure[@]}" -b "$state/cookies" -o /dev/null -w '%{http_code}' -H "Origin: $origin" \
    --data-urlencode "_csrf=$csrf" --data-urlencode 'version=1' "$origin/admin/noticias/$news/publish") == 303 ]]
"${secure[@]}" -f -o "$state/news" "$origin/noticias/prueba-vps"
grep -Fq 'Noticia sintética' "$state/news"
"${stack[@]}" run --rm --no-deps -T migrate
"${secure[@]}" -f -o /dev/null "$origin/noticias/prueba-vps"

"${stack[@]}" exec -T app php <<'PHP'
<?php
$_SERVER['REQUEST_URI'] = '/buscar';
$_SERVER['REQUEST_METHOD'] = 'GET';
ob_start();
require 'public/index.php';
ob_end_clean();
exit(http_response_code() === 400 ? 0 : 1);
PHP

"${stack[@]}" exec -T app php <<'PHP'
<?php
require 'src/bootstrap.php';
$privileges = query("SELECT current_user='colegio_app'
    AND NOT has_schema_privilege(current_user,'public','CREATE')
    AND NOT has_table_privilege(current_user,'editorial_events','UPDATE,DELETE,TRUNCATE')
    AND NOT has_table_privilege(current_user,'schema_migrations','INSERT,UPDATE,DELETE')
    AND NOT has_column_privilege(current_user,'accounts','role','UPDATE')
    AND has_column_privilege(current_user,'accounts','password_hash','UPDATE')")->fetchColumn();
exit($privileges ? 0 : 1);
PHP
[[ $(docker inspect --format '{{.HostConfig.NetworkMode}}' "$("${stack[@]}" ps -q db)") == none ]]
[[ $(docker inspect --format '{{len .HostConfig.PortBindings}}' "$("${stack[@]}" ps -q app)") == 0 ]]
"${secure[@]}" -f -o /dev/null "$origin/buscar?q=marca-sintetica"
"${stack[@]}" logs --no-color edge app > "$state/access.log"
if grep -q 'marca-sintetica' "$state/access.log"; then
    echo 'Un registro contiene el término enviado al buscador.' >&2
    exit 1
fi

"${stack[@]}" exec -T db sh -ec '
    export PGPASSWORD=$(cat /run/secrets/db_migrator)
    pg_dump -h /var/run/postgresql -U colegio_migrator -Fc colegio_php
' > "$state/database.dump"
"${stack[@]}" exec -T db sh -ec '
    export PGPASSWORD=$(cat /run/secrets/db_owner)
    createdb -h /var/run/postgresql -U postgres --owner=colegio_migrator colegio_restore_test
'
"${stack[@]}" exec -T db sh -ec '
    export PGPASSWORD=$(cat /run/secrets/db_migrator)
    pg_restore -h /var/run/postgresql -U colegio_migrator --exit-on-error -d colegio_restore_test
    psql -h /var/run/postgresql -U colegio_migrator -d colegio_restore_test -Atc \
      "SELECT count(*) = 1 AND EXISTS (SELECT 1 FROM content WHERE published IS NOT NULL)
       AND EXISTS (SELECT 1 FROM media) FROM accounts"
' < "$state/database.dump" | grep -Fxq t

echo 'VPS verificado en Docker. HTTPS, HSTS, cookies, acceso, permisos de BD y restauración correctos.'
