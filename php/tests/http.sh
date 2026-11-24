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
  : > "$response"
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
expect_visitor() {
  local jar=/dev/null
  expect "$@"
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
expect 200 /images/escudo.webp
expect 200 /images/frontis_colegio-640.webp
expect 200 /health/live
expect 200 /health/ready
contains '"status":"ok"'
expect 301 /transparencia
grep -Fiq 'Location: /documentos' "$headers"
expect 422 '/noticias?pagina=-1'
expect 200 /sitemap.xml
contains '<loc>https://colegio.example/</loc>'
contains '<loc>https://colegio.example/mesa-partes</loc>'
contains '<loc>https://colegio.example/docentes</loc>'
contains '<loc>https://colegio.example/eventos</loc>'
contains '<loc>https://colegio.example/privacidad</loc>'
expect 200 /privacidad
contains 'Solicitudes y datos personales'
for term in 'FUT' 'Formulario+%C3%9Anico+de+Tr%C3%A1mite' 'Mesa+de+Partes'; do
  expect 200 "/buscar?q=$term"
  contains 'href="/mesa-partes/fut"'
  contains 'Ir a Mesa de Partes'
  grep -Fiq 'X-Robots-Tag: noindex, follow' "$headers"
done
expect 200 '/buscar?q=TerminoInexistente'
contains 'Prueba con un término más breve'
grep -Fiq 'Cache-Control: no-store' "$headers"
expect 200 /mesa-partes
contains '<h1>Mesa de Partes</h1>'
contains 'Presentar una solicitud'
contains 'href="/mesa-partes/fut"'
contains 'Modelo referencial editable'
expect 200 /mesa-partes/fut
fut_tag=$(sed -n 's/^ETag: \(.*\)\r$/\1/p' "$headers")
[[ $fut_tag == W/* ]]
grep -Fiq 'Content-Type: application/pdf' "$headers"
grep -Fiq 'Content-Disposition: attachment; filename="fut-solicitud-referencial.pdf"' "$headers"
cmp public/forms/fut-referencial.pdf "$response"
expect 304 /mesa-partes/fut -H "If-None-Match: $fut_tag"
[[ ! -s "$response" ]]
expect 301 /institucion/mesa-partes
grep -Fiq 'Location: /mesa-partes' "$headers"
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
grep -Fiq 'Cache-Control: no-store' "$headers"
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
news_tag=$(sed -n 's/^ETag: \(.*\)\r$/\1/p' "$headers")
[[ $news_tag == W/* ]]
expect 304 /noticias/ejemplo -H "If-None-Match: $news_tag"
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
expect 304 /noticias/ejemplo -H "If-None-Match: $news_tag"
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
expect 200 /noticias/ejemplo -H "If-None-Match: $news_tag"
contains 'Cambio de trabajo'
published_tag=$(sed -n 's/^ETag: \(.*\)\r$/\1/p' "$headers")
expect 304 /noticias/ejemplo -H "If-None-Match: $published_tag"
[[ $(sql "SELECT version FROM content WHERE id=$news") == 6 ]]
checks=$((checks+1))
[[ $(docker exec "$web" php bin/console.php publish) == '1 publicaciones procesadas' ]]
[[ $(docker exec "$web" php bin/console.php publish) == '0 publicaciones procesadas' ]]
checks=$((checks+2))
mutate noticias "$news" trash 7 --data-urlencode "reason=Limpieza de la prueba"
expect 404 /noticias/ejemplo -H "If-None-Match: $published_tag"
grep -Fiq 'Cache-Control: no-store' "$headers"
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
    directivos) extra=(--form-string 'cargo=Subdirección académica' --form-string 'especialidad=Matemática') ;;
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
    contains 'Enero de 2099'
    contains '/eventos?mes=2098-12'
    contains '/eventos?mes=2099-02'
    contains 'Edición eventos'
  fi
  if [[ "$module" == comunicados ]]; then
    expect 200 '/comunicados?aviso=urgente'
    contains 'Edición comunicados'
    expect 200 '/comunicados?aviso=general'
    absent 'Edición comunicados'
  fi
  if [[ "$module" == directivos ]]; then
    expect 200 /directivos
    contains '<p class="staff-role">Subdirección académica</p>'
    contains '<p class="staff-subject">Matemática</p>'
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
    contains 'Descargar PDF'
    contains 'KiB'
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
save 201 institucion 0 0 'Historia para prueba' historia --form-string 'seccion=Identidad institucional'
history=$(id_saved)
mutate institucion "$history" publish 1
expect 301 '/historia'
grep -Fiq 'Location: /institucion/historia' "$headers"
expect 200 '/institucion/historia'
contains 'Historia para prueba'
expect 200 /institucion
contains '<section class="public-feature institution-feature" aria-labelledby="seccion-historia">'
contains 'Historia para prueba'
absent 'href="/institucion/historia"'
expect 200 /images/institucion/identidad.webp
save 201 institucion 0 0 'Misión de prueba' mision --form-string 'seccion=Identidad institucional'
mutate institucion "$(id_saved)" publish 1
save 201 institucion 0 0 'Guía de trámites de prueba' mesa-partes --form-string 'seccion=Gestión institucional'
guide=$(id_saved)
expect 200 /mesa-partes
absent 'Resumen Guía de trámites de prueba'
mutate institucion "$guide" publish 1
expect 200 /mesa-partes
contains 'Resumen Guía de trámites de prueba'
save 201 documentos 0 0 'FUT de prueba' fut --form-string 'categoria=Trámites' -F "media=@$state/example.pdf"
fut=$(id_saved)
expect 200 /mesa-partes/fut
cmp public/forms/fut-referencial.pdf "$response"
mutate documentos "$fut" publish 1
expect 200 /mesa-partes/fut
grep -Fiq 'Content-Disposition: attachment; filename="fut-solicitud.pdf"' "$headers"
cmp "$state/example.pdf" "$response"
expect 200 /mesa-partes
absent 'Modelo referencial editable'
mutate documentos "$fut" unpublish 2 --data-urlencode 'reason=Retiro del FUT de prueba'
expect 200 /mesa-partes/fut
cmp public/forms/fut-referencial.pdf "$response"
checks=$((checks+6))
expect 200 /sitemap.xml
absent '/institucion/mesa-partes</loc>'
[[ $(sql "SELECT count(*) FROM editorial_events WHERE content_id=$news AND action='publish-due'") == 1 ]]
checks=$((checks+1))
# Two published records make the public order observable and verify the set version.
save 201 docentes 0 0 'Docente primera' docente-primera --form-string 'especialidad=Comunicación' --form-string 'area=Humanidades' \
  --form-string 'alt=Foto de prueba' -F 'media=@public/images/escudo.jpeg'
teacher_one=$(id_saved)
save 201 docentes 0 0 'Docente segunda con un nombre completo de prueba' docente-segunda --form-string 'area=Humanidades'
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
contains '<article class="card staff-card">'
contains 'Humanidades'
contains '<p class="staff-role">Comunicación</p>'
contains 'alt="Foto de prueba"'
absent 'href="/docentes/docente-primera"'
[[ $(grep -Fn 'Docente primera' "$response" | head -1 | cut -d: -f1) -lt $(grep -Fn 'Docente segunda' "$response" | head -1 | cut -d: -f1) ]]
expect 409 /admin/docentes/reordenar --data-urlencode "_csrf=$csrf" --data "complete=1&version=$set_version&positions[$teacher_one]=2&positions[$teacher_two]=1&positions[$other]=3"

save 201 administrativos 0 0 'Apoyo sin ficha' apoyo-sin-ficha --form-string 'summary=' --form-string 'body='
mutate administrativos "$(id_saved)" publish 1
expect 200 /administrativos
contains '<p class="information-title">Apoyo sin ficha</p>'

expect 303 /admin/etiquetas --data-urlencode "_csrf=$csrf" --data 'action=save&name=Cultura'
expect 200 /admin/etiquetas
contains 'Cultura'
expect 303 /admin/etiquetas --data-urlencode "_csrf=$csrf" --data 'action=archive&slug=cultura'
expect 303 /admin/etiquetas --data-urlencode "_csrf=$csrf" --data 'action=restore&slug=cultura'
expect 303 /admin/etiquetas --data-urlencode "_csrf=$csrf" --data 'action=rename&slug=cultura&name=Arte'
expect 200 /admin/etiquetas
contains 'Arte'

expect 200 /admin/portal
contains 'Diseño y contenido del portal'
contains 'Mesa de Partes y FUT'
expect 200 '/admin/portal?q=horario'
contains 'Mesa de Partes y FUT'
absent '>Retrato de respaldo<'
expect 404 '/admin/portal/nuevo?seccion=inexistente'
save 422 portal 0 0 'Sección ajena' inexistente
expect 200 '/admin/portal/nuevo?seccion=pagina-galeria'
contains 'value="Galería"'
save 201 portal 0 0 '' pagina-galeria --form-string 'titulo=Archivo de la comunidad' \
  --form-string 'resumen=Una portada a medida' --form-string 'cantidad=8' \
  --form-string 'contenido=<p><strong>Crónica de la comunidad</strong></p>' \
  --form-string 'accion=Ver fotografías' --form-string 'destino=/galeria?tipo=foto' \
  --form-string 'meta=Galería de la comunidad educativa' --form-string 'alt=Encabezado de la galería' \
  -F 'media=@public/images/escudo.jpeg'
gallery_custom=$(id_saved)
gallery_revision=$(sql "SELECT working FROM content WHERE id=$gallery_custom")
gallery_media=$(sql "SELECT media_id FROM revision_media WHERE revision_id=$gallery_revision")
expect 200 /galeria
absent 'Archivo de la comunidad'
expect 404 "/medio/$gallery_media"
expect_visitor 404 "/medio/$gallery_media?revision=$gallery_revision"
expect 200 "/admin/portal/$gallery_custom/vista"
contains '<h1>Archivo de la comunidad</h1>'
contains 'Vista previa del portal'
contains "/medio/$gallery_media?revision=$gallery_revision"
contains '<strong>Crónica de la comunidad</strong>'
expect 200 "/medio/$gallery_media?revision=$gallery_revision"
mutate portal "$gallery_custom" publish 1
expect 200 /galeria
contains '<h1>Archivo de la comunidad</h1>'
contains 'alt="Encabezado de la galería"'
contains 'Ver fotografías'
contains 'content="Galería de la comunidad educativa"'
absent '?revision='
expect 200 "/medio/$gallery_media"
expect 200 /sitemap.xml
absent '/portal/pagina-galeria'
expect 404 /portal/pagina-galeria
save 200 portal "$gallery_custom" 2 '' pagina-galeria --form-string 'titulo=Galería actualizada' \
  --form-string 'cantidad=8' --form-string 'remove_media=1'
expect 200 /galeria
contains 'Archivo de la comunidad'
expect 200 "/admin/portal/$gallery_custom"
contains 'Borrador pendiente'
expect 200 "/admin/portal/$gallery_custom/vista"
contains 'Galería actualizada'
absent 'Encabezado de la galería'
expect 200 "/admin/portal/$gallery_custom/vista?revision=$gallery_revision"
contains 'Encabezado de la galería'
mutate portal "$gallery_custom" unpublish 3 --data-urlencode 'reason=Restaurar la presentación predeterminada'
expect 200 /galeria
contains '<h1>Galería</h1>'
expect 404 "/medio/$gallery_media"

save 201 portal 0 0 '' textos --form-string 'vacio=Prueba del mensaje general sin resultados'
empty_custom=$(id_saved)
mutate portal "$empty_custom" publish 1
expect 200 '/galeria?q=ConsultaSinCoincidencias'
contains 'Prueba del mensaje general sin resultados'
expect 200 '/docentes?q=ConsultaSinCoincidencias'
contains 'No hay docentes publicados.'
mutate portal "$empty_custom" unpublish 2 --data-urlencode 'reason=Restaurar el mensaje general'
expect 200 '/galeria?q=ConsultaSinCoincidencias'
contains 'No hay contenido publicado que coincida.'

save 201 portal 0 0 '' marca --form-string 'nombre=Bandera del Perú' \
  --form-string 'pestana=I.E. Bandera del Perú' --form-string 'alt=Escudo institucional de prueba' \
  -F 'media=@public/images/escudo.jpeg'
logo_custom=$(id_saved)
expect 200 "/admin/portal/$logo_custom/vista"
contains 'alt="Escudo institucional de prueba"'
mutate portal "$logo_custom" publish 1
expect 200 /
contains 'alt="Escudo institucional de prueba"'
mutate portal "$logo_custom" unpublish 2 --data-urlencode 'reason=Restaurar la identidad de prueba'

save 201 portal 0 0 '' acceso --form-string 'titulo=Ingresar a la administración' \
  --form-string 'alt=Fachada del colegio al ingreso' -F 'media=@public/images/escudo.jpeg'
login_custom=$(id_saved)
expect 200 "/admin/portal/$login_custom/vista"
contains 'alt="Fachada del colegio al ingreso"'
mutate portal "$login_custom" publish 1
expect_visitor 200 /admin/ingresar
contains 'alt="Fachada del colegio al ingreso"'
mutate portal "$login_custom" unpublish 2 --data-urlencode 'reason=Restaurar la imagen de acceso'
expect 200 '/admin/portal/nuevo?seccion=icono'
absent 'name="alt"'
expect 200 '/admin/portal/nuevo?seccion=pagina-inicio'
absent 'name="cantidad"'

theme_options=(--form-string 'marca=#172943' --form-string 'fondo_claro=#f7f6f3' \
  --form-string 'panel_claro=#ffffff' --form-string 'fondo_oscuro=#111a28' \
  --form-string 'panel_oscuro=#182437' --form-string 'fuente=serif' \
  --form-string 'espaciado=compacto' --form-string 'esquinas=recto')
save 422 portal 0 0 '' apariencia --form-string 'acento=#fafafa' "${theme_options[@]}"
contains 'contraste'
save 201 portal 0 0 '' apariencia --form-string 'acento=#842131' "${theme_options[@]}"
theme_custom=$(id_saved)
theme_revision=$(sql "SELECT working FROM content WHERE id=$theme_custom")
expect 200 /
absent '/tema.css'
expect_visitor 404 "/tema.css?revision=$theme_revision"
expect 200 "/admin/portal/$theme_custom/vista"
contains "/tema.css?revision=$theme_revision"
expect 200 "/tema.css?revision=$theme_revision"
contains '--accent:#842131'
contains '--font-ui:Georgia, serif'
grep -Fiq 'Content-Type: text/css' "$headers"
mutate portal "$theme_custom" publish 1
expect 200 /
contains 'href="/tema.css"'
expect 200 /tema.css
contains '--accent:#842131'
mutate portal "$theme_custom" unpublish 2 --data-urlencode 'reason=Restaurar colores de prueba'

save 201 portal 0 0 '' pagina-mesa-partes --form-string 'titulo=Trámites escolares' \
  --form-string 'resumen=Información para las familias' --form-string 'guia_local=si' \
  --form-string 'contenido=<p>Atención de solicitudes por Secretaría.</p>' \
  --form-string 'requisitos=<p>Adjunta los documentos que correspondan al trámite.</p>' \
  --form-string 'horario=Lunes de 08:00 a 12:00' --form-string 'correo=tramites@example.org' \
  --form-string 'telefono=+51 999 000 000' --form-string 'ruta_presentar=https://tramites.example.org/' \
  --form-string 'ruta_consultar=https://tramites.example.org/consulta' \
  --form-string 'fut_titulo=Formato de solicitud' --form-string 'fut_accion=Obtener formato' \
  --form-string 'enlaces[0][label]=Ver otros documentos' --form-string 'enlaces[0][url]=/documentos'
desk_custom=$(id_saved)
expect 200 "/admin/portal/$desk_custom/vista"
contains 'Atención de solicitudes por Secretaría.'
contains 'href="/mesa-partes/fut"'
contains 'Obtener formato'
expect 200 /mesa-partes
absent 'Trámites escolares'
mutate portal "$desk_custom" publish 1
expect 200 /mesa-partes
contains '<h1>Trámites escolares</h1>'
contains 'Ver otros documentos'
contains 'Atención de solicitudes por Secretaría.'
contains 'Adjunta los documentos que correspondan'
contains 'href="mailto:tramites@example.org"'
contains 'href="tel:+51999000000"'
contains 'href="https://tramites.example.org/consulta"'
contains 'Lunes de 08:00 a 12:00'
mutate portal "$desk_custom" unpublish 2 --data-urlencode 'reason=Restaurar la guía publicada'
expect 200 /mesa-partes
contains 'Resumen Guía de trámites de prueba'

save 201 portal 0 0 '' bloque-noticias --form-string 'titulo=Actualidad escolar' \
  --form-string 'visible=no' --form-string 'orden=10' --form-string 'cantidad=3'
news_block=$(id_saved)
expect 200 /
contains 'Noticias recientes'
mutate portal "$news_block" publish 1
expect 200 /
absent 'Noticias recientes'
contains 'Próximos eventos'
mutate portal "$news_block" unpublish 2 --data-urlencode 'reason=Restaurar portada de prueba'

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
expect 403 /admin/portal
expect 403 "/admin/portal/$gallery_custom/vista"
expect 404 "/tema.css?revision=$theme_revision"
expect 200 /admin/noticias
expect 403 "/admin/noticias/$news/publish" --data-urlencode "_csrf=$csrf" --data 'version=9'
expect 403 "/admin/noticias/$news/schedule" --data-urlencode "_csrf=$csrf" --data 'version=9&publish_at=2099-12-25T10:00'
expect 403 /admin/docentes/reordenar
sql "UPDATE accounts SET role='publisher',generation=generation+1 WHERE username='admin'" >/dev/null
expect 200 /admin/ingresar
csrf=$(sed -n 's/.*name="_csrf" value="\([a-f0-9]*\)".*/\1/p' "$response")
expect 303 /admin/ingresar --data-urlencode "_csrf=$csrf" --data-urlencode 'username=admin' --data-urlencode "password=$LOCAL_ADMIN_PASSWORD"
expect 200 /admin
csrf=$(sed -n 's/.*name="_csrf" value="\([a-f0-9]*\)".*/\1/p' "$response" | head -1)
mutate noticias "$news" schedule 9 --data-urlencode 'publish_at=2099-12-25T10:00'
mutate noticias "$news" cancel 10
mutate noticias "$news" publish 11
expect 200 /noticias/ejemplo
expect 403 "/admin/noticias/$news/trash" --data-urlencode "_csrf=$csrf" --data 'version=12&reason=Comprobar permiso'
expect 403 /admin/etiquetas --data-urlencode "_csrf=$csrf" --data 'action=archive&slug=cultura'
sql "UPDATE accounts SET enabled=false WHERE username='admin'" >/dev/null
expect 303 /admin
printf '%s comprobaciones HTTP y de estado correctas.\n' "$checks"
