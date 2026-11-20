<?php
declare(strict_types=1);

function layout(string $title, callable $render, ?array $admin = null, string $description = '', string $canonical = '', string $current = ''): void
{
    $area = $admin ? 'admin-site' : ($current === 'acceso' ? 'auth-site' : 'public-site');
    ?><!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<script src="/site-start.js"></script>
<title><?=e($title)?> | I.E. Bandera del Perú</title>
<?php if ($description !== ''): ?><meta name="description" content="<?=e($description)?>"><meta property="og:description" content="<?=e($description)?>"><?php endif ?>
<?php if ($canonical !== ''): ?><link rel="canonical" href="<?=e($canonical)?>"><meta property="og:url" content="<?=e($canonical)?>">
<meta property="og:title" content="<?=e($title)?>"><?php endif ?>
<link rel="icon" type="image/jpeg" href="/images/escudo.jpeg">
<link rel="stylesheet" href="/site.css">
<script src="/site.js" defer></script></head>
<body class="<?=$area?>"><a class="skip" href="#contenido">Saltar al contenido</a>
<header class="site-header">
  <div class="bar">
    <?php brand($admin ? '/admin' : '/'); ?>
    <button type="button" id="menu" class="icon-button" aria-label="Menú" aria-controls="navigation" aria-expanded="false"><?=uiIcon('menu')?></button>
    <nav id="navigation" aria-label="<?= $admin ? 'Administración' : 'Principal' ?>">
      <div class="nav-links">
      <?php if ($admin): ?>
        <a href="/admin"<?=currentAttr($current === 'panel')?>>Panel</a>
        <a href="/"><?=uiIcon('open_in_new')?> Ver sitio</a>
      <?php else: ?>
        <?php foreach (['inicio'=>'Inicio','institucion'=>'Institución','noticias'=>'Noticias','comunicados'=>'Comunicados','eventos'=>'Eventos'] as $key=>$name): ?>
          <a href="<?= $key === 'inicio' ? '/' : '/'.$key ?>"<?=currentAttr($current === $key)?>><?=e($name)?></a>
        <?php endforeach ?>
      <?php endif ?>
      </div>
      <div class="nav-tools">
        <?php if (!$admin): ?><a class="icon-button" href="/buscar" aria-label="Buscar" title="Buscar"<?=currentAttr($current === 'buscar')?>><?=uiIcon('search')?></a><?php endif ?>
        <button type="button" class="icon-button theme-toggle" data-theme-toggle aria-label="Alternar modo claro y oscuro" title="Alternar modo claro y oscuro"><span class="icon" aria-hidden="true"></span></button>
        <?php if ($admin): ?>
          <form method="post" action="/admin/salir"><?=token($admin)?><button class="button secondary"><?=uiIcon('logout')?> Cerrar sesión</button></form>
        <?php elseif ($current !== 'acceso'): ?>
          <a class="button access-link" href="/admin/ingresar"><?=uiIcon('lock')?> Acceso del personal</a>
        <?php endif ?>
      </div>
    </nav>
  </div>
</header>
<?php if ($admin): ?>
  <div class="workspace">
    <?php moduleNavigation($admin, $current); ?>
    <main id="contenido" class="workspace-main" tabindex="-1"><?php $render(); ?></main>
  </div>
  <footer class="console-footer"><span>Portal institucional</span><a href="/">Ver sitio público <?=uiIcon('arrow_outward')?></a></footer>
<?php else: ?>
  <div class="shell"><main id="contenido" tabindex="-1"><?php $render(); ?></main></div>
  <?php publicFooter(); ?>
<?php endif ?>
</body></html><?php
}

function uiIcon(string $name): string
{
    return '<span class="icon" aria-hidden="true">' . e($name) . '</span>';
}

function brand(string $href): void
{
    ?><a class="brand" href="<?=e($href)?>">
      <span class="brand-mark"><img src="/images/escudo.jpeg" alt="" width="34" height="46"></span>
      <span class="brand-name"><strong>Bandera del Perú</strong><small>Institución educativa</small></span>
    </a><?php
}

function moduleIcon(string $key): string
{
    return match ($key) {
        'noticias'=>'news','comunicados'=>'campaign','eventos'=>'calendar_month','galeria'=>'photo_library',
        'documentos'=>'description','docentes'=>'school','administrativos'=>'groups','directivos'=>'account_tree',
        'carrusel'=>'view_carousel','institucion'=>'account_balance','inicio'=>'web','etiquetas'=>'label',
        default=>'dashboard'
    };
}

function moduleNavigation(array $admin, string $current): void
{
    $groups = [
        'Publicaciones'=>['noticias','comunicados','eventos','galeria'],
        'Institución'=>['institucion','documentos','docentes','administrativos','directivos'],
        'Sitio web'=>['inicio','carrusel','etiquetas'],
    ];
    $sections = modules();
    ?><aside class="workspace-sidebar">
      <details id="modules">
      <summary><?=uiIcon('dashboard')?><span>Módulos <small><?=e($admin['username'])?></small></span><?=uiIcon('expand_more')?></summary>
      <nav aria-label="Módulos">
        <a href="/admin"<?=currentAttr($current === 'panel')?>><?=uiIcon('dashboard')?> Inicio del panel</a>
        <?php foreach ($groups as $title=>$items):
            $items = array_filter($items, fn(string $key) => allowed($admin,$key,'list'));
            if (!$items) continue; ?>
          <div class="module-group"><p><?=e($title)?></p>
          <?php foreach ($items as $key): ?>
            <a href="/admin/<?=e($key)?>"<?=currentAttr($current === $key)?>><?=uiIcon(moduleIcon($key))?> <span><?=e($sections[$key][0] ?? 'Etiquetas')?></span></a>
          <?php endforeach ?></div>
        <?php endforeach ?>
      </nav></details>
    </aside><?php
}

