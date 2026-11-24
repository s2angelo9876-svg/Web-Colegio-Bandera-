<?php
declare(strict_types=1);

require dirname(__DIR__) . '/src/bootstrap.php';
require dirname(__DIR__) . '/src/content.php';
require dirname(__DIR__) . '/src/security.php';
require dirname(__DIR__) . '/src/media.php';
require dirname(__DIR__) . '/src/taxonomy.php';

function demoMedia(string $filename): array
{
    if (basename($filename) !== $filename) {
        throw new RuntimeException('El nombre del material de muestra no es válido.');
    }
    $path = $filename === 'frontis_colegio.webp'
        ? dirname(__DIR__) . '/public/images/' . $filename
        : __DIR__ . '/media/' . $filename;
    if (!is_readable($path)) {
        throw new RuntimeException("Falta el archivo de muestra $filename.");
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($path);
    if ($mime === 'application/pdf') {
        verifyPdf($path);
        return [$mime, $filename, bin2hex(file_get_contents($path)), null, null, null];
    }
    if ($mime !== 'image/webp') {
        throw new RuntimeException("Formato de muestra no admitido en $filename.");
    }
    $image = processImage($path, $mime);
    if (str_starts_with($filename, 'perfil-demo-')) {
        $image[1] = $filename;
    }
    return $image;
}

function demoRevision(int $id, array $entry, array $fields, string $created, array &$mediaIds): int
{
    $revision = (int) query('INSERT INTO revisions (content_id,title,summary,body,fields,created_at)
                            VALUES (?,?,?,?,?,?) RETURNING id',
        [$id, $entry['title'], $entry['summary'], sanitize($entry['body'] ?? ''),
            json_encode((object) $fields, JSON_THROW_ON_ERROR), $created])->fetchColumn();

    foreach ($entry['tags'] ?? [] as $tag) {
        query('INSERT INTO revision_tags VALUES (?,?) ON CONFLICT DO NOTHING',
            [$revision, activeTag($tag, tagSlug($tag))]);
    }
    if (isset($entry['media'])) {
        $filename = $entry['media'];
        $mediaIds[$filename] ??= query("INSERT INTO media (mime,filename,bytes,width,height,thumbnail)
                                       VALUES (?,?,decode(?,'hex'),?,?,decode(?,'hex')) RETURNING id",
            demoMedia($filename))->fetchColumn();
        query('INSERT INTO revision_media VALUES (?,?)', [$revision, $mediaIds[$filename]]);
    }
    return $revision;
}

function upgradeDemoProfiles(array $catalog, string $created): int
{
    $updated = 0;
    $mediaIds = [];
    foreach ($catalog as $entry) {
        if (!in_array($entry['module'], ['directivos','docentes'], true)
                || !str_starts_with($entry['media'] ?? '', 'perfil-demo-')) {
            continue;
        }
        $id = (int) query("SELECT c.id FROM content c WHERE c.module=? AND c.slug=? AND c.version=1
                            AND c.deleted_at IS NULL AND c.scheduled IS NULL AND c.working=c.published
                            AND NOT EXISTS (SELECT 1 FROM revision_media WHERE revision_id=c.published)
                            AND EXISTS (SELECT 1 FROM editorial_events e WHERE e.content_id=c.id
                                        AND e.revision_id=c.published AND e.action='publish'
                                        AND e.reason='Carga de demostración')",
            [$entry['module'], $entry['slug']])->fetchColumn();
        if (!$id) {
            continue;
        }
        $revision = demoRevision($id, $entry, $entry['fields'], $created, $mediaIds);
        requirePublishable($entry['module'], $revision);
        query('UPDATE content SET working=?,published=?,version=version+1 WHERE id=?', [$revision, $revision, $id]);
        query("INSERT INTO editorial_events (content_id,action,revision_id,reason) VALUES (?,'publish',?,?)",
            [$id, $revision, 'Actualización de perfiles de demostración']);
        $updated++;
    }
    return $updated;
}

try {
    $catalog = json_decode(file_get_contents(__DIR__ . '/content.json'), true, 512, JSON_THROW_ON_ERROR);
    $now = new DateTimeImmutable('now', new DateTimeZone('America/Lima'));
    [$count, $updated] = transaction(static function () use ($catalog, $now): array {
        // Serialize seeding and profile upgrades with editorial writes.
        query('LOCK TABLE content IN SHARE ROW EXCLUSIVE MODE');
        if (query('SELECT EXISTS (SELECT 1 FROM content)')->fetchColumn()) {
            return [0, upgradeDemoProfiles($catalog, $now->format(DateTimeInterface::ATOM))];
        }

        $mediaIds = [];
        foreach ($catalog as $position => $entry) {
            $module = $entry['module'];
            $slug = $entry['slug'];
            if (!isset(modules()[$module]) || !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', $slug)) {
                throw new RuntimeException("Revisa la sección y URL de $slug.");
            }
            $fields = $entry['fields'] ?? [];
            if (isset($entry['activity_offset'])) {
                $dateField = $module === 'galeria' ? 'fecha_galeria' : 'fecha';
                $fields[$dateField] = $now->modify($entry['activity_offset'] . ' days')->format('Y-m-d');
            }

            $created = $now->modify('-' . ($entry['days_ago'] ?? 0) . ' days')->format(DateTimeInterface::ATOM);
            $id = (int) query('INSERT INTO content (module,slug,position) VALUES (?,?,?) RETURNING id',
                [$module, $slug, $position])->fetchColumn();
            $revision = demoRevision($id, $entry, $fields, $created, $mediaIds);

            $state = $entry['state'] ?? 'published';
            if ($state !== 'draft') {
                requirePublishable($module, $revision);
            }
            [$published, $publishedAt, $scheduled, $publishAt, $action] = match ($state) {
                'published' => [$revision, $created, null, null, 'publish'],
                'draft' => [null, null, null, null, 'save'],
                'scheduled' => [null, null, $revision, $now->modify('+2 days')->format(DateTimeInterface::ATOM), 'schedule'],
            };
            query('UPDATE content SET working=?,published=?,published_at=?,scheduled=?,publish_at=?,version=1 WHERE id=?',
                [$revision, $published, $publishedAt, $scheduled, $publishAt, $id]);
            query('INSERT INTO editorial_events (content_id,action,revision_id,happened_at,reason) VALUES (?,?,?,?,?)',
                [$id, $action, $revision, $created, 'Carga de demostración']);
        }
        return [count($catalog), 0];
    });
    echo match (true) {
        $count > 0 => "Contenido de muestra cargado. $count registros.\n",
        $updated > 0 => "Perfiles de demostración actualizados. $updated registros.\n",
        default => "La base ya contiene registros editoriales. Se conservó el contenido.\n",
    };
} catch (Throwable $error) {
    fwrite(STDERR, 'No se pudo cargar el contenido de muestra. ' . $error->getMessage() . PHP_EOL);
    exit(1);
}
