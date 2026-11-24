<?php
declare(strict_types=1);

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
$method = $_SERVER['REQUEST_METHOD'];
if (PHP_SAPI === 'cli-server' && getenv('COLEGIO_ENV') !== 'production'
    && in_array($path, [
        '/site.css','/navigation.css','/site-start.js','/site.js','/assets/manrope.woff2','/assets/symbols.woff2',
        '/images/escudo.jpeg','/images/frontis_colegio.webp','/images/frontis_colegio-640.webp',
        '/images/institucion/identidad.webp','/images/institucion/academica.webp',
        '/images/institucion/gestion.webp','/images/institucion/tecnologia.webp',
    ], true)
    && in_array($method, ['GET','HEAD'], true)) {
    return false;
}
require dirname(__DIR__) . '/src/bootstrap.php';
require dirname(__DIR__) . '/src/security.php';
require dirname(__DIR__) . '/src/content.php';
require dirname(__DIR__) . '/src/media.php';
require dirname(__DIR__) . '/src/taxonomy.php';
require dirname(__DIR__) . '/src/views.php';

header('Content-Security-Policy: default-src \'self\'; object-src \'none\'; frame-src https://www.youtube-nocookie.com; frame-ancestors \'none\'; base-uri \'none\'; form-action \'self\'');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Cache-Control: no-store');
header('Content-Type: text/html; charset=utf-8');
header('X-Request-Id: ' . requestId());
$json = ($_SERVER['HTTP_ACCEPT'] ?? '') === 'application/json';
ob_start();

