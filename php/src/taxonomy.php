<?php
declare(strict_types=1);

function editorialSlug(string $value): string
{
    return (string) query('SELECT editorial_slug(?)', [$value])->fetchColumn();
}

function tagSlug(string $name): string
{
    $slug = editorialSlug($name);
    return $slug !== '' ? $slug : 'etiqueta-' . md5($name);
}

function activeTag(string $name, string $slug): string
{
    $known = query("SELECT name,archived_at FROM tags
                    WHERE slug=? OR name=? OR (editorial_slug(name)=? AND editorial_slug(name)<>'')
                    ORDER BY (slug=?) DESC LIMIT 1 FOR KEY SHARE", [$slug,$name,$slug,$slug])->fetch(PDO::FETCH_ASSOC);
    if ($known) {
        if ($known['archived_at']) {
            fail(422, 'Una de las etiquetas está archivada.', 'tags');
        }
        return $known['name'];
    }
    $canonical = query("INSERT INTO tags (name,slug) VALUES (?,?)
        ON CONFLICT (slug) DO UPDATE SET slug=EXCLUDED.slug WHERE tags.archived_at IS NULL RETURNING name",
        [$name,$slug])->fetchColumn();
    if ($canonical === false) {
        fail(422, 'Una de las etiquetas está archivada.', 'tags');
    }
    return $canonical;
}

function tagCatalog(bool $admin = false): array
{
    $having = $admin ? '' : 'HAVING t.archived_at IS NULL AND count(c.id)>0';
    return query("SELECT t.name,t.slug,t.archived_at,count(c.id) AS public_count FROM tags t
                  LEFT JOIN revision_tags rt ON rt.tag=t.name
                  LEFT JOIN content c ON c.module='noticias' AND c.deleted_at IS NULL
                    AND (" . visibleRevision() . ")=rt.revision_id
                  GROUP BY t.name,t.slug,t.archived_at $having ORDER BY t.name")->fetchAll(PDO::FETCH_ASSOC);
}

function changeTag(string $action, int $actor): void
{
    $slug = field('slug', 80);
    $name = field('name', 50);
    try {
        $count = match ($action) {
            'save' => $name === '' ? fail(422, 'Escribe el nombre de la etiqueta.', 'name')
                : query('INSERT INTO tags (name,slug) VALUES (?,?) ON CONFLICT DO NOTHING', [$name,tagSlug($name)])->rowCount(),
            'rename' => $name === '' ? fail(422, 'Escribe el nombre de la etiqueta.', 'name')
                : query('UPDATE tags SET name=? WHERE slug=? AND archived_at IS NULL
                         AND NOT EXISTS (SELECT 1 FROM tags other WHERE other.slug=? AND other.slug<>?)',
                    [$name,$slug,tagSlug($name),$slug])->rowCount(),
            'archive' => query('UPDATE tags SET archived_at=now() WHERE slug=? AND archived_at IS NULL', [$slug])->rowCount(),
            'restore' => query('UPDATE tags SET archived_at=NULL WHERE slug=? AND archived_at IS NOT NULL', [$slug])->rowCount(),
            default => fail(404, 'Acción de etiqueta desconocida.'),
        };
    } catch (PDOException $error) {
        if ($error->getCode() === '23505') {
            fail(409, 'La etiqueta ya existe.', 'name');
        }
        throw $error;
    }
    if (!$count) {
        fail(409, 'La etiqueta ya existe o cambió de estado.');
    }
    logEvent('tag_' . $action, ['account_id'=>$actor]);
}