function publicFooter(): void
{
    ?><footer class="site-footer">
      <div class="footer-content">
        <?php brand('/'); ?>
        <nav aria-label="Secciones"><p>El colegio</p>
          <a href="/institucion">Institución</a><a href="/docentes">Docentes</a><a href="/directivos">Equipo directivo</a><a href="/administrativos">Administrativos</a>
        </nav>
        <nav aria-label="Recursos y novedades"><p>Recursos y novedades</p>
          <a href="/documentos">Documentos institucionales</a><a href="/noticias">Noticias</a><a href="/galeria">Galería</a><a href="/eventos">Calendario</a>
        </nav>
      </div>
      <div class="footer-base"><span>I.E. Bandera del Perú</span><a href="/admin/ingresar">Acceso del personal <?=uiIcon('arrow_outward')?></a></div>
    </footer><?php
}

function currentAttr(bool $current): string
{
    return $current ? ' aria-current="page"' : '';
}

function token(array $session): string
{
    return '<input type="hidden" name="_csrf" value="' . e($session['csrf']) . '">';
}

function emptyState(string $icon = 'description', string $title = 'No hay publicaciones', string $hint = ''): void
{
    ?><div class="empty-state"><div class="empty-icon"><?=uiIcon($icon)?></div>
        <div><strong><?=e($title)?></strong><?php if ($hint !== ''): ?><p><?=e($hint)?></p><?php endif ?></div>
    </div><?php
}

function listCards(array $rows, bool $showModule = false, int $headingLevel = 2): void
{
    if (!$rows) {
        emptyState('search', 'No hay contenido publicado que coincida.');
        return;
    }
    ?><div class="cards"><?php foreach ($rows as $row): $fields = json_decode($row['fields'], true); ?>
    <article class="card content-card">
        <?php if (str_starts_with($row['media_mime'] ?? '', 'image/')): ?>
          <div class="card-photo"><?php imageTag($row, $fields['alt'] ?? '', 'card-image'); ?></div>
        <?php endif ?>
        <div class="card-body">
          <?php if ($showModule): ?><span class="card-section"><?=uiIcon(moduleIcon($row['module']))?> <?=e(modules()[$row['module']][0])?></span><?php endif ?>
          <?php if ($row['module'] === 'comunicados'): ?>
            <span class="status-chip<?= ($fields['tipo'] ?? '') === 'urgente' ? ' chip-alert' : '' ?>"><?=e(communicationTypes()[$fields['tipo'] ?? ''] ?? 'General')?></span>
          <?php endif ?>
          <?php if (in_array($row['module'], ['noticias','comunicados','documentos'], true) && $row['publication_date']): ?>
            <time class="card-date" datetime="<?=e($row['publication_date'])?>"><?=e(publicationLabel($row['publication_date']))?></time>
          <?php endif ?>
          <h<?=$headingLevel?> class="card-title"><a href="/<?=e($row['module'])?>/<?=e($row['slug'])?>"><?=e($row['title'])?></a><?=uiIcon('arrow_outward')?></h<?=$headingLevel?>>
          <?php if (!empty($fields['fecha'])): ?><p class="card-date"><?=uiIcon('calendar_month')?> <?=e(eventDateLabel($fields))?></p><?php endif ?>
          <?php if (!empty($fields['fecha_galeria'])): ?><p class="card-date"><time datetime="<?=e($fields['fecha_galeria'])?>"><?=e(limaDisplay($fields['fecha_galeria']))?></time></p><?php endif ?>
          <?php if ($row['summary']): ?><p><?=e($row['summary'])?></p><?php endif ?>
        </div>
    </article>
    <?php endforeach ?></div><?php
}

function detail(array $row, ?int $preview = null): void
{
    $fields = json_decode($row['fields'] ?? '{}', true);
    ?><article class="article">
    <?php if ($preview === null): ?><p class="breadcrumb"><a href="/">Inicio</a><?=uiIcon('chevron_right')?><a href="/<?=e($row['module'])?>"><?=e(modules()[$row['module']][0])?></a></p><?php endif ?>
    <h1><?=e($row['title'])?></h1>
    <?php if (!empty($row['publication_date']) && in_array($row['module'], ['noticias','comunicados','documentos'], true)): ?>
        <p class="article-date"><?=uiIcon('calendar_month')?> <time datetime="<?=e($row['publication_date'])?>"><?=e(publicationLabel($row['publication_date']))?></time></p>
    <?php endif ?>
    <?php if (!empty($fields['fecha'])): ?><p><?=e(eventDateLabel($fields))?></p><?php endif ?>
    <?php if ($row['summary']): ?><p class="lead"><?=e($row['summary'])?></p><?php endif ?>
    <?php if ($row['media_id']): showMedia($row, $preview); endif ?>
    <div class="rich"><?= $row['body'] ?></div>
    <?php if ($fields): ?><dl><?php foreach ($fields as $key => $value): if (in_array($key, ['alt','fecha','hora'], true) || $value === '') continue; ?>
    <dt><?=e(modules()[$row['module']][1][$key] ?? $key)?></dt>
    <dd><?php if (in_array($key, ['video','enlace'], true)): ?><a href="<?=e($value)?>"><?= $key === 'video' ? 'Ver video en su origen' : 'Abrir enlace' ?></a>
    <?php if ($key === 'video' && ($id = youtubeId($value)) !== null): ?>
      <button type="button" data-video-id="<?=e($id)?>" hidden>Mostrar reproductor de YouTube</button>
    <?php endif ?>
    <?php else: ?><?=e(match ($key) {'fecha_galeria'=>limaDisplay($value),'tipo'=>communicationTypes()[$value] ?? 'General',default=>$value})?><?php endif ?></dd>
    <?php endforeach ?></dl><?php endif ?>
    <?php $tags = query('SELECT t.name,t.slug FROM revision_tags rt JOIN tags t ON t.name=rt.tag
                         WHERE rt.revision_id=? AND t.archived_at IS NULL ORDER BY t.name',
        [$preview ?? $row['id']])->fetchAll(PDO::FETCH_ASSOC); ?>
    <?php if ($tags): ?><p>Etiquetas
      <?php foreach ($tags as $tag): ?>
        <?php if ($preview === null): ?><a class="tag" href="/tags/<?=e($tag['slug'])?>"><?=e($tag['name'])?></a>
        <?php else: ?><span class="tag"><?=e($tag['name'])?></span><?php endif ?>
      <?php endforeach ?>
    </p><?php endif ?>
    </article><?php
}