try {
    if (getenv('COLEGIO_ENV') === 'production') {
        if (configuredOrigin() === '') {
            fail(503, 'El origen HTTPS del portal no está configurado.');
        }
        if (($_SERVER['HTTPS'] ?? '') !== 'on') {
            fail(400, 'Esta solicitud requiere HTTPS.');
        }
    }
    if (!in_array($method, ['GET','POST','HEAD'], true)) {
        header('Allow: GET, HEAD, POST');
        fail(405, 'Método no admitido.');
    }
    $read = $method !== 'POST';
    if ($path === '/health/live' || $path === '/health/ready') {
        requireMethod($read, true);
        health($path === '/health/ready', $method);
    }
    if (!$read && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 16 * 1024 * 1024) {
        fail(413, 'La solicitud supera el tamaño permitido.');
    }
    $protected = $path === '/admin' || str_starts_with($path, '/admin/') || $path === '/salir'
        || (str_starts_with($path, '/medio/') && isset($_GET['revision']));
    $session = $protected ? currentSession() : [];
    if ($path === '/salir' || $path === '/admin/salir') {
        requireMethod($read, false);
        if (!isset($session['id'])) {
            fail(401, 'Inicia sesión para continuar.');
        }
        csrf($session);
        query('DELETE FROM sessions WHERE token_hash=?', [$session['token_hash']]);
        sessionCookie('', 1);
        logEvent('logout', ['account_id' => (int) $session['id']]);
        redirect('/admin/ingresar');
    }
    if ($path === '/admin/ingresar') {
        header('X-Robots-Tag: noindex, nofollow');
        if (!$read) {
            loginAccount($session);
        }
        if (isset($session['id'])) {
            redirect('/admin');
        }
        if (!$session && $method === 'GET') {
            throttle('login-session', 30);
            $anonymous = session();
            sessionCookie($anonymous, time() + INACTIVITY_MINUTES * 60);
            $session = currentSession($anonymous);
        }
        layout('Ingresar', function () use ($session): void {
            ?><div class="login-layout">
              <div class="login-photo" aria-hidden="true"><img src="/images/frontis_colegio.webp" alt="" width="1360" height="1020"></div>
              <section class="login-panel feature-panel">
                <div class="quick-icon"><?=uiIcon('lock')?></div>
                <h1>Ingresar a la administración</h1>
                <form method="post" class="editor"><?= $session ? token($session) : '' ?>
                  <label>Usuario <input name="username" autocomplete="username" required></label>
                  <label>Contraseña <input name="password" type="password" autocomplete="current-password" required></label>
                  <button class="primary">Ingresar <?=uiIcon('arrow_forward')?></button>
                </form>
                <a class="section-link" href="/"><?=uiIcon('arrow_back')?> Volver al portal</a>
              </section>
            </div><?php
        }, current: 'acceso');
    } elseif ($path === '/admin' || str_starts_with($path, '/admin/')) {
        header('X-Robots-Tag: noindex, nofollow');
        if (!isset($session['id'])) {
            if ($read && !$json) {
                redirect('/admin/ingresar');
            }
            fail(401, 'Inicia sesión para continuar.');
        }
        if ($path === '/admin') {
            requireMethod($read, true);
            layout('Panel', function () use ($session): void {
                ?><div class="page-heading"><h1>Panel de contenidos</h1>
                  <p>Gestiona las publicaciones y la información del portal institucional.</p></div>
                <ul class="dashboard-grid"><?php foreach (modules() as $key=>[$title]):
                    if (!allowed($session,$key,'list')) continue; ?>
                    <li><a href="/admin/<?=e($key)?>"><span class="quick-icon"><?=uiIcon(moduleIcon($key))?></span>
                        <strong><?=e($title)?></strong><?=uiIcon('arrow_outward')?></a></li>
                <?php endforeach ?></ul><?php
            }, $session, current: 'panel');
        } else {
            adminRoute($path, $read, $session, $json);
        }
    } else {
        requireMethod($read, true);
        publicRoute($path, $session);
    }
    if ($method === 'HEAD') {
        ob_end_clean();
    } else {
        ob_end_flush();
    }
} catch (Throwable $error) {
    ob_end_clean();
    $status = $error instanceof HttpError ? $error->getCode() : 500;
    $message = $error instanceof HttpError ? $error->getMessage() : 'Ocurrió un error al procesar la solicitud.';
    if ($status >= 500) {
        logEvent('request_failed', ['status'=>$status,'kind'=>get_class($error),'code'=>(string) $error->getCode()]);
    }
    http_response_code($status);
    if ($method === 'HEAD') {
        return;
    }
    if ($json) {
        header('Content-Type: application/json; charset=utf-8');
        $fields = $error instanceof HttpError && $error->field !== null ? [$error->field=>$message] : [];
        echo json_encode(['error'=>['code'=>$status,'message'=>$message,'fields'=>(object) $fields],
            'meta'=>['request_id'=>requestId()]], JSON_THROW_ON_ERROR);
    } else {
        $title = match ($status) {
            401 => 'Inicia sesión para continuar',
            403 => 'Acceso restringido',
            404 => 'Página no encontrada',
            405 => 'Acción no disponible',
            429 => 'Inténtalo más tarde',
            default => 'No se pudo completar la solicitud',
        };
        layout($title, function () use ($status, $message, $path, $title): void {
            $login = str_starts_with($path, '/admin/') && in_array($status, [401,403], true);
            ?><section class="state-page">
                <span class="empty-icon"><?=uiIcon($login ? 'lock' : 'info')?></span>
                <h1><?=e($title)?></h1><p role="alert"><?=e($message)?></p>
                <a class="button secondary" href="<?= $login ? '/admin/ingresar' : '/' ?>">
                    <?=uiIcon('arrow_back')?> <?= $login ? 'Ingresar a la administración' : 'Volver al inicio' ?>
                </a>
                <?php if ($status >= 500): ?><small>Referencia para soporte <?=e(requestId())?>.</small><?php endif ?>
            </section><?php
        }, isset($session['id']) ? $session : null);
    }
}

