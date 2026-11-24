<?php
declare(strict_types=1);

function publishDue(): int
{
    return query("WITH due_ids AS (
        SELECT id FROM content WHERE deleted_at IS NULL AND scheduled IS NOT NULL AND publish_at<=now()
        ORDER BY publish_at,id LIMIT 100 FOR UPDATE SKIP LOCKED
      ), due AS (
        UPDATE content c SET published=c.scheduled,published_at=c.publish_at,
          scheduled=NULL,publish_at=NULL,version=c.version+1
        FROM due_ids d WHERE c.id=d.id RETURNING c.id,c.published
      ) INSERT INTO editorial_events (content_id,action,revision_id)
        SELECT id,'publish-due',published FROM due")->rowCount();
}

function visibleRevision(): string
{
    return 'CASE WHEN c.publish_at <= now() THEN c.scheduled ELSE c.published END';
}

function visibleDate(): string
{
    return 'CASE WHEN c.publish_at <= now() THEN c.publish_at ELSE c.published_at END';
}

function published(?string $module, string $search = '', string $tag = '', ?string $slug = null, int $limit = 24, int $offset = 0, array $filters = []): array
{
    $where = ['c.deleted_at IS NULL'];
    $params = [];
    if ($module !== null) {
        $where[] = 'c.module=?';
        $params[] = $module;
    } else {
        $where[] = "c.module NOT IN ('inicio','carrusel','portal')";
    }
    if ($slug !== null) {
        $where[] = 'c.slug=?';
        $params[] = $slug;
    }
    if ($search !== '') {
        $where[] = "to_tsvector('spanish',r.title||' '||r.summary||' '||regexp_replace(r.body,'<[^>]+>',' ','g')) @@ plainto_tsquery('spanish',?)";
        $params[] = $search;
    }
    if ($tag !== '') {
        $where[] = 'EXISTS (SELECT 1 FROM revision_tags rt JOIN tags t ON t.name=rt.tag
                            WHERE rt.revision_id=r.id AND t.archived_at IS NULL AND t.slug=?)';
        $params[] = tagSlug($tag);
    }
    if (($filters['tipo'] ?? '') === 'video') {
        $where[] = "coalesce(r.fields->>'video','') <> ''";
    }
    if (($filters['tipo'] ?? '') === 'foto') {
        $where[] = "coalesce(r.fields->>'video','') = '' AND rm.media_id IS NOT NULL";
    }
    $date = '(' . visibleDate() . ')';
    if (($filters['anio'] ?? '') !== '') {
        $year = $module === 'galeria' ? "left(r.fields->>'fecha_galeria',4)" : "to_char($date AT TIME ZONE 'America/Lima','YYYY')";
        $where[] = "$year=?";
        $params[] = $filters['anio'];
    }
    if (($filters['categoria'] ?? '') !== '') {
        $where[] = "editorial_slug(r.fields->>'categoria')=editorial_slug(?)";
        $params[] = $filters['categoria'];
    }
    if (($filters['aviso'] ?? '') !== '') {
        $where[] = "coalesce(nullif(r.fields->>'tipo',''),'general')=?";
        $params[] = $filters['aviso'];
    }
    $order = 'c.position,c.id DESC';
    if ($module === 'eventos' && $slug === null) {
        $eventDate = "left(r.fields->>'fecha',10)";
        $today = "to_char(now() AT TIME ZONE 'America/Lima','YYYY-MM-DD')";
        $past = ($filters['periodo'] ?? '') === 'anteriores';
        if (($filters['mes'] ?? '') !== '') {
            $where[] = "left(r.fields->>'fecha',7)=?";
            $params[] = $filters['mes'];
        } else {
            $where[] = $past ? "$eventDate<$today" : "$eventDate>=$today";
        }
        $order = $past ? "$eventDate DESC,c.id DESC" : "$eventDate,r.fields->>'fecha',r.fields->>'hora',c.id DESC";
    }
    if (in_array($module, ['noticias','comunicados','documentos'], true)) {
        $order = "$date DESC NULLS LAST,c.id DESC";
    }
    return query('SELECT c.module,c.slug,r.*,rm.media_id,m.mime AS media_mime,m.filename AS media_filename,m.width,m.height,
                    m.thumbnail IS NOT NULL AS has_thumbnail,octet_length(m.bytes) AS size_bytes,' . $date . ' AS publication_date
                  FROM content c JOIN revisions r ON r.id=(' . visibleRevision() . ')
                  LEFT JOIN revision_media rm ON rm.revision_id=r.id LEFT JOIN media m ON m.id=rm.media_id WHERE ' .
        implode(' AND ', $where) . " ORDER BY $order LIMIT ? OFFSET ?", [...$params, $limit, $offset])->fetchAll(PDO::FETCH_ASSOC);
}