function showMedia(array $row, ?int $preview = null): void
{
    if (!isset($row['media_mime'])) {
        $metadata = mediaInfo((int) $row['media_id']);
        $row += $metadata + ['media_mime'=>$metadata['mime'] ?? ''];
    }
    $fields = json_decode($row['fields'] ?? '{}', true);
    if ($row['media_mime'] === 'application/pdf') {
        $url = $preview === null && $row['module'] === 'documentos'
            ? '/documentos/' . $row['slug'] . '/descargar'
            : '/medio/' . $row['media_id'] . ($preview ? '?revision=' . $preview : '');
        $size = number_format((int) $row['size_bytes'] / 1024, 1, ',', '.');
        ?><p class="download-card"><a class="button secondary" href="<?=e($url)?>"><?=uiIcon('download')?> Descargar PDF</a> <span>(<?=e($size)?> KiB<?= $row['module'] === 'documentos' ? ', versión ' . e(documentVersion($row, $preview)) : '' ?>)</span></p><?php
    } else {
        imageTag($row, ($fields['alt'] ?? '') ?: $row['title'], 'media', $preview);
    }
}

function documentVersion(array $row, ?int $preview): int
{
    if ($preview !== null) {
        $id = $row['content_id'] ?? $row['id'];
    } else {
        $id = $row['content_id'];
    }
    return (int) query("SELECT count(*) FROM revisions r JOIN revision_media rm ON rm.revision_id=r.id
                       WHERE r.content_id=? AND r.id<=? AND EXISTS (
                         SELECT 1 FROM editorial_events e WHERE e.revision_id=r.id AND e.action IN ('publish','publish-due')
                       )", [$id, $preview ?? $row['id']])->fetchColumn() ?: 1;
}

function imageTag(array $row, string $alt, string $class, ?int $preview = null, bool $hero = false): void
{
    $base = '/medio/' . $row['media_id'];
    $full = $base . ($preview ? '?revision=' . $preview : '');
    $mini = $full . ($preview ? '&' : '?') . 'tam=mini';
    $width = (int) ($row['width'] ?? 0);
    $height = (int) ($row['height'] ?? 0);
    $smallWidth = min(640, $width);
    ?><img class="<?=e($class)?>" src="<?=e($full)?>" alt="<?=e($alt)?>"
        <?= $width && $height ? 'width="' . e($width) . '" height="' . e($height) . '"' : '' ?>
        <?= !empty($row['has_thumbnail']) && $smallWidth < $width
             ? 'srcset="' . e("$mini {$smallWidth}w, $full {$width}w") . '" sizes="' . ($hero ? '100vw' : '(max-width: 750px) 100vw, 640px') . '"' : '' ?>
        <?= $hero ? 'fetchpriority="high"' : 'loading="lazy"' ?>><?php
}

function homeSection(callable $load): ?array
{
    try {
        return $load();
    } catch (Throwable $error) {
        logEvent('home_section_unavailable', ['kind'=>get_class($error)]);
        return null;
    }
}

function home(?array $settings, ?int $preview = null): void
{
    $fields = json_decode($settings['fields'] ?? '{}', true);
    $slides = homeSection(fn() => published('carrusel'));
    $hero = (($fields['hero_modo'] ?? '') === 'carrusel' ? ($slides[0] ?? null) : null) ?: $settings;
    $heroPreview = $hero === $settings ? $preview : null;
    if (!empty($hero['media_id']) && !isset($hero['media_mime'])) {
        $hero += mediaInfo((int) $hero['media_id']);
    }
    ?><section class="hero">
      <div class="hero-copy">
        <h1><?=e($settings['title'] ?? 'Colegio Bandera del Perú')?></h1>
        <p><?=e(($fields['lema'] ?? '') ?: (($settings['summary'] ?? '') ?: 'Noticias, actividades y recursos para la comunidad educativa.'))?></p>
        <div class="hero-actions">
          <a class="button" href="/institucion">Conoce el colegio <?=uiIcon('arrow_forward')?></a>
        </div>
        <?php if (($fields['hero_modo'] ?? '') === 'carrusel' && $slides): ?>
          <div class="hero-slides" role="group" aria-label="Diapositivas de portada"><?php foreach ($slides as $index=>$slide):
            if (!$slide['media_id']) continue;
            $slideFields = json_decode($slide['fields'], true); ?>
            <button type="button" data-hero-slide="/medio/<?=e($slide['media_id'])?>"
                data-slide-alt="<?=e(($slideFields['alt'] ?? '') ?: $slide['title'])?>"
                data-slide-width="<?=e($slide['width'] ?? 0)?>" data-slide-height="<?=e($slide['height'] ?? 0)?>"
                data-slide-small="<?= $slide['has_thumbnail'] ? '1' : '0' ?>"
                aria-label="<?=e($slide['title'])?>" title="<?=e($slide['title'])?>"
                aria-pressed="<?= $index === 0 ? 'true' : 'false' ?>" hidden><span aria-hidden="true"><?=$index+1?></span></button>
          <?php endforeach ?><a href="#destacados">Ver diapositivas</a></div>
        <?php endif ?>
      </div>
      <div class="hero-visual">
      <?php if (!empty($hero['media_id'])):
        $heroFields = json_decode($hero['fields'], true);
        imageTag($hero, ($heroFields['alt'] ?? '') ?: 'Imagen institucional', 'hero-image', $heroPreview, true);
      else: ?><img src="/images/frontis_colegio.webp"
        srcset="/images/frontis_colegio-640.webp 640w, /images/frontis_colegio.webp 1360w" sizes="(min-width: 821px) 54vw, 100vw"
        alt="Fachada del colegio" width="1360" height="1020" fetchpriority="high"><?php endif ?>
      </div>
    </section>
    <?php if ($settings === null): ?><p class="notice" role="status">La información de portada no está disponible temporalmente. <a href="/">Reintentar</a></p><?php endif ?>
    <section class="home-section shortcut-section" aria-labelledby="accesos">
      <div class="section-head"><h2 id="accesos">Accesos rápidos</h2></div>
      <ul class="quick-grid">
      <?php foreach (['documentos','docentes','directivos','galeria'] as $key): ?>
        <li><a href="/<?=$key?>"><span class="quick-icon"><?=uiIcon(moduleIcon($key))?></span><strong><?=e(modules()[$key][0])?></strong><?=uiIcon('arrow_outward')?></a></li>
      <?php endforeach ?>
      <?php if (!empty($fields['acceso_texto']) && !empty($fields['acceso_url'])): ?>
        <li><a href="<?=e($fields['acceso_url'])?>"><span class="quick-icon"><?=uiIcon('open_in_new')?></span><strong><?=e($fields['acceso_texto'])?></strong><?=uiIcon('arrow_outward')?></a></li>
      <?php endif ?></ul>
    </section>
    <?php if (!empty($settings['body'])): ?><div class="home-intro rich"><?= $settings['body'] ?></div><?php endif ?>
    <?php
    $news = homeSection(fn() => published('noticias', limit: 3));
    $notices = homeSection(fn() => published('comunicados', limit: 3));
    $events = homeSection(fn() => published('eventos', limit: 3));
    $gallery = homeSection(fn() => published('galeria', limit: 3));
    ?>
    <section class="home-section home-news" aria-labelledby="novedades">
      <div class="section-head"><h2 id="novedades">Noticias recientes</h2><a class="section-link" href="/noticias">Todas las noticias <?=uiIcon('arrow_forward')?></a></div>
      <?php if ($news === null): ?><p class="notice" role="status">No fue posible cargar las noticias. <a href="/">Reintentar</a></p>
      <?php elseif ($news): listCards($news, headingLevel: 3); else: emptyState('news', 'Todavía no hay noticias publicadas.'); endif ?>
    </section>
    <div class="overview-grid">
      <?php foreach ([
            ['comunicados','Comunicados','Ver avisos',$notices],
            ['eventos','Próximos eventos','Ver calendario',$events]
      ] as [$key,$title,$link,$rows]): ?>
        <section class="overview-panel" aria-labelledby="inicio-<?=e($key)?>">
          <div class="section-head"><h2 id="inicio-<?=e($key)?>"><?=e($title)?></h2></div>
          <?php if ($rows === null): ?><p class="notice" role="status">Esta sección no está disponible. <a href="/">Reintentar</a></p>
          <?php elseif ($rows): ?>
            <ul class="overview-list"><?php foreach ($rows as $row): $data=json_decode($row['fields'], true); ?>
                <li><span class="quick-icon"><?=uiIcon(moduleIcon($key))?></span><div>
                  <a href="/<?=$key?>/<?=e($row['slug'])?>"><?=e($row['title'])?></a>
                  <?php if ($key === 'eventos' && !empty($data['fecha'])): ?><small><?=e(eventDateLabel($data))?></small>
                  <?php elseif ($row['publication_date']): ?><small><?=e(publicationLabel($row['publication_date']))?></small><?php endif ?>
                </div></li>
            <?php endforeach ?></ul>
          <?php else: ?><p class="muted"><?= $key === 'eventos' ? 'Por ahora no hay actividades programadas.' : 'Por ahora no hay comunicados vigentes.' ?></p><?php endif ?>
          <a class="section-link" href="/<?=$key?>"><?=e($link)?> <?=uiIcon('arrow_forward')?></a>
        </section>
      <?php endforeach ?>
    </div>
    <?php if ($slides): ?>
    <section class="home-section" id="destacados"><div class="section-head"><h2>Destacados</h2></div><div class="slides" tabindex="0" aria-label="Tarjetas destacadas">
    <?php foreach ($slides as $slide): $data = json_decode($slide['fields'], true); ?>
    <article class="card content-card">
      <?php if ($slide['media_id']): ?><div class="card-photo"><?php showMedia($slide); ?></div><?php endif ?>
      <div class="card-body"><h3><?=e($slide['title'])?></h3>
      <?php if ($slide['summary']): ?><p><?=e($slide['summary'])?></p><?php endif ?>
      <?php if (!empty($data['enlace'])): ?><a class="section-link" href="<?=e($data['enlace'])?>">Más información <?=uiIcon('arrow_outward')?></a><?php endif ?></div>
    </article>
    <?php endforeach ?></div></section>
    <?php elseif ($slides === null): ?><p class="notice" role="status">No fue posible cargar los destacados. <a href="/">Reintentar</a></p><?php endif ?>
    <?php if ($gallery): ?>
      <section class="home-section"><div class="section-head"><h2>Galería</h2><a class="section-link" href="/galeria">Ver galería <?=uiIcon('arrow_forward')?></a></div><?php listCards($gallery, headingLevel: 3); ?></section>
    <?php elseif ($gallery === null): ?><p class="notice" role="status">No fue posible cargar la galería. <a href="/">Reintentar</a></p><?php endif ?>
    <?php $pillars = array_filter([1,2,3], fn(int $i) => !empty($fields["pilar{$i}_titulo"])); ?>
    <?php if ($pillars): ?><section class="home-section"><div class="section-head"><h2>Formación</h2></div><div class="cards"><?php foreach ($pillars as $i): ?>
      <article class="card card-body"><h3><?=e($fields["pilar{$i}_titulo"])?></h3><p><?=e($fields["pilar{$i}_desc"] ?? '')?></p></article>
    <?php endforeach ?></div></section><?php endif ?>
    <?php $hasMetrics = false; for ($i=1; $i<=4; $i++):
        $value = $fields["metrica{$i}_valor"] ?? '';
        $caption = $fields["metrica{$i}_etiqueta"] ?? '';
        $source = $fields["metrica{$i}_fuente"] ?? '';
        if ($value === '' || $caption === '' || $source === '') continue;
        if (!$hasMetrics) { echo '<div class="metrics">'; $hasMetrics = true; } ?>
        <p><strong><?=e($value)?></strong> <?=e($caption)?>
        <a href="<?=e($source)?>">Fuente <?=e($fields["metrica{$i}_fecha"] ?? '')?></a></p>
    <?php endfor; if ($hasMetrics) echo '</div>'; ?>
    <?php if (array_filter(array_intersect_key($fields, array_flip(['direccion','correo','telefono','red_social'])))): ?>
      <section class="home-section contact-section"><h2>Contacto</h2><address>
      <?php foreach (['direccion'=>'location_on','correo'=>'mail','telefono'=>'call'] as $key=>$icon): if (!empty($fields[$key])): ?>
        <span><?=uiIcon($icon)?> <?=e($fields[$key])?></span>
      <?php endif; endforeach ?>
      <?php if (!empty($fields['red_social'])): ?><a href="<?=e($fields['red_social'])?>">Red social institucional <?=uiIcon('arrow_outward')?></a><?php endif ?>
      </address></section>
    <?php endif;
}

function statusChip(string $label, string $tone = ''): void
{
    ?><span class="status-chip<?= $tone ? ' chip-' . e($tone) : '' ?>"><?=e($label)?></span><?php
}

function editForm(string $module, int $id, array $row, array $user, ?HttpError $error = null): void
{
    [$label,$labels,$kind] = modules()[$module];
    $base = '/admin/' . $module;
    $url = $base . '/' . $id;
    $fields = json_decode($row['fields'] ?? '{}', true);
    $version = $row['version'] ?? 0;
    if ($module === 'eventos' && str_contains($fields['fecha'] ?? '', 'T')) {
        [$fields['fecha'],$fields['hora']] = explode('T', $fields['fecha'], 2);
    }
    $invalid = $error?->field;
    $conflict = $error?->getCode() === 409;
    $deleted = !empty($row['deleted_at']);
    $visible = !empty($row['effective_published']);
    $future = !empty($row['future']);
    $showPublication = $id && !$conflict && allowed($user,$module,$deleted ? 'restore' : 'publish');
    ?><div class="page-heading editor-heading">
        <p class="breadcrumb"><a href="<?=e($base)?>"><?=uiIcon('arrow_back')?> <?=e($label)?></a><?=uiIcon('chevron_right')?> <?= $id ? 'Editar' : 'Nuevo' ?></p>
        <div class="heading-row"><h1><?= $id ? e(($row['title'] ?? '') ?: 'Editar contenido') : 'Nuevo contenido' ?></h1>
        <?php if ($id): ?><a class="button secondary preview-link" href="<?=e($url)?>/vista"><?=uiIcon('visibility')?> Vista previa</a><?php endif ?></div>
        <?php if ($id): ?>
          <div class="editor-status">
            <?php statusChip($deleted ? 'En papelera' : ($visible ? 'Publicado' : ($future ? 'Programado' : 'Borrador')),
                $deleted ? 'alert' : ($visible ? 'success' : ($future ? 'planned' : ''))); ?>
            <?php if ($future): ?><span>Programado para <?=e((new DateTimeImmutable($row['publish_at']))->setTimezone(new DateTimeZone('America/Lima'))->format('d/m/Y H:i'))?> (Lima)</span><?php endif ?>
          </div>
        <?php endif ?>
    </div>
    <?php if ($error !== null): ?><div role="alert" class="notice error-notice" tabindex="-1" data-form-error>
      <p id="field-error"><?=e($error->getMessage())?></p>
      <?php if (in_array($invalid, [...array_keys($labels),'title','slug','summary','body','tags','alt','media','publish_at'], true)): ?>
      <p><a href="#<?=e($invalid)?>">Ir al campo para corregir</a></p><?php endif ?>
      <?php if ($conflict && $id): ?><p>Los datos de este intento siguen en el formulario.
        <a target="_blank" rel="noopener" href="<?=e($url)?>">Abrir la edición vigente en otra pestaña</a>.</p><?php endif ?>
    </div><?php endif ?>
    <?php if (isset($_GET['guardado'])): ?><p role="status" class="notice success-notice"><?=uiIcon('check_circle')?> Borrador guardado.</p><?php endif ?>
    <div class="editor-layout<?= $showPublication ? ' with-inspector' : '' ?>">
    <?php if (!$deleted): ?>
    <form class="editor" method="post" action="<?=e($url)?>/guardar" enctype="multipart/form-data" <?= $id ? 'data-autosave' : '' ?>>
      <?=token($user)?><input type="hidden" name="version" value="<?=e($version)?>">
      <section class="form-card">
        <h2><?=uiIcon('edit_note')?> Contenido</h2>
        <label>Título <input id="title" name="title" value="<?=e($row['title'] ?? '')?>" required maxlength="255"<?=invalidAttr($invalid,'title')?>></label>
        <label>Resumen <textarea id="summary" name="summary" rows="2" maxlength="1000"<?=invalidAttr($invalid,'summary')?>><?=e($row['summary'] ?? '')?></textarea></label>
        <div class="editor-body">
          <label for="body">Contenido</label>
          <textarea id="body" name="body" rows="10"<?=invalidAttr($invalid,'body')?>><?=e($row['body'] ?? '')?></textarea>
        </div>
      </section>
      <section class="form-card">
        <h2><?=uiIcon('description')?> Datos de la publicación</h2>
        <div class="field-grid">
          <label>Identificador de URL <input id="slug" name="slug" value="<?=e($row['slug'] ?? '')?>" pattern="[a-z0-9]+(-[a-z0-9]+)*" maxlength="120" <?= $id ? 'readonly' : 'placeholder="Se genera a partir del título"' ?><?=invalidAttr($invalid,'slug')?>></label>
          <?php foreach ($labels as $key => $fieldLabel):
              $options = match ($key) {'tipo'=>communicationTypes(),'hero_modo'=>['foto'=>'Foto fija','carrusel'=>'Carrusel'],default=>null};
              $type = isUrlField($key) ? 'url' : match (true) {
                  $key === 'correo'=>'email', $key === 'telefono'=>'tel', $key === 'hora'=>'time',
                  in_array($key, ['fecha','fecha_galeria'], true) || str_ends_with($key, '_fecha')=>'date', default=>'text',
              };
              $maximum = in_array($type, ['url','email'], true) ? ($type === 'email' ? 254 : 500) : 255; ?>
          <label><?=e($fieldLabel)?>
          <?php if ($options): selectOptions($key, $options, $fields[$key] ?? '', $invalid);
          else: ?><input id="<?=e($key)?>" name="<?=e($key)?>" type="<?=e($type)?>" maxlength="<?=$maximum?>" value="<?=e($fields[$key] ?? '')?>"<?=invalidAttr($invalid,$key)?>><?php endif ?>
          </label><?php endforeach ?>
        </div>
        <?php if ($module === 'noticias'): ?><label>Etiquetas separadas por coma <input id="tags" name="tags" maxlength="650" value="<?=e($row['tags'] ?? '')?>"<?=invalidAttr($invalid,'tags')?>></label>
          <a class="section-link" target="_blank" rel="noopener" href="/admin/etiquetas">Consultar etiquetas en otra pestaña <?=uiIcon('open_in_new')?></a><?php endif ?>
      </section>
      <section class="form-card">
        <h2><?=uiIcon('photo_library')?> Archivos</h2>
        <?php if ($module !== 'documentos'): ?><label>Descripción de la imagen <input id="alt" name="alt" maxlength="200" value="<?=e($fields['alt'] ?? '')?>"<?=invalidAttr($invalid,'alt')?>></label><?php endif ?>
        <label class="file-field"><?= $module === 'documentos' ? 'PDF (hasta ' . PDF_MIB . ' MiB)' : 'Archivo (imagen hasta ' . PHOTO_MIB . ' MiB'
                  . ($kind === 'document' ? ' o PDF hasta ' . PDF_MIB . ' MiB)' : ')') ?>
          <input id="media" type="file" name="media" accept="<?= $module === 'documentos' ? 'application/pdf' : 'image/jpeg,image/png,image/webp' . ($kind === 'document' ? ',application/pdf' : '') ?>"<?=invalidAttr($invalid,'media')?>></label>
        <?php if (!empty($row['media_id'])): ?><label class="check-field"><input type="checkbox" name="remove_media" value="1" <?= !empty($row['remove_media']) ? 'checked' : '' ?>> Quitar archivo actual</label><?php endif ?>
      </section>
      <div class="editor-save"><button class="primary"><?=uiIcon('save')?> Guardar borrador</button> <span id="save-status" role="status" aria-live="polite"></span></div>
      <div class="notice" data-resume hidden><a href="/admin/ingresar" target="_blank" rel="noopener">Ingresar en otra pestaña</a>
        <button type="button" data-resume-action>Reanudar guardado</button></div>
    </form>
    <?php endif ?>
    <?php if ($showPublication): ?>
      <section class="form-card publication-panel" aria-labelledby="publicacion">
        <h2 id="publicacion"><?=uiIcon('fact_check')?> Publicación</h2>
        <div class="actions">
          <?php $mainAction = $deleted ? 'restore' : 'publish'; ?>
          <form action="<?=e($url . '/' . $mainAction)?>" method="post">
            <?=token($user)?><input type="hidden" name="version" value="<?=e($version)?>">
            <button class="primary"><?=uiIcon($deleted ? 'undo' : 'check_circle')?> <?= $deleted ? 'Restaurar como borrador' : 'Publicar borrador guardado' ?></button>
          </form>
          <?php if (!$deleted): ?>
            <form action="<?=e($url)?>/schedule" method="post"><?=token($user)?><input type="hidden" name="version" value="<?=e($version)?>">
                <label>Fecha y hora de Lima <input id="publish_at" type="datetime-local" name="publish_at" required<?=invalidAttr($invalid,'publish_at')?>></label>
                <button><?=uiIcon('schedule')?> Programar borrador guardado</button>
            </form>
            <?php if ($future): ?><form action="<?=e($url)?>/cancel" method="post"><?=token($user)?><input type="hidden" name="version" value="<?=e($version)?>"><button>Cancelar programación</button></form><?php endif ?>
            <?php if ($visible || allowed($user, $module, 'trash')): ?>
              <details class="publication-more">
                <summary>Retiro y papelera</summary>
                <?php foreach (['unpublish'=>'Retirar publicación','trash'=>'Confirmar traslado a papelera'] as $action=>$text):
                    if (($action === 'unpublish' && !$visible) || !allowed($user, $module, $action)) continue; ?>
                  <form action="<?=e($url.'/'.$action)?>" method="post"><?=token($user)?><input type="hidden" name="version" value="<?=e($version)?>">
                    <label><?= $action === 'trash' ? 'Motivo para enviar a papelera' : 'Motivo para retirar' ?><input name="reason" required maxlength="255"></label>
                    <button class="danger"><?=e($text)?></button>
                  </form>
                <?php endforeach ?>
              </details>
            <?php endif ?>
          <?php endif ?>
        </div>
      </section>
    <?php endif ?>
    </div><?php
}

function paginate(string $path, array $params, int $page, bool $more): void
{
    if ($page === 1 && !$more) {
        return;
    }
    ?><nav class="pagination" aria-label="Paginación">
    <?php if ($page > 1): ?><a href="<?=e($path . '?' . http_build_query($params + ['pagina'=>$page-1]))?>"><?=uiIcon('chevron_left')?> Anterior</a><?php endif ?>
    <span>Página <?=e($page)?></span>
    <?php if ($more): ?><a href="<?=e($path . '?' . http_build_query($params + ['pagina'=>$page+1]))?>">Siguiente <?=uiIcon('chevron_right')?></a><?php endif ?>
    </nav><?php
}

function youtubeId(string $url): ?string
{
    $host = strtolower((string) parse_url($url, PHP_URL_HOST));
    $path = (string) parse_url($url, PHP_URL_PATH);
    parse_str((string) parse_url($url, PHP_URL_QUERY), $params);
    $value = match ($host) {
        'youtu.be' => ltrim($path, '/'),
        'youtube.com','www.youtube.com','m.youtube.com' => $path === '/watch'
            ? ($params['v'] ?? '') : (preg_match('~^/(?:shorts|embed)/([^/]+)$~D', $path, $parts) ? $parts[1] : ''),
        default => '',
    };
    return is_string($value) && preg_match('/^[A-Za-z0-9_-]{11}$/D', $value) ? $value : null;
}

function limaDisplay(string $value): string
{
    $date = new DateTimeImmutable($value, new DateTimeZone('America/Lima'));
    return $date->format(strlen($value) === 10 ? 'd/m/Y' : 'd/m/Y H:i');
}

function invalidAttr(?string $invalid, string $field): string
{
    return $invalid === $field ? ' aria-invalid="true" aria-describedby="field-error"' : '';
}

function selectOptions(string $key, array $options, string $selected, ?string $invalid = null): void
{
    ?><select id="<?=e($key)?>" name="<?=e($key)?>"<?=invalidAttr($invalid,$key)?>>
    <?php foreach ($options as $value=>$title): ?>
        <option value="<?=e($value)?>" <?= $selected === (string) $value ? 'selected' : '' ?>><?=e($title)?></option>
    <?php endforeach ?>
    </select><?php
}

function publicationLabel(string $instant): string
{
    return (new DateTimeImmutable($instant))->setTimezone(new DateTimeZone('America/Lima'))->format('d/m/Y');
}

function eventDateLabel(array $fields): string
{
    if (strlen($fields['fecha']) > 10) {
        return limaDisplay($fields['fecha']);
    }
    return limaDisplay($fields['fecha']) . ' · ' . (($fields['hora'] ?? '') ?: 'Horario por confirmar');
}

function catalogFilters(string $module, array $filters, string $search, string $tag): void
{
    if (!in_array($module, ['noticias','comunicados','eventos','galeria','documentos'], true)) {
        return;
    }
    ?><form method="get" class="catalog-filters">
      <label class="search-field">Buscar <input name="q" type="search" maxlength="200" value="<?=e($search)?>"></label>
      <?php if ($tag !== ''): ?><input type="hidden" name="etiqueta" value="<?=e($tag)?>"><?php endif ?>
      <?php if ($module === 'galeria'): ?>
        <label>Tipo <?php selectOptions('tipo', [''=>'Todos','foto'=>'Fotos','video'=>'Videos'], $filters['tipo']); ?></label>
      <?php endif ?>
      <?php if (isset($filters['anio'])): ?><label>Año <input name="anio" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" value="<?=e($filters['anio'])?>"></label><?php endif ?>
      <?php if ($module === 'comunicados'): ?>
        <label>Tipo de comunicado <?php selectOptions('aviso', [''=>'Todos'] + communicationTypes(), $filters['aviso']); ?></label>
      <?php endif ?>
      <?php if ($module === 'documentos'): ?>
        <label>Categoría <input name="categoria" list="document-categories" maxlength="255" value="<?=e($filters['categoria'])?>"></label>
        <datalist id="document-categories"><?php foreach (documentCategories() as $category): ?><option value="<?=e($category)?>"><?php endforeach ?></datalist>
      <?php endif ?>
      <?php if ($module === 'eventos'): ?>
        <label>Periodo <?php selectOptions('periodo', [''=>'Próximos','anteriores'=>'Anteriores'], $filters['periodo']); ?></label>
        <label>Mes del calendario <input type="month" name="mes" value="<?=e($filters['mes'])?>"></label>
      <?php endif ?>
      <button class="secondary"><?=uiIcon('filter_list')?> Filtrar <?= $module === 'galeria' ? 'galería' : 'publicaciones' ?></button>
      <?php if ($module === 'eventos' && $filters['mes'] === ''): ?>
        <a class="section-link" href="?mes=<?=e((new DateTimeImmutable('now', new DateTimeZone('America/Lima')))->format('Y-m'))?>">Calendario del mes</a>
      <?php endif ?>
    </form><?php
}

function documentCategories(): array
{
    return query("SELECT min(r.fields->>'categoria') FROM content c JOIN revisions r ON r.id=(" . visibleRevision() . ")
                 WHERE c.module='documentos' AND c.deleted_at IS NULL AND coalesce(r.fields->>'categoria','')<>''
                 GROUP BY editorial_slug(r.fields->>'categoria') ORDER BY 1")->fetchAll(PDO::FETCH_COLUMN);
}

function eventCalendar(string $month, array $rows): void
{
    if (!$rows) {
        emptyState('calendar_month', 'No hay eventos este mes.');
        return;
    }
    $first = new DateTimeImmutable($month . '-01', new DateTimeZone('America/Lima'));
    $byDay = [];
    foreach ($rows as $row) {
        $fields = json_decode($row['fields'], true);
        $byDay[substr($fields['fecha'],0,10)][] = $row;
    }
    ?><section aria-labelledby="calendar-title">
      <h2 id="calendar-title" class="calendar-title">Calendario <?=e($month)?></h2>
      <div class="calendar">
        <?php for ($slot=1; $slot < (int) $first->format('N'); $slot++): ?><span class="calendar-gap" aria-hidden="true"></span><?php endfor ?>
        <?php for ($day=1; $day <= (int) $first->format('t'); $day++):
            $date = $month . '-' . str_pad((string) $day, 2, '0', STR_PAD_LEFT); ?>
        <section aria-label="Día <?=$day?>"><h3><time datetime="<?=e($date)?>"><?=$day?></time></h3>
          <?php if (isset($byDay[$date])): ?><ul><?php foreach ($byDay[$date] as $row): ?>
            <li><a href="/eventos/<?=e($row['slug'])?>"><?=e($row['title'])?></a></li>
          <?php endforeach ?></ul><?php endif ?>
        </section>
        <?php endfor ?>
      </div>
    </section><?php
}

function orderForm(string $module, array $rows, array $user): void
{
    $label = modules()[$module][0];
    ?><div class="page-heading">
      <p class="breadcrumb"><a href="/admin/<?=e($module)?>"><?=uiIcon('arrow_back')?> <?=e($label)?></a><?=uiIcon('chevron_right')?> Orden</p>
      <h1>Reordenar <?=e($label)?></h1></div>
      <?php if (!$rows): ?><p>No hay elementos para reordenar.</p><?php return; endif ?>
      <?php if (isset($_GET['guardado'])): ?><p role="status" class="notice success-notice">Orden guardado.</p><?php endif ?>
      <p>Asigna posiciones únicas de 1 a <?=count($rows)?>. Guarda el conjunto completo.</p>
      <form method="post" class="form-card" data-order-form>
      <?=token($user)?><input type="hidden" name="version" value="<?=e(orderVersion($rows))?>">
      <ol class="order-list"><?php foreach ($rows as $index=>$row): ?>
        <li><span><?=e($row['title'])?></span>
          <label>Posición de <?=e($row['title'])?> <input type="number" min="1" max="<?=count($rows)?>" required
            name="positions[<?=e($row['id'])?>]" value="<?=$index+1?>"></label>
          <button type="button" data-move="-1" aria-label="Subir <?=e($row['title'])?>" hidden><?=uiIcon('arrow_upward')?> Subir</button>
          <button type="button" data-move="1" aria-label="Bajar <?=e($row['title'])?>" hidden><?=uiIcon('arrow_downward')?> Bajar</button>
        </li>
      <?php endforeach ?></ol>
      <input type="hidden" name="complete" value="1">
      <button class="primary">Guardar orden</button>
      <p role="status" data-order-status></p></form><?php
}

function tagAdmin(array $user): void
{
    ?><div class="page-heading"><p class="breadcrumb"><a href="/admin">Panel</a><?=uiIcon('chevron_right')?> Etiquetas</p><h1>Etiquetas</h1></div>
      <form method="post" class="catalog-filters"><?=token($user)?>
      <label class="search-field">Etiqueta nueva <input name="name" maxlength="50" required></label>
      <button class="primary" name="action" value="save"><?=uiIcon('add')?> Crear etiqueta</button></form>
      <ul class="records tag-records"><?php foreach (tagCatalog(true) as $tag): ?>
      <li><div class="tag-summary"><strong><?=uiIcon('label')?> <?=e($tag['name'])?></strong><span><?=e($tag['public_count'])?> publicaciones</span></div>
        <?php if (allowed($user,'etiquetas','archive')): ?>
        <form method="post" class="links catalog-filters"><?=token($user)?><input type="hidden" name="slug" value="<?=e($tag['slug'])?>">
          <?php if (!$tag['archived_at']): ?>
          <label>Nombre de <?=e($tag['name'])?> <input name="name" maxlength="50" value="<?=e($tag['name'])?>"></label>
          <button name="action" value="rename">Renombrar</button>
          <button name="action" value="archive">Archivar <?=e($tag['name'])?></button>
          <?php else: ?><button name="action" value="restore">Restaurar <?=e($tag['name'])?></button><?php endif ?>
        </form><?php endif ?>
      </li><?php endforeach ?></ul><?php
}