function health(bool $checkDatabase, string $method): never
{
    $ready = true;
    if ($checkDatabase) {
        try {
            $applied = query('SELECT name FROM schema_migrations')->fetchAll(PDO::FETCH_COLUMN);
            $ready = !array_diff(migrationNames(), $applied)
                && (getenv('COLEGIO_ENV') !== 'production' || configuredOrigin() !== '');
        } catch (Throwable $error) {
            $ready = false;
            logEvent('readiness_failed', ['kind'=>get_class($error)]);
        }
    }
    http_response_code($ready ? 200 : 503);
    header('Content-Type: application/json; charset=utf-8');
    if ($method !== 'HEAD') {
        echo $ready ? '{"status":"ok"}' : '{"status":"unavailable"}';
    }
    exit;
}

function requireMethod(bool $read, bool $expected): void
{
    if ($read !== $expected) {
        header('Allow: ' . ($expected ? 'GET, HEAD' : 'POST'));
        fail(405, 'Método no admitido.');
    }
}

function adminRoute(string $path, bool $read, array $user, bool $json): void
{
    if ($path === '/admin/etiquetas') {
        adminTags($read, $user);
        return;
    }
    if (preg_match('~^/admin/([a-z]+)/reordenar$~D', $path, $match) && orderable($match[1])) {
        adminOrder($match[1], $read, $user);
        return;
    }
    if (!preg_match('~^/admin/([a-z]+)(?:/(nuevo|[0-9]{1,18})(?:/([a-z]+))?)?$~D', $path, $matches)
        || !isset(modules()[$matches[1]])) {
        fail(404, 'Sección no encontrada.');
    }
    [, $module] = $matches;
    $item = $matches[2] ?? '';
    $id = (int) $item;
    $route = $matches[3] ?? '';
    $action = match ($route) {
        '' => $item === '' ? 'list' : 'edit',
        'vista' => 'preview',
        'guardar' => 'save',
        'publish','unpublish','schedule','cancel','trash','restore' => $route,
        default => fail(404, 'Acción no encontrada.'),
    };
    requireMethod($read, in_array($action, ['list','edit','preview'], true));
    requireAccess($user, $module, $action);
    $base = '/admin/' . $module;
    $label = modules()[$module][0];
    if (!$read) {
        throttle('mutate:' . $user['id'], 180);
        csrf($user);
        if ($action === 'save') {
            try {
                $saved = saveRevision($module, $id, $user);
            } catch (HttpError $error) {
                if ($json || !in_array($error->getCode(), [409,413,415,422], true)) {
                    throw $error;
                }
                $row = $id ? editorRow($module, $id) : [];
                $fields = json_decode($row['fields'] ?? '{}', true);
                foreach ([...array_keys(modules()[$module][1]), 'alt'] as $key) {
                    $fields[$key] = is_string($_POST[$key] ?? null) ? $_POST[$key] : '';
                }
                foreach (['title','slug','summary','body','tags'] as $key) {
                    if (is_string($_POST[$key] ?? null) && ($key !== 'slug' || !$id)) {
                        $row[$key] = $_POST[$key];
                    }
                }
                $row['fields'] = json_encode($fields, JSON_INVALID_UTF8_SUBSTITUTE);
                // The failed attempt still belongs to the submitted base revision.
                $row['version'] = is_string($_POST['version'] ?? null) ? $_POST['version'] : '';
                $row['remove_media'] = ($_POST['remove_media'] ?? '') === '1';
                http_response_code($error->getCode());
                layout($label, fn() => editForm($module, $id, $row, $user, $error), $user, current: $module);
                return;
            }
            if ($json) {
                http_response_code($id === 0 ? 201 : 200);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode(['data'=>$saved,'meta'=>['request_id'=>requestId()]], JSON_THROW_ON_ERROR);
                return;
            }
            redirect($base . '/' . $saved['id'] . '?guardado=1');
        }
        try {
            changeContent($module, $id, $action, (int) $user['id']);
        } catch (HttpError $error) {
            if ($json || !in_array($error->getCode(), [409,422], true)) {
                throw $error;
            }
            $row = editorRow($module, $id);
            $row['version'] = is_string($_POST['version'] ?? null) ? $_POST['version'] : '';
            http_response_code($error->getCode());
            layout($label, fn() => editForm($module, $id, $row, $user, $error), $user, current: $module);
            return;
        }
        redirect($base . '/' . $id);
    }
    if ($action === 'list') {
        $page = pageNumber();
        $trash = ($_GET['papelera'] ?? '') === '1';
        $search = field('q', 200, $_GET);
        $state = field('estado', 12, $_GET);
        if (!in_array($state, ['', 'borrador', 'publicado', 'programado'], true)) {
            fail(422, 'Estado editorial desconocido.');
        }
        $visible = '(' . visibleRevision() . ')';
        $where = ['c.module=?', 'c.deleted_at ' . ($trash ? 'IS NOT NULL' : 'IS NULL')];
        $args = [$module];
        if ($search !== '') {
            $where[] = 'strpos(lower(r.title),lower(?))>0';
            $args[] = $search;
        }
        $stateFilter = match ($state) {
            'borrador' => "$visible IS NULL AND (c.publish_at IS NULL OR c.publish_at<=now())",
            'publicado' => "$visible IS NOT NULL",
            'programado' => 'c.publish_at>now()',
            default => '',
        };
        if (!$trash && $stateFilter !== '') {
            $where[] = $stateFilter;
        }
        $from = ' FROM content c JOIN revisions r ON r.id=c.working WHERE ' . implode(' AND ', $where);
        $total = (int) query('SELECT count(*)' . $from, $args)->fetchColumn();
        $rows = query("SELECT c.id,c.position,$visible AS visible,c.publish_at>now() AS future,r.title" . $from .
            ' ORDER BY c.position,c.id DESC LIMIT 20 OFFSET ?', [...$args, ($page-1)*20])->fetchAll(PDO::FETCH_ASSOC);
        layout($label, function () use ($base,$label,$rows,$trash,$module,$user,$total,$page,$search,$state): void {
            ?><div class="page-heading">
              <p class="breadcrumb"><a href="/admin">Panel</a><?=uiIcon('chevron_right')?> <?=e($label)?><?php if ($trash): ?> <?=uiIcon('chevron_right')?> Papelera<?php endif ?></p>
              <div class="heading-row"><div><h1><?= $trash ? 'Papelera de ' . e(mb_strtolower($label)) : e($label) ?></h1>
              <p><?=e($total)?> <?= $total === 1 ? 'entrada' : 'entradas' ?></p></div>
              <div class="listing-actions">
                <a class="button secondary" href="<?=e($base . ($trash ? '' : '?papelera=1'))?>"><?=uiIcon($trash ? 'arrow_back' : 'archive')?> <?= $trash ? 'Volver al listado' : 'Papelera' ?></a>
                <?php if (orderable($module) && allowed($user,$module,'order') && !$trash): ?>
                  <a class="button secondary" href="<?=e($base)?>/reordenar"><?=uiIcon('list')?> Reordenar todo</a>
                <?php endif ?>
                <?php if (!$trash): ?><a class="button" href="<?=e($base)?>/nuevo"><?=uiIcon('add')?> Nuevo</a><?php endif ?>
              </div></div>
            </div>
            <form method="get" class="catalog-filters">
                <?php if ($trash): ?><input type="hidden" name="papelera" value="1"><?php endif ?>
                <label class="search-field">Buscar por título <input name="q" type="search" maxlength="200" value="<?=e($search)?>"></label>
                <?php if (!$trash): ?><label>Estado
                  <?php selectOptions('estado', [''=>'Todos','borrador'=>'Borradores','publicado'=>'Publicados','programado'=>'Programados'], $state); ?>
                </label><?php endif ?>
                <button class="secondary"><?=uiIcon('filter_list')?> Filtrar</button>
            </form>
            <?php if (!$rows): emptyState('archive', $trash ? 'No hay entradas en papelera que coincidan.' : 'No hay entradas que coincidan.',
                $search !== '' || $state !== '' ? 'Prueba con otros filtros.' : 'Puedes crear una entrada desde este módulo.'); else: ?>
              <div class="records-panel">
                <div class="records-heading"><span>Título</span><span>Estado</span></div>
                <ul class="records"><?php foreach ($rows as $row): ?>
                  <li><span class="record-icon"><?=uiIcon(moduleIcon($module))?></span>
                    <a class="record-title" href="<?=e($base . '/' . $row['id'])?>"><?=e($row['title'])?></a>
                    <div class="record-state"><?php statusChip($trash ? 'En papelera' : ($row['visible'] ? 'Publicado' : ($row['future'] ? 'Programado' : 'Borrador')),
                        $trash ? 'alert' : ($row['visible'] ? 'success' : ($row['future'] ? 'planned' : ''))); ?>
                      <?php if ($row['future'] && !$trash && $row['visible']): ?><small>Con revisión programada</small><?php endif ?></div>
                    <a class="icon-button" href="<?=e($base . '/' . $row['id'])?>" aria-label="Editar <?=e($row['title'])?>" title="Editar"><?=uiIcon('edit')?></a>
                  </li>
                <?php endforeach ?></ul>
              </div>
            <?php endif;
            paginate($base, array_filter(['papelera'=>$trash ? '1' : '', 'q'=>$search, 'estado'=>$state], fn($value)=>$value !== ''),
                $page, $total > $page*20);
        }, $user, current: $module);
    } elseif ($action === 'preview') {
        $row = editorRow($module, $id);
        if (isset($_GET['revision'])) {
            $revision = field('revision', 18, $_GET);
            if (!ctype_digit($revision)) {
                fail(404, 'Revisión no encontrada.');
            }
            $data = query('SELECT r.*,rm.media_id FROM revisions r LEFT JOIN revision_media rm ON rm.revision_id=r.id
                           WHERE r.content_id=? AND r.id=?', [$id,$revision])->fetch(PDO::FETCH_ASSOC);
            if (!$data) {
                fail(404, 'Revisión no encontrada.');
            }
            $row = $data + ['module' => $module, 'working' => $data['id']];
        }
        $revisions = query('SELECT id,created_at FROM revisions WHERE content_id=? ORDER BY id DESC LIMIT 50', [$id])->fetchAll(PDO::FETCH_ASSOC);
        layout('Vista previa', function () use ($row, $base, $id, $revisions): void {
            ?><div class="preview-bar"><a class="section-link" href="<?=e($base . '/' . $id)?>"><?=uiIcon('arrow_back')?> Volver al editor</a> <span>Vista previa</span></div>
            <details class="revision-list"><summary>Revisiones recientes</summary><ul><?php foreach ($revisions as $entry): ?>
            <li><a href="?revision=<?=e($entry['id'])?>"><?=e($entry['created_at'])?></a></li><?php endforeach ?></ul></details>
            <?php if ($row['module'] === 'inicio') {
                home($row, (int) $row['working']);
            } else {
                detail($row, (int) $row['working']);
            }
        }, $user, current: $module);
    } else {
        $row = $item === 'nuevo' ? [] : editorRow($module, $id);
        layout($label, fn() => editForm($module, $id, $row, $user), $user, current: $module);
    }
}

function adminOrder(string $module, bool $read, array $user): void
{
    requireAccess($user,$module,'order');
    if (!$read) {
        throttle('mutate:' . $user['id'], 180);
        csrf($user);
        saveOrder($module, (int) $user['id']);
        redirect('/admin/' . $module . '/reordenar?guardado=1');
    }
    $rows = orderRows($module);
    layout('Reordenar ' . modules()[$module][0], fn() => orderForm($module,$rows,$user), $user, current: $module);
}

function adminTags(bool $read, array $user): void
{
    $action = $read ? 'list' : field('action', 12);
    requireAccess($user,'etiquetas',$action);
    if (!$read) {
        throttle('mutate:' . $user['id'], 180);
        csrf($user);
        changeTag($action, (int) $user['id']);
        redirect('/admin/etiquetas');
    }
    layout('Etiquetas', fn() => tagAdmin($user), $user, current: 'etiquetas');
}

function publicRoute(string $path, array $session): void
{
    $origin = configuredOrigin();
    if ($path === '/') {
        $settings = homeSection(fn() => published('inicio', limit: 1)[0] ?? []);
        $fields = json_decode($settings['fields'] ?? '{}', true);
        layout('Inicio', fn() => home($settings),
            description: ($fields['meta_descripcion'] ?? '') ?: 'Portal institucional del Colegio Bandera del Perú.',
            canonical: $origin ? $origin . '/' : '', current: 'inicio');
        return;
    }
    if ($path === '/mesa-partes') {
        $guide = homeSection(fn() => published('institucion', slug: 'mesa-partes')[0] ?? []);
        $settings = homeSection(fn() => published('inicio', limit: 1)[0] ?? []);
        $fut = homeSection(fn() => published('documentos', slug: FUT_DOCUMENT_SLUG, limit: 1))[0] ?? [];
        $contact = json_decode($settings['fields'] ?? '{}', true);
        layout('Mesa de Partes', fn() => mesaPartes($guide, $contact, ($fut['media_mime'] ?? '') === 'application/pdf'),
            description: ($guide['summary'] ?? '') ?: 'Presenta documentos y consulta solicitudes por los canales de atención del colegio.',
            canonical: $origin ? $origin . $path : '', current: 'mesa-partes');
        return;
    }
    if ($path === '/mesa-partes/fut') {
        downloadFut();
    }
    if ($path === '/robots.txt') {
        header('Content-Type: text/plain; charset=utf-8');
        echo "User-agent: *\nDisallow: /admin/\n";
        if ($origin) echo "Sitemap: $origin/sitemap.xml\n";
        return;
    }
    if ($path === '/sitemap.xml' && $origin) {
        header('Content-Type: application/xml; charset=utf-8');
        echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        echo '<url><loc>' . e($origin . '/') . '</loc></url>';
        echo '<url><loc>' . e($origin . '/mesa-partes') . '</loc></url>';
        $urls = query("SELECT c.module,c.slug,r.created_at FROM content c JOIN revisions r ON r.id=(" . visibleRevision() . ")
                       WHERE c.deleted_at IS NULL AND c.module NOT IN ('inicio','carrusel')
                         AND NOT (c.module='institucion' AND c.slug='mesa-partes') ORDER BY c.id");
        while ($entry = $urls->fetch(PDO::FETCH_ASSOC)) {
            $lastmod = (new DateTimeImmutable($entry['created_at']))->format(DateTimeInterface::ATOM);
            echo '<url><loc>' . e($origin . '/' . $entry['module'] . '/' . $entry['slug']) . '</loc><lastmod>' . e($lastmod) . '</lastmod></url>';
        }
        echo '</urlset>';
        return;
    }
    if ($path === '/tags') {
        layout('Etiquetas', function (): void {
            publicHeading('Etiquetas de noticias', ['/noticias'=>'Noticias']);
            $tags = tagCatalog();
            if (!$tags) {
                emptyState('label', 'Todavía no hay etiquetas publicadas.');
                return;
            } ?>
            <ul class="tag-link-list"><?php foreach ($tags as $tag): ?>
              <li><a class="tag-link" href="/tags/<?=e($tag['slug'])?>"><?=uiIcon('label')?> <?=e($tag['name'])?> <span><?=e($tag['public_count'])?></span></a></li>
            <?php endforeach ?></ul><?php
        }, canonical: $origin ? $origin . '/tags' : '', current: 'noticias');
        return;
    }
    if (preg_match('~^/tags/([a-z0-9-]{1,80})$~D', $path, $parts)) {
        $tag = query('SELECT name FROM tags WHERE slug=? AND archived_at IS NULL', [$parts[1]])->fetchColumn();
        $page = pageNumber();
        $rows = $tag === false ? [] : published('noticias', tag: $parts[1], limit: 25, offset: ($page-1)*24);
        if ($tag === false || (!$rows && $page === 1)) {
            fail(404, 'Etiqueta no disponible.');
        }
        layout((string) $tag, function () use ($tag,$rows,$page,$path): void {
            publicHeading((string) $tag, ['/noticias'=>'Noticias', '/tags'=>'Etiquetas']);
            echo '<h2 class="catalog-heading">Noticias etiquetadas</h2>';
            listCards(array_slice($rows, 0, 24), headingLevel: 3, gridClass: 'news-cards');
            paginate($path, [], $page, count($rows)>24);
        }, canonical: $origin ? $origin . $path : '', current: 'noticias');
        return;
    }
    $page = pageNumber();
    if ($path === '/buscar') {
        $search = field('q', 200, $_GET);
        layout('Buscar', function () use ($search,$page): void {
            publicHeading('Buscar en el portal');
            ?><form method="get" class="catalog-filters">
            <label class="search-field">Término <input type="search" name="q" value="<?=e($search)?>" maxlength="100" placeholder="Noticias, eventos o documentos" required></label>
            <button class="primary"><?=uiIcon('search')?> Buscar</button></form>
            <?php if ($search !== ''): ?><h2 class="catalog-heading">Resultados</h2><?php
                $rows = published(null, $search, limit: 25, offset: ($page-1)*24);
                listCards(array_slice($rows, 0, 24), showModule: true, headingLevel: 3);
                paginate('/buscar', ['q'=>$search], $page, count($rows) > 24);
            endif;
        }, current: 'buscar');
        return;
    }
    if (preg_match('~^/documentos/([a-z0-9-]{1,120})/descargar$~D', $path, $parts)) {
        downloadDocument($parts[1]);
    }
    if (preg_match('~^/medio/([0-9]{1,18})$~D', $path, $parts)) {
        $revision = $_GET['revision'] ?? null;
        if ($revision !== null && (!is_string($revision) || !preg_match('/^[0-9]{1,18}$/D', $revision))) {
            fail(404, 'Archivo no encontrado.');
        }
        serveMedia((int) $parts[1], $revision === null ? null : (int) $revision, $session, ($_GET['tam'] ?? '') === 'mini');
    }
    $legacy = ['/documentos-institucionales'=>'/documentos','/transparencia'=>'/documentos',
        '/equipo-directivo'=>'/directivos','/directivo'=>'/directivos','/login'=>'/admin/ingresar',
        '/nuestro-colegio'=>'/institucion/nosotros','/institucion/mesa-partes'=>'/mesa-partes'];
    foreach (['nosotros','historia','valores','mision','propuesta','talleres','organigrama','tic/aula','tic/recursos','tic/proyectos'] as $section) {
        $legacy['/' . $section] = '/institucion/' . str_replace('/', '-', $section);
    }
    if (isset($legacy[$path])) {
        redirect($legacy[$path], 301);
    }
    if (preg_match('~^/([a-z]+)(?:/([a-z0-9-]+))?$~D', $path, $parts) && isset(modules()[$parts[1]])) {
        $module = $parts[1];
        $tag = field('etiqueta', 80, $_GET);
        if (in_array($module, ['inicio','carrusel'], true)) {
            header('X-Robots-Tag: noindex, follow');
        }
        if (isset($parts[2])) {
            $row = published($module, slug: $parts[2])[0] ?? fail(404, 'Contenido no encontrado.');
            $related = $module === 'noticias' ? relatedNews($row) : [];
            layout($row['title'], function () use ($row,$related): void {
                detail($row);
                if ($related) {
                    echo '<section class="home-section"><div class="section-head"><h2>Noticias relacionadas</h2></div>';
                    listCards($related, headingLevel: 3);
                    echo '</section>';
                }
            }, description: $row['summary'], canonical: $origin ? $origin . $path : '', current: $module);
        } else {
            $label = modules()[$module][0];
            $filters = publicFilters($module);
            $search = field('q', 200, $_GET);
            $rows = published($module, $search, $tag, limit: 25, offset: ($page-1)*24, filters: $filters);
            layout($label, function () use ($label,$tag,$rows,$module,$page,$filters,$search): void {
                $staff = in_array($module, ['directivos','docentes'], true);
                $actions = $module === 'noticias' ? static function (): void {
                    ?><a class="button secondary" href="/tags"><?=uiIcon('label')?> Ver etiquetas</a><?php
                } : null;
                publicHeading($label, actions: $actions, plain: $module === 'institucion');
                catalogFilters($module, $filters, $search, $tag);
                if ($tag !== '') echo '<h2 class="catalog-heading">Etiqueta ' . e($tag) . '</h2>';
                if ($module === 'eventos' && $filters['mes'] !== '') {
                    eventCalendar($filters['mes'], array_slice($rows, 0, 24));
                } elseif ($staff) {
                    staffDirectory($module, array_slice($rows, 0, 24), $tag === '' ? 2 : 3);
                } elseif ($module === 'institucion') {
                    institutionInformation(array_slice($rows, 0, 24));
                } elseif ($module === 'administrativos') {
                    informationList(array_slice($rows, 0, 24));
                } else {
                    $gridClass = match ($module) {
                        'noticias' => 'news-cards',
                        'eventos' => 'event-cards',
                        'galeria' => 'gallery-cards',
                        default => '',
                    };
                    listCards(array_slice($rows, 0, 24), headingLevel: $tag === '' ? 2 : 3, gridClass: $gridClass);
                }
                paginate('/' . $module, array_filter($filters + ['etiqueta'=>$tag,'q'=>$search], fn($value)=>$value !== ''),
                    $page, count($rows)>24);
            }, canonical: $origin && !$search && !$tag && $page === 1 && !array_filter($filters) ? $origin . $path : '', current: $module);

        }
        return;
    }
    fail(404, 'Página no encontrada.');
}

function publicFilters(string $module): array
{
    $keys = match ($module) {
        'galeria' => ['tipo'=>5,'anio'=>4],
        'documentos' => ['categoria'=>255,'anio'=>4],
        'comunicados' => ['aviso'=>15],
        'eventos' => ['periodo'=>12,'mes'=>7],
        default => [],
    };
    $filters = [];
    foreach ($keys as $key=>$limit) {
        $filters[$key] = field($key, $limit, $_GET);
    }
    if (!in_array($filters['tipo'] ?? '', ['', 'foto', 'video'], true)
        || (!empty($filters['anio']) && !preg_match('/^[0-9]{4}$/D', $filters['anio']))
        || (!empty($filters['aviso']) && !isset(communicationTypes()[$filters['aviso']]))
        || !in_array($filters['periodo'] ?? '', ['', 'proximos', 'anteriores'], true)
        || (!empty($filters['mes']) && !preg_match('/^(?!0000)[0-9]{4}-(?:0[1-9]|1[0-2])$/D', $filters['mes']))) {
        fail(422, 'Revisa los filtros del catálogo.');
    }
    return $filters;
}

function relatedNews(array $row): array
{
    $tag = query('SELECT t.slug FROM tags t JOIN revision_tags rt ON t.name=rt.tag
                  WHERE rt.revision_id=? AND t.archived_at IS NULL ORDER BY t.name LIMIT 1',
        [$row['id']])->fetchColumn();
    return array_slice(array_values(array_filter(published('noticias', tag: $tag ?: '', limit: 4),
        fn(array $item) => $item['id'] !== $row['id'])), 0, 3);
}