function editorRow(string $module, int $id): array
{
    return query("SELECT c.*,r.title,r.summary,r.body,r.fields,rm.media_id,c.publish_at>now() AS future,(" . visibleRevision() . ") AS effective_published,
                  (SELECT string_agg(rt.tag,', ' ORDER BY rt.tag) FROM revision_tags rt JOIN tags t ON t.name=rt.tag
                   WHERE rt.revision_id=r.id AND t.archived_at IS NULL) AS tags
                  FROM content c LEFT JOIN revisions r ON r.id=c.working
                  LEFT JOIN revision_media rm ON rm.revision_id=r.id WHERE c.module=? AND c.id=?",
        [$module, $id])->fetch(PDO::FETCH_ASSOC) ?: fail(404, 'Contenido no encontrado.');
}

function saveRevision(string $module, int $id, array $session): array
{
    $slug = field('slug', 120);
    $portal = $module === 'portal' ? (portalCatalog()[$slug] ?? fail(422, 'Selecciona una sección del portal.', 'slug')) : null;
    $title = $portal ? $portal['name'] : field('title', 255);
    $summary = $portal ? '' : field('summary', 1000);
    $body = $portal ? '' : sanitize(field('body', 120000));
    $limit = match ($module) {'comunicados'=>10000,'eventos'=>5000,default=>50000};
    if (mb_strlen(bodyText($body), 'UTF-8') > $limit) {
        fail(422, "El contenido admite hasta $limit caracteres visibles.", 'body');
    }
    $version = field('version', 12);
    if (preg_match('/^[\s\p{Z}\p{Cf}]*$/u', $title)) {
        $message = in_array($module, ['directivos','docentes'], true) ? 'Escribe el nombre completo.' : 'Escribe un título.';
        fail(422, $message, 'title');
    }
    if ($id === 0 && $slug === '') {
        $slug = rtrim(substr(editorialSlug($title), 0, 120), '-');
    }
    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', $slug)) {
        fail(422, 'Escribe una URL con letras minúsculas, números o guiones.', 'slug');
    }
    if (!ctype_digit($version)) {
        fail(422, 'La versión de edición no es válida. Recarga el formulario.', 'version');
    }
    [, $labels, $kind] = modules()[$module];
    $fields = $portal ? portalReadFields($slug, $_POST) : [];
    foreach ($labels as $key => $label) {
        $maximum = isUrlField($key) ? 500 : ($key === 'correo' ? 254 : 255);
        $value = field($key, $maximum);
        if ($value !== '' && ((isUrlField($key) && !httpsUrl($value))
                || ($key === 'correo' && !filter_var($value, FILTER_VALIDATE_EMAIL)))) {
            fail(422, 'Revisa ' . $label . '.', $key);
        }
        $fields[$key] = $value;
    }
    $fields['alt'] = field('alt', 200);
    if ($module === 'comunicados') {
        $fields['tipo'] = $fields['tipo'] ?: 'general';
        if (!isset(communicationTypes()[$fields['tipo']])) {
            fail(422, 'Selecciona un tipo de comunicado válido.', 'tipo');
        }
    }
    if ($module === 'eventos' && $fields['fecha'] !== '') {
        // Older clients saved the date and time in a single input.
        if (str_contains($fields['fecha'], 'T') && $fields['hora'] === '') {
            [$fields['fecha'],$fields['hora']] = explode('T', $fields['fecha'], 2);
        }
        validateDate($fields['fecha'], 'fecha');
    }
    if (!empty($fields['hora']) && !preg_match('/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/D', $fields['hora'])) {
        fail(422, 'Revisa la hora del evento.', 'hora');
    }
    if (!$portal) {
        foreach ($fields as $key=>$value) {
            if ($value !== '' && ($key === 'fecha_galeria' || str_ends_with($key, '_fecha'))) {
                validateDate($value, $key);
            }
        }
    }
    if ($module === 'inicio') {
        if (!in_array($fields['hero_modo'], ['','foto','carrusel'], true)) {
            fail(422, 'Selecciona un modo de portada válido.', 'hero_modo');
        }
        if ($fields['telefono'] !== '' && !preg_match('/^[+0-9(). -]{5,24}$/D', $fields['telefono'])) {
            fail(422, 'Revisa el formato del teléfono institucional.', 'telefono');
        }
    }
    $tags = $module === 'noticias'
        ? array_values(array_unique(array_filter(array_map('trim', explode(',', field('tags', 650))), fn(string $t) => $t !== '')))
        : [];
    if (count($tags) > 12 || array_filter($tags, fn(string $t) => mb_strlen($t, 'UTF-8') > 50)) {
        fail(422, 'Usa hasta 12 etiquetas de 50 caracteres cada una.', 'tags');
    }
    $canonicalTags = [];
    foreach ($tags as $tag) {
        $canonicalTags[tagSlug($tag)] ??= $tag;
    }
    ksort($canonicalTags, SORT_STRING);
    $media = !$portal || $portal['image'] !== '' ? upload($kind) : null;
    $removeMedia = ($_POST['remove_media'] ?? '') === '1';
    try {
        return transaction(function () use ($module, $id, $session, $title, $slug, $summary, $body, $fields, $canonicalTags, $media, $removeMedia, $version): array {
            if ($id === 0) {
                lockOrder($module);
                $id = (int) query('INSERT INTO content (module,slug) VALUES (?,?) RETURNING id', [$module,$slug])->fetchColumn();
            }
            $content = query('SELECT * FROM content WHERE module=? AND id=? FOR UPDATE', [$module,$id])->fetch(PDO::FETCH_ASSOC);
            if (!$content || $content['deleted_at']) {
                fail(404, 'Contenido no encontrado.');
            }
            if ((int) $content['version'] !== (int) $version || $content['slug'] !== $slug) {
                fail(409, 'La edición cambió o la URL ya quedó fijada. Recarga antes de continuar.');
            }
            $revision = query('INSERT INTO revisions (content_id,author,title,summary,body,fields) VALUES (?,?,?,?,?,?) RETURNING id',
                [$id,$session['id'],$title,$summary,$body,json_encode($fields, JSON_THROW_ON_ERROR)])->fetchColumn();
            foreach ($canonicalTags as $normalized=>$tag) {
                query('INSERT INTO revision_tags VALUES (?,?) ON CONFLICT DO NOTHING',
                    [$revision,activeTag($tag, (string) $normalized)]);
            }
            if ($media !== null) {
                $mediaId = query("INSERT INTO media (mime,filename,bytes,width,height,thumbnail)
                                       VALUES (?,?,decode(?,'hex'),?,?,decode(?,'hex')) RETURNING id", $media)->fetchColumn();
                query('INSERT INTO revision_media VALUES (?,?)', [$revision,$mediaId]);
            } elseif (!$removeMedia && $content['working']) {
                query('INSERT INTO revision_media SELECT ?,media_id FROM revision_media WHERE revision_id=?', [$revision,$content['working']]);
            }
            recordEditorialEvent($id, (int) $session['id'], 'save', (int) $revision);
            $newVersion = query('UPDATE content SET working=?,version=version+1 WHERE id=? RETURNING version', [$revision,$id])->fetchColumn();
            return ['id' => (int) $id, 'version' => (int) $newVersion];
        });
    } catch (PDOException $error) {
        if ($error->getCode() === '23505') {
            fail(409, 'Ya existe contenido con esa URL.');
        }
        throw $error;
    }
}

