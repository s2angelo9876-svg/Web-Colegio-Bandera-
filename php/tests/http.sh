#!/usr/bin/env bash
set -euo pipefail
url=$1 state=$2 database=$3 web=$4
source "$state/credentials"
jar="$state/cookies"
response="$state/response"
headers="$state/headers"
checks=0
expect() {
  local expected=$1 path=$2 code
  shift 2
  if ! code=$(curl -sS -b "$jar" -c "$jar" -D "$headers" -o "$response" -w '%{http_code}' "$@" "$url$path"); then
    printf 'Falló la solicitud %s.\n' "$path" >&2
    exit 1
  fi
  if [[ "$code" != "$expected" ]]; then
    printf '%s devolvió %s; se esperaba %s.\n' "$path" "$code" "$expected" >&2
    exit 1
  fi
  checks=$((checks+1))
}
contains() {
  if ! grep -Fq -- "$1" "$response"; then
    echo "Falta texto esperado: $1" >&2
    exit 1
  fi
  checks=$((checks+1))
}
absent() {
  if grep -Fq -- "$1" "$response"; then
    echo "Texto inesperado: $1" >&2
    exit 1
  fi
  checks=$((checks+1))
}
sql() {
  docker exec "$database" psql -U postgres -d colegio_php -v ON_ERROR_STOP=1 -Atc "$1"
}
expect 200 /
contains 'Colegio Bandera del Perú'
expect 200 /site.css
expect 200 /images/frontis_colegio-640.webp
expect 200 /health/live
expect 200 /health/ready
contains '"status":"ok"'
expect 301 /transparencia
grep -Fiq 'Location: /documentos' "$headers"
expect 422 '/noticias?pagina=-1'
expect 200 /sitemap.xml
contains '<loc>https://colegio.example/</loc>'
expect 404 /no-existe
expect 303 /admin
expect 200 /admin/ingresar
csrf=$(sed -n 's/.*name="_csrf" value="\([a-f0-9]*\)".*/\1/p' "$response")
[[ ${#csrf} == 64 ]]
expect 403 /admin/ingresar --data 'username=admin'
expect 403 /admin/ingresar -H 'Origin: https://colegio.example' --data-urlencode "_csrf=$csrf" --data 'username=admin'
# Cover the supported transition from the previous account hash.
legacy_hash=$(printf '%s\n' "$LOCAL_ADMIN_PASSWORD" | docker exec -i "$web" php -r '
    echo password_hash(rtrim(fgets(STDIN), "\r\n"), PASSWORD_BCRYPT);
')
sql "UPDATE accounts SET password_hash='$legacy_hash' WHERE username='admin'" >/dev/null
expect 303 /admin/ingresar --data-urlencode "_csrf=$csrf" --data-urlencode 'username=admin' --data-urlencode "password=$LOCAL_ADMIN_PASSWORD"
expect 200 /admin
[[ $(sql "SELECT split_part(password_hash,chr(36),2) FROM accounts WHERE username='admin'") == argon2id ]]
if docker exec "$web" php bin/console.php disable admin >/dev/null 2>&1; then
  echo 'El último administrador debe seguir activo.' >&2
  exit 1
fi
checks=$((checks+2))
csrf=$(sed -n 's/.*name="_csrf" value="\([a-f0-9]*\)".*/\1/p' "$response" | head -1)
[[ ${#csrf} == 64 ]]
expect 405 /admin/noticias/0/guardar
expect 403 /admin/noticias/0/guardar --data 'version=0'

save() {
  local expected=$1 module=$2 id=$3 version=$4 title=$5 slug=$6
  shift 6
  expect "$expected" "/admin/$module/$id/guardar" -H 'Accept: application/json' \
    --form-string "_csrf=$csrf" --form-string "version=$version" --form-string "title=$title" \
    --form-string "slug=$slug" --form-string "summary=Resumen $title" --form-string 'body=<p>Texto <strong>enriquecido</strong></p>' "$@"
}
id_saved() { sed -E 's/.*"id":([0-9]+).*/\1/' "$response"; }
mutate() {
  local module=$1 id=$2 action=$3 version=$4
  shift 4
  expect 303 "/admin/$module/$id/$action" --data-urlencode "_csrf=$csrf" --data-urlencode "version=$version" "$@"
}
save 415 noticias 0 0 Inválido invalido -F "media=@tests/http.sh"
save 201 noticias 0 0 'Noticia inicial' ejemplo --form-string 'tags=Historia, História, Vida escolar' -F 'media=@public/images/escudo.jpeg'
news=$(id_saved)
media=$(sql 'SELECT min(id) FROM media')
expect 404 "/medio/$media"
expect 200 "/admin/noticias/$news/vista"
contains '<strong>enriquecido</strong>'
expect 404 /noticias/ejemplo
expect 200 /tags
absent Historia
expect 200 /sitemap.xml
absent '/noticias/ejemplo'
expect 200 '/buscar?q=Noticia+inicial'
absent 'Resumen Noticia inicial'
expect 200 '/noticias?etiqueta=Historia'
absent 'Resumen Noticia inicial'
mutate noticias "$news" publish 1
expect 200 /noticias/ejemplo
contains 'Noticia inicial'
expect 200 "/medio/$media"
expect 200 "/medio/$media?tam=mini"
grep -Fiq 'Content-Type: image/webp' "$headers"
expect 200 '/tags/historia'
contains 'Noticia inicial'
expect 200 /tags
contains '/tags/historia'
[[ $(sql "SELECT count(*) FROM tags WHERE slug='historia'") == 1 ]]
checks=$((checks+1))
expect 200 /sitemap.xml
contains '/noticias/ejemplo'
expect 200 /
contains 'Resumen Noticia inicial'
expect 200 '/buscar?q=Noticia+inicial'
contains 'Resumen Noticia inicial'
save 200 noticias "$news" 2 'Cambio de trabajo' ejemplo --form-string 'tags=Deportes'
save 409 noticias "$news" 2 'Una edición atrasada' ejemplo
expect 422 "/admin/noticias/$news/guardar" --data-urlencode "_csrf=$csrf" --data 'version=2&title=&slug=ejemplo&body=Texto+local'
contains 'name="version" value="2"'
contains 'Texto local'
expect 409 "/admin/noticias/$news/guardar" --data-urlencode "_csrf=$csrf" --data 'version=2&title=Título+local&slug=ejemplo&body=Texto+local'
contains 'Abrir la edición vigente'
contains 'name="version" value="2"'
contains 'Texto local'
expect 200 /noticias/ejemplo
contains 'Noticia inicial'
absent 'Cambio de trabajo'
expect 200 '/noticias?etiqueta=Deportes'
absent 'Cambio de trabajo'
expect 200 "/admin/noticias/$news/vista"
contains 'Cambio de trabajo'
mutate noticias "$news" schedule 3 --data-urlencode 'publish_at=2099-12-25T10:00'
mutate noticias "$news" cancel 4
expect 200 /noticias/ejemplo
contains 'Noticia inicial'
mutate noticias "$news" schedule 5 --data-urlencode 'publish_at=2099-12-25T10:00'
expect 200 /noticias/ejemplo
absent 'Cambio de trabajo'
sql "UPDATE content SET publish_at=now()-interval '1 minute' WHERE id=$news" >/dev/null
expect 200 /noticias/ejemplo
contains 'Cambio de trabajo'
expect 200 /noticias/ejemplo
[[ $(sql "SELECT version FROM content WHERE id=$news") == 6 ]]
checks=$((checks+1))
[[ $(docker exec "$web" php bin/console.php publish) == '1 publicaciones procesadas' ]]
[[ $(docker exec "$web" php bin/console.php publish) == '0 publicaciones procesadas' ]]
checks=$((checks+2))
mutate noticias "$news" trash 7 --data-urlencode "reason=Limpieza de la prueba"
expect 404 /noticias/ejemplo
expect 404 "/medio/$media"
mutate noticias "$news" restore 8
expect 404 /noticias/ejemplo

docker exec "$web" php tests/pdf.php 1 > "$state/example.pdf"
docker exec "$web" php tests/pdf.php 2 > "$state/example-2.pdf"
expect 201 /admin/noticias/0/guardar -H 'Accept: application/json' \
  --data-urlencode "_csrf=$csrf" --data 'version=0&title=Solo+título&slug=sin-cuerpo&body='
empty_news=$(id_saved)
expect 422 "/admin/noticias/$empty_news/publish" --data-urlencode "_csrf=$csrf" --data 'version=1'
expect 404 /noticias/sin-cuerpo

for module in comunicados eventos galeria documentos docentes administrativos directivos carrusel institucion inicio; do
  extra=()
  case "$module" in
    eventos) extra=(--form-string 'fecha=2099-01-01') ;;
    galeria) extra=(--form-string 'video=https://youtu.be/ABCDEFGHIJK' --form-string 'fecha_galeria=2025-03-02') ;;
    documentos) extra=(-F "media=@$state/example.pdf" --form-string 'categoria=Actas') ;;
    carrusel) extra=(-F 'media=@public/images/escudo.jpeg') ;;
    inicio) extra=(--form-string 'pilar1_titulo=Pilar de prueba' -F 'media=@public/images/escudo.jpeg'
      --form-string 'metrica4_valor=0' --form-string 'metrica4_etiqueta=Cifra sintética'
      --form-string 'metrica4_fecha=2026-01-02' --form-string 'metrica4_fuente=https://colegio.example/registro') ;;
    comunicados) extra=(--form-string 'tipo=urgente') ;;
  esac
  save 201 "$module" 0 0 "Prueba $module" sintesis "${extra[@]}"
  id=$(id_saved)
  save 200 "$module" "$id" 1 "Edición $module" sintesis "${extra[@]}"
  mutate "$module" "$id" publish 2
  expect 200 "/$module/sintesis"
  contains "Edición $module"
  if [[ "$module" == galeria ]]; then
    contains 'data-video-id="ABCDEFGHIJK"'
    expect 200 '/galeria?tipo=video&anio=2025'
    contains "Edición galeria"
    expect 200 '/galeria?tipo=foto&anio=2025'
    absent "Edición galeria"
  fi
  if [[ "$module" == eventos ]]; then
    contains 'Horario por confirmar'
    expect 200 '/eventos?mes=2099-01'
    contains 'Calendario 2099-01'
    contains 'Edición eventos'
  fi
  if [[ "$module" == comunicados ]]; then
    expect 200 '/comunicados?aviso=urgente'
    contains 'Edición comunicados'
    expect 200 '/comunicados?aviso=general'
    absent 'Edición comunicados'
  fi
  version=3
  if [[ "$module" == documentos ]]; then
    pdf=$(sql "SELECT rm.media_id FROM content c JOIN revision_media rm ON rm.revision_id=c.published WHERE c.id=$id")
    expect 200 "/medio/$pdf"
    grep -Fiq 'Content-Disposition: attachment; filename="archivo.pdf"' "$headers"
    expect 200 '/documentos/sintesis/descargar'
    before=$(sha256sum < "$response")
    save 200 documentos "$id" 3 'Edición documentos' sintesis -F "media=@$state/example-2.pdf" --form-string 'categoria=Actas'
    mutate documentos "$id" publish 4
    expect 200 '/documentos/sintesis/descargar'
    [[ $(sha256sum < "$response") != "$before" ]]
    expect 301 "/medio/$pdf"
    grep -Fiq 'Location: /documentos/sintesis/descargar' "$headers"
    expect 200 '/documentos?categoria=actas&q=Edici%C3%B3n'
    contains 'Edición documentos'
    checks=$((checks+3))
    version=5
  fi
  if [[ "$module" == inicio || "$module" == carrusel ]]; then
    expect 200 /
    contains "Edición $module"
    if [[ "$module" == inicio ]]; then
      contains "Pilar de prueba"
      contains 'Cifra sintética'
    fi
  fi
  if [[ "$module" == inicio ]]; then
    expect 200 "/admin/inicio/$id/vista"
    contains 'class="hero"'
    contains '?revision='
    expect 200 /
    contains '<img class="hero-image" src="/medio/'
  fi
  mutate "$module" "$id" trash "$version" --data-urlencode 'reason=Retiro de datos sintéticos'
  expect 404 "/$module/sintesis"
  expect 200 "/admin/$module?papelera=1"
  contains "Edición $module"
  mutate "$module" "$id" restore "$((version+1))"
  expect 404 "/$module/sintesis"
done
save 201 institucion 0 0 'Historia para prueba' historia
history=$(id_saved)
mutate institucion "$history" publish 1
expect 301 '/historia'
grep -Fiq 'Location: /institucion/historia' "$headers"
expect 200 '/institucion/historia'
contains 'Historia para prueba'
[[ $(sql "SELECT count(*) FROM editorial_events WHERE content_id=$news AND action='publish-due'") == 1 ]]
checks=$((checks+1))
# Two published records make the public order observable and verify the set version.
save 201 docentes 0 0 'Docente primera' docente-primera
teacher_one=$(id_saved)
save 201 docentes 0 0 'Docente segunda' docente-segunda
teacher_two=$(id_saved)
mutate docentes "$teacher_one" publish 1
mutate docentes "$teacher_two" publish 1
expect 200 /admin/docentes/reordenar
set_version=$(sed -n 's/.*name="version" value="\([a-f0-9]*\)".*/\1/p' "$response")
[[ ${#set_version} == 64 ]]
other=$(sql "SELECT id FROM content WHERE module='docentes' AND slug='sintesis'")
expect 422 /admin/docentes/reordenar --data-urlencode "_csrf=$csrf" --data "complete=1&version=$set_version&positions[$teacher_one]=1&positions[$teacher_two]=1&positions[$other]=3"
expect 303 /admin/docentes/reordenar --data-urlencode "_csrf=$csrf" --data "complete=1&version=$set_version&positions[$teacher_one]=1&positions[$teacher_two]=2&positions[$other]=3"
expect 200 /docentes
[[ $(grep -Fn 'Docente primera' "$response" | head -1 | cut -d: -f1) -lt $(grep -Fn 'Docente segunda' "$response" | head -1 | cut -d: -f1) ]]
expect 409 /admin/docentes/reordenar --data-urlencode "_csrf=$csrf" --data "complete=1&version=$set_version&positions[$teacher_one]=2&positions[$teacher_two]=1&positions[$other]=3"

expect 303 /admin/etiquetas --data-urlencode "_csrf=$csrf" --data 'action=save&name=Cultura'
expect 200 /admin/etiquetas
contains 'Cultura'
expect 303 /admin/etiquetas --data-urlencode "_csrf=$csrf" --data 'action=archive&slug=cultura'
expect 303 /admin/etiquetas --data-urlencode "_csrf=$csrf" --data 'action=restore&slug=cultura'
expect 303 /admin/etiquetas --data-urlencode "_csrf=$csrf" --data 'action=rename&slug=cultura&name=Arte'
expect 200 /admin/etiquetas
contains 'Arte'

# Expiry is simulated inside the disposable database.
sql "UPDATE sessions SET last_seen=now()-interval '31 minutes' WHERE user_id IS NOT NULL" >/dev/null
expect 303 /admin
expect 200 /admin/ingresar
csrf=$(sed -n 's/.*name="_csrf" value="\([a-f0-9]*\)".*/\1/p' "$response")
expect 303 /admin/ingresar --data-urlencode "_csrf=$csrf" --data-urlencode 'username=admin' --data-urlencode "password=$LOCAL_ADMIN_PASSWORD"
expect 200 /admin
csrf=$(sed -n 's/.*name="_csrf" value="\([a-f0-9]*\)".*/\1/p' "$response" | head -1)
expect 303 /admin/salir --data-urlencode "_csrf=$csrf"
expect 303 /admin
expect 200 /admin/ingresar
csrf=$(sed -n 's/.*name="_csrf" value="\([a-f0-9]*\)".*/\1/p' "$response")
expect 303 /admin/ingresar --data-urlencode "_csrf=$csrf" --data-urlencode 'username=admin' --data-urlencode "password=$LOCAL_ADMIN_PASSWORD"
sql "UPDATE accounts SET role='editor',generation=generation+1 WHERE username='admin'" >/dev/null
expect 303 /admin
expect 200 /admin/ingresar
csrf=$(sed -n 's/.*name="_csrf" value="\([a-f0-9]*\)".*/\1/p' "$response")
expect 303 /admin/ingresar --data-urlencode "_csrf=$csrf" --data-urlencode 'username=admin' --data-urlencode "password=$LOCAL_ADMIN_PASSWORD"
expect 200 /admin
csrf=$(sed -n 's/.*name="_csrf" value="\([a-f0-9]*\)".*/\1/p' "$response" | head -1)
expect 403 /admin/inicio
expect 200 /admin/noticias
mutate noticias "$news" schedule 9 --data-urlencode 'publish_at=2099-12-25T10:00'
mutate noticias "$news" cancel 10
mutate noticias "$news" publish 11
expect 200 /noticias/ejemplo
expect 403 "/admin/noticias/$news/trash" --data-urlencode "_csrf=$csrf" --data 'version=12&reason=Comprobar permiso'
expect 403 /admin/etiquetas --data-urlencode "_csrf=$csrf" --data 'action=archive&slug=cultura'
sql "UPDATE accounts SET enabled=false WHERE username='admin'" >/dev/null
expect 303 /admin
printf '%s comprobaciones HTTP y de estado correctas.\n' "$checks"