function recordEditorialEvent(int $id, int $actor, string $action, int $revision, ?string $reason = null): void
{
    query('INSERT INTO editorial_events (content_id,actor_id,action,revision_id,reason) VALUES (?,?,?,?,?)',
        [$id,$actor,$action,$revision,$reason]);
}

function requirePublishable(string $module, int $revision): void
{
    $row = query('SELECT r.fields,r.body,m.mime FROM revisions r LEFT JOIN revision_media rm ON rm.revision_id=r.id
                  LEFT JOIN media m ON m.id=rm.media_id WHERE r.id=?', [$revision])->fetch(PDO::FETCH_ASSOC);
    $fields = json_decode($row['fields'], true);
    if ($module === 'inicio') {
        for ($i=1; $i<=4; $i++) {
            $keys = ["metrica{$i}_valor","metrica{$i}_etiqueta","metrica{$i}_fecha","metrica{$i}_fuente"];
            $present = array_filter($keys, fn(string $key) => ($fields[$key] ?? '') !== '');
            if ($present && count($present) !== count($keys)) {
                fail(422,'Completa valor, descripción, fecha y fuente de la cifra.', $keys[0]);
            }
        }
    }
    [$field, $problem] = match (true) {
        in_array($module, ['noticias','comunicados'], true) && bodyText($row['body']) === ''
            => ['body','Escribe contenido visible antes de publicar.'],
        $module === 'documentos' && $row['mime'] !== 'application/pdf'
            => ['media','Adjunta un PDF al documento.'],
        $module === 'documentos' && empty($fields['categoria'])
            => ['categoria','Indica la categoría del documento.'],
        $module === 'eventos' && empty($fields['fecha'])
            => ['fecha','Indica la fecha del evento.'],
        $module === 'galeria' && !$row['mime'] && empty($fields['video'])
            => ['media','Añade una foto o un enlace de video.'],
        $module === 'carrusel' && !$row['mime'] => ['media','Adjunta una imagen para el carrusel.'],
        $module === 'institucion' && bodyText($row['body']) === ''
            => ['body','Describe el contenido institucional y proporciona una alternativa textual si adjuntas un organigrama.'],
        $module === 'inicio' && empty($fields['acceso_texto']) !== empty($fields['acceso_url'])
            => ['acceso_texto','Completa el texto y enlace del acceso rápido.'],
        default => [null,''],
    };
    if ($problem !== '') {
        fail(422, $problem, $field);
    }
}

function bodyText(string $html): string
{
    $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    return preg_replace('/^[\s\p{Z}\p{Cf}]+|[\s\p{Z}\p{Cf}]+$/u', '', $text) ?? '';
}

function validateDate(string $value, string $field): void
{
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
    if (!$date || $date->format('Y-m-d') !== $value) {
        fail(422, 'Indica una fecha válida.', $field);
    }
}

function changeContent(string $module, int $id, string $action, int $actor): void
{
    $version = field('version', 12);
    if (!ctype_digit($version)) {
        fail(422, 'Falta la versión.');
    }
    $args = [];
    $set = match ($action) {
        'publish' => 'published=working, published_at=now(), scheduled=NULL, publish_at=NULL',
        'unpublish' => 'published=NULL, published_at=NULL, scheduled=NULL, publish_at=NULL',
        'cancel' => 'scheduled=NULL, publish_at=NULL',
        'trash' => 'deleted_at=now(), scheduled=NULL, publish_at=NULL',
        'restore' => 'deleted_at=NULL, published=NULL, published_at=NULL',
        'schedule' => 'published=CASE WHEN publish_at<=now() THEN scheduled ELSE published END,
                       published_at=CASE WHEN publish_at<=now() THEN publish_at ELSE published_at END,
                       scheduled=working, publish_at=?',
        default => fail(404, 'Acción desconocida.'),
    };
    $reason = null;
    if (in_array($action, ['unpublish','trash'], true)) {
        $reason = field('reason', 255);
        if ($reason === '') {
            fail(422, 'Indica el motivo para dejar constancia editorial.', 'reason');
        }
    }
    if ($action === 'schedule') {
        $date = field('publish_at', 20);
        $zone = new DateTimeZone('America/Lima');
        $when = DateTimeImmutable::createFromFormat('!Y-m-d\TH:i', $date, $zone);
        if (!$when || $when->format('Y-m-d\TH:i') !== $date || $when <= new DateTimeImmutable()) {
            fail(422, 'Selecciona una fecha futura en hora de Lima.', 'publish_at');
        }
        $args[] = $when->format(DateTimeInterface::ATOM);
    }
    transaction(function () use ($module, $id, $action, $actor, $version, $set, $args, $reason): void {
        if (in_array($action, ['trash','restore'], true)) {
            lockOrder($module);
        }
        $deleted = $action === 'restore' ? 'IS NOT NULL' : 'IS NULL';
        $row = query("SELECT working,version,scheduled,publish_at>now() AS future FROM content
                      WHERE module=? AND id=? AND deleted_at $deleted AND working IS NOT NULL FOR UPDATE",
            [$module,$id])->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            fail(404, 'Contenido no encontrado.');
        }
        if ((int) $row['version'] !== (int) $version || ($action === 'cancel' && !$row['future'])) {
            fail(409, 'El estado cambió. Recarga antes de continuar.');
        }
        $revision = $action === 'cancel' ? $row['scheduled'] : $row['working'];
        if (in_array($action, ['publish','schedule'], true)) {
            requirePublishable($module, (int) $revision);
        }
        query("UPDATE content SET $set, version=version+1 WHERE id=?", [...$args,$id]);
        recordEditorialEvent($id, $actor, $action, (int) $revision, $reason);
    });
}

function lockOrder(string $module): void
{
    if (orderable($module)) {
        query('SELECT pg_advisory_xact_lock(hashtextextended(?,17142))', [$module]);
    }
}

function orderRows(string $module, bool $lock = false): array
{
    return query('SELECT c.id,c.position,c.version,c.working,r.title FROM content c JOIN revisions r ON r.id=c.working
                 WHERE c.module=? AND c.deleted_at IS NULL ORDER BY c.position,c.id DESC' . ($lock ? ' FOR UPDATE OF c' : ''),
        [$module])->fetchAll(PDO::FETCH_ASSOC);
}

function orderVersion(array $rows): string
{
    return hash('sha256', json_encode(array_map(fn(array $row) => [$row['id'],$row['version']], $rows), JSON_THROW_ON_ERROR));
}

function saveOrder(string $module, int $actor): void
{
    $positions = $_POST['positions'] ?? null;
    if (($_POST['complete'] ?? '') !== '1' || !is_array($positions)) {
        fail(422, 'Envía el orden completo del módulo.');
    }
    transaction(function () use ($module, $actor, $positions): void {
        lockOrder($module);
        $rows = orderRows($module, true);
        if (!hash_equals(orderVersion($rows), field('version', 64))) {
            fail(409, 'El conjunto cambió. Vuelve a cargar el orden.');
        }
        if (count($rows) !== count($positions)) {
            fail(422, 'El orden debe incluir todos los elementos.');
        }
        $seen = [];
        foreach ($rows as $row) {
            $provided = $positions[$row['id']] ?? null;
            $position = filter_var($provided, FILTER_VALIDATE_INT, ['options'=>['min_range'=>1,'max_range'=>count($rows)]]);
            if (!is_string($provided) || $position === false || isset($seen[$position])) {
                fail(422, 'Asigna posiciones únicas y consecutivas a todo el conjunto.');
            }
            $seen[$position] = true;
            if ($position !== (int) $row['position']) {
                query('UPDATE content SET position=?,version=version+1 WHERE id=?', [$position,$row['id']]);
                recordEditorialEvent((int) $row['id'], $actor, 'order', (int) $row['working']);
            }
        }
    });
}
