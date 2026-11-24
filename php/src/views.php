<?php
declare(strict_types=1);

function layout(string $title, callable $render, ?array $admin = null, string $description = '', string $canonical = '', string $current = ''): void
{
    $area = $admin ? 'admin-site' : ($current === 'acceso' ? 'auth-site' : 'public-site');
    $brand = portalValues('marca');
    $menu = portalValues('menu');
    $favicon = portalRecord('icono');
    $theme = $admin ? [] : portalRecord('apariencia');
    $preview = portalPreviewContext();
    ?><!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<script src="/site-start.js"></script>
<title><?=e($title)?> | <?=e($brand['pestana'])?></title>
<?php if ($description !== ''): ?><meta name="description" content="<?=e($description)?>"><meta property="og:description" content="<?=e($description)?>"><?php endif ?>
<?php if ($canonical !== ''): ?><link rel="canonical" href="<?=e($canonical)?>"><meta property="og:url" content="<?=e($canonical)?>">
<meta property="og:title" content="<?=e($title)?>"><?php endif ?>
<link rel="icon" href="<?=e(empty($favicon['media_id']) ? '/images/escudo.jpeg' : portalMediaUrl($favicon))?>">
<link rel="stylesheet" href="/site.css">
<?php if ($theme): ?><link rel="stylesheet" href="/tema.css<?= isset($theme['preview_revision']) ? '?revision=' . e($theme['preview_revision']) : '' ?>"><?php endif ?>
<?php if ($area === 'public-site'): ?>
<link rel="stylesheet" href="/navigation.css" media="(prefers-reduced-motion: no-preference)">
<link rel="expect" href="#contenido" blocking="render" media="(prefers-reduced-motion: no-preference)">
<?php endif ?>
<script src="/site.js" defer></script></head>
<body class="<?=$area?>"><a class="skip" href="#contenido"><?=e($menu['salto'])?></a>
<header class="site-header">
  <div class="bar">
    <?php brand($admin ? '/admin' : '/'); ?>
    <button type="button" id="menu" class="icon-button" aria-label="<?=e($menu['menu'])?>" aria-controls="navigation" aria-expanded="false"><?=uiIcon('menu')?></button>
    <nav id="navigation" aria-label="<?= $admin ? 'Administración' : e($menu['lista']) ?>">
      <div class="nav-links">
      <?php if ($admin): ?>
        <a href="/admin"<?=currentAttr($current === 'panel')?>>Panel</a>
        <a href="/"><?=uiIcon('open_in_new')?> Ver sitio</a>
      <?php else: ?>
        <?php foreach (portalLinksByGroup($menu['enlaces']) as $group):
            if ($group['title'] !== ''): publicNavGroup($group['title'], $group['links'], $current);
            else: $link = $group['links'][0]; ?>
              <a href="<?=e($link['url'])?>"<?=currentAttr(portalStartsAt($link['url'],$current))?>><?=e($link['label'])?></a>
            <?php endif ?>
        <?php endforeach ?>
      <?php endif ?>
      </div>
      <div class="nav-tools">
        <?php if (!$admin && $menu['ruta_buscar'] !== '' && $menu['buscar'] !== ''): ?><a class="icon-button" href="<?=e($menu['ruta_buscar'])?>" aria-label="<?=e($menu['buscar'])?>" title="<?=e($menu['buscar'])?>"<?=currentAttr(portalStartsAt($menu['ruta_buscar'],$current))?>><?=uiIcon('search')?></a><?php endif ?>
        <button type="button" class="icon-button theme-toggle" data-theme-toggle aria-label="<?=e($menu['tema'])?>" title="<?=e($menu['tema'])?>"><span class="icon" aria-hidden="true"></span></button>
        <?php if ($admin): ?>
          <form method="post" action="/admin/salir"><?=token($admin)?><button class="button secondary"><?=uiIcon('logout')?> Cerrar sesión</button></form>
        <?php elseif ($current !== 'acceso' && $menu['personal'] !== '' && $menu['ruta_personal'] !== ''): ?>
          <a class="button access-link" href="<?=e($menu['ruta_personal'])?>"><?=uiIcon('lock')?> <?=e($menu['personal'])?></a>
        <?php endif ?>
      </div>
    </nav>
  </div>
</header>
<?php if ($preview): ?><aside class="portal-preview">
  <a class="section-link" href="<?=e($preview['editor'])?>"><?=uiIcon('arrow_back')?> Volver al editor</a>
  <strong>Vista previa del portal</strong>
  <details><summary>Revisiones recientes</summary><ul><?php foreach ($preview['revisions'] as $revision): ?>
    <li><a href="?revision=<?=e($revision['id'])?>"><?=e($revision['created_at'])?></a></li>
  <?php endforeach ?></ul></details>
</aside><?php endif ?>
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

function publicBreadcrumb(array $trail, string $current = ''): void
{
    if (($trail['/'] ?? '') === 'Inicio') {
        $trail['/'] = portalText('textos','inicio');
    }
    ?><p class="breadcrumb"><?php foreach ($trail as $href=>$label): ?>
      <a href="<?=e($href)?>"><?=e($label)?></a><?= $href !== array_key_last($trail) || $current !== '' ? uiIcon('chevron_right') : '' ?>
    <?php endforeach ?><?=e($current)?></p><?php
}

function publicHeading(string $title, array $trail = ['/'=>'Inicio'], ?callable $actions = null, bool $plain = false, string $custom = ''): void
{
    $settings = $custom === '' ? [] : portalValues($custom);
    $cover = $custom !== '' && !empty(portalRecord($custom)['media_id']);
    ?><header class="page-heading public-heading">
      <?php publicBreadcrumb($trail, $title); ?>
      <?php if ($cover): ?><div class="public-feature"><?php endif ?>
      <div class="heading-row<?= $plain && !$cover ? '' : ' feature-panel section-banner' ?>">
        <div><h1><?=e($title)?></h1>
          <?php if (!empty($settings['resumen'])): ?><p class="page-intro"><?=e($settings['resumen'])?></p><?php endif ?>
        </div>
        <?php if ($actions || (!empty($settings['accion']) && !empty($settings['destino']))): ?><div class="links">
          <?php if (!empty($settings['accion']) && !empty($settings['destino'])): ?><a class="button" href="<?=e($settings['destino'])?>"><?=e($settings['accion'])?> <?=uiIcon('arrow_forward')?></a><?php endif ?>
          <?php if ($actions): $actions(); endif ?>
        </div><?php endif ?>
      </div>
      <?php if ($cover): ?><figure class="feature-photo"><?php portalImage($custom, 'feature-image'); ?></figure></div><?php endif ?>
      <?php if (!empty($settings['contenido'])): ?><div class="page-extra rich"><?= $settings['contenido'] ?></div><?php endif ?>
    </header><?php
}

function portalImage(string $slug, string $class, bool $decorative = false, bool $hero = false, ?string $sizes = null): bool
{
    $row = portalRecord($slug);
    if (empty($row['media_id'])) {
        return false;
    }
    $fields = json_decode($row['fields'], true) ?? [];
    imageTag($row, $decorative ? '' : ($fields['alt'] ?? ''), $class, $row['preview_revision'] ?? null, $hero, $sizes);
    return true;
}

function accessView(array $session): void
{
    $settings = portalValues('acceso');
    ?><div class="login-layout">
      <div class="login-photo" aria-hidden="true"><?php if (!portalImage('acceso', 'login-image', decorative: true)): ?><img src="/images/frontis_colegio.webp" alt="" width="1360" height="1020"><?php endif ?></div>
      <section class="login-panel feature-panel">
        <div class="quick-icon"><?=uiIcon('lock')?></div>
        <h1><?=e($settings['titulo'])?></h1>
        <?php if ($settings['intro'] !== ''): ?><p><?=e($settings['intro'])?></p><?php endif ?>
        <form method="post" action="/admin/ingresar" class="editor"><?= $session ? token($session) : '' ?>
          <label><?=e($settings['usuario'])?> <input name="username" autocomplete="username" required></label>
          <label><?=e($settings['clave'])?> <input name="password" type="password" autocomplete="current-password" required></label>
          <button class="primary"><?=e($settings['boton'])?> <?=uiIcon('arrow_forward')?></button>
        </form>
        <?php if ($settings['volver'] !== '' && $settings['destino'] !== ''): ?><a class="section-link" href="<?=e($settings['destino'])?>"><?=uiIcon('arrow_back')?> <?=e($settings['volver'])?></a><?php endif ?>
      </section>
    </div><?php
}

function publicState(int $status, string $title, string $message, bool $login = false): void
{
    $settings = portalValues('estados');
    if ($status === 404 && $settings['mensaje404'] !== '') {
        $message = $settings['mensaje404'];
    }
    ?><section class="state-page">
        <span class="empty-icon"><?=uiIcon($login ? 'lock' : 'info')?></span>
        <h1><?=e($title)?></h1><p role="alert"><?=e($message)?></p>
        <a class="button secondary" href="<?= $login ? '/admin/ingresar' : '/' ?>">
            <?=uiIcon('arrow_back')?> <?=e($settings[$login ? 'ingresar' : 'volver'])?>
        </a>
        <?php if ($status >= 500): ?><small><?=e($settings['referencia'])?> <?=e(requestId())?>.</small><?php endif ?>
    </section><?php
}

function featurePhoto(array $row, array $fields): void
{
    ?><figure class="feature-photo">
      <?php imageTag($row, ($fields['alt'] ?? '') ?: $row['title'], 'feature-image',
          sizes: '(max-width: 675px) 100vw, (max-width: 920px) 75vw, (max-width: 1300px) 66vw, 812px'); ?>
    </figure><?php
}

function featureIllustration(string $name, string $alt): void
{
    ?><figure class="feature-photo">
      <img class="feature-image" src="/images/institucion/<?=e($name)?>.webp" alt="<?=e($alt)?>" width="616" height="616" loading="lazy">
      <?php if (($caption = portalText('textos','ilustracion')) !== ''): ?><figcaption><?=e($caption)?></figcaption><?php endif ?>
    </figure><?php
}

function brand(string $href): void
{
    $brand = portalValues('marca');
    ?><a class="brand" href="<?=e($href)?>">
      <span class="brand-mark"><?php if (!portalImage('marca', 'brand-image', decorative: true)): ?><img src="/images/escudo.jpeg" alt="" width="34" height="46"><?php endif ?></span>
      <span class="brand-name"><strong><?=e($brand['nombre'])?></strong><?php if ($brand['subtitulo'] !== ''): ?><small><?=e($brand['subtitulo'])?></small><?php endif ?></span>
    </a><?php
}

function moduleIcon(string $key): string
{
    return match ($key) {
        'noticias'=>'news','comunicados'=>'campaign','eventos'=>'calendar_month','galeria'=>'photo_library',
        'documentos'=>'description','docentes'=>'school','administrativos'=>'groups','directivos'=>'account_tree',
        'carrusel'=>'view_carousel','institucion'=>'account_balance','inicio'=>'web','etiquetas'=>'label','portal'=>'web',
        default=>'dashboard'
    };
}

function moduleNavigation(array $admin, string $current): void
{
    $groups = [
        'Publicaciones'=>['noticias','comunicados','eventos','galeria'],
        'Institución'=>['institucion','documentos','docentes','administrativos','directivos'],
        'Sitio web'=>['portal','inicio','carrusel','etiquetas'],
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
    $footer = portalValues('pie');
    ?><footer class="site-footer">
      <div class="footer-content">
        <?php brand('/'); ?>
        <?php foreach (portalLinksByGroup($footer['enlaces']) as $group): ?>
          <nav aria-label="<?=e($group['title'] ?: $group['links'][0]['label'])?>">
            <?php if ($group['title'] !== ''): ?><p><?=e($group['title'])?></p><?php endif ?>
            <?php foreach ($group['links'] as $link): ?><a href="<?=e($link['url'])?>"><?=e($link['label'])?></a><?php endforeach ?>
          </nav>
        <?php endforeach ?>
      </div>
      <div class="footer-base"><span><?=e($footer['leyenda'])?></span>
      <?php if ($footer['ruta_personal'] !== '' && $footer['personal'] !== ''): ?><a href="<?=e($footer['ruta_personal'])?>"><?=e($footer['personal'])?> <?=uiIcon('arrow_outward')?></a><?php endif ?></div>
    </footer><?php
}

function publicNavGroup(string $label, array $links, string $current): void
{
    ?><details class="nav-group" name="public-navigation">
      <summary><?=e($label)?> <?=uiIcon('expand_more')?></summary>
      <div class="nav-submenu">
        <?php foreach ($links as $link): ?>
          <a href="<?=e($link['url'])?>"<?=currentAttr(portalStartsAt($link['url'],$current))?>><?=e($link['label'])?></a>
        <?php endforeach ?>
      </div>
    </details><?php
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

function listCards(array $rows, bool $showModule = false, int $headingLevel = 2, string $gridClass = '', ?string $emptyMessage = null): void
{
    if (!$rows) {
        emptyState('search', $emptyMessage ?? portalText('textos','vacio'));
        return;
    }
    ?><div class="cards<?= $gridClass === '' ? '' : ' ' . e($gridClass) ?>"><?php foreach ($rows as $row): $fields = json_decode($row['fields'], true); ?>
    <article class="card content-card">
        <?php if (str_starts_with($row['media_mime'] ?? '', 'image/')): ?>
          <div class="card-photo"><?php imageTag($row, $fields['alt'] ?? '', 'card-image'); ?></div>
        <?php endif ?>
        <div class="card-body">
          <?php if ($showModule): ?><span class="card-section"><?=uiIcon(moduleIcon($row['module']))?> <?=e(portalPage($row['module'])['titulo'])?></span><?php endif ?>
          <?php if ($row['module'] === 'comunicados'): ?>
            <span class="status-chip<?= ($fields['tipo'] ?? '') === 'urgente' ? ' chip-alert' : '' ?>"><?=e(portalNoticeLabel($fields['tipo'] ?? ''))?></span>
          <?php endif ?>
          <?php if (in_array($row['module'], ['noticias','comunicados','documentos'], true) && $row['publication_date']): ?>
            <time class="card-date" datetime="<?=e($row['publication_date'])?>"><?=e(publicationLabel($row['publication_date']))?></time>
          <?php endif ?>
          <?php if (!empty($fields['fecha'])): ?><time class="card-date event-date" datetime="<?=e($fields['fecha'])?>"><?=uiIcon('calendar_month')?> <?=e(eventDateLabel($fields))?></time><?php endif ?>
          <?php if (!empty($fields['fecha_galeria'])): ?><time class="card-date" datetime="<?=e($fields['fecha_galeria'])?>"><?=e(limaDisplay($fields['fecha_galeria']))?></time><?php endif ?>
          <h<?=$headingLevel?> class="card-title"><a href="/<?=e($row['module'])?>/<?=e($row['slug'])?>"><?=e($row['title'])?></a><?=uiIcon('arrow_outward')?></h<?=$headingLevel?>>
          <?php if ($row['summary']): ?><p><?=e($row['summary'])?></p><?php endif ?>
        </div>
    </article>
    <?php endforeach ?></div><?php
}

function staffDirectory(string $module, array $rows, int $headingLevel): void
{
    $teachers = $module === 'docentes';
    ?><div class="staff-directory">
    <?php if (!$rows): ?>
      <?php emptyState(moduleIcon($module), portalPage($module)['vacio']); ?>
    <?php else: ?>
      <?php if (array_any($rows, fn(array $row) => str_starts_with($row['media_filename'] ?? '', 'perfil-demo-'))): ?>
        <p class="staff-directory-note"><?=e(portalText('textos','perfiles_demo'))?></p>
      <?php endif ?>
      <div class="staff-grid">
      <?php foreach ($rows as $row):
          $fields = json_decode($row['fields'], true) ?? [];
          $role = trim($fields['cargo'] ?? '');
          $subject = trim($fields['especialidad'] ?? '');
          $label = $teachers ? ($subject ?: $role) : ($role ?: $subject); ?>
        <article class="card staff-card">
          <div class="staff-portrait">
            <?php if (str_starts_with($row['media_mime'] ?? '', 'image/')): ?>
              <?php imageTag($row, $fields['alt'] ?? '', 'staff-photo', sizes: 'clamp(5.8rem, 15vw, 8.25rem)'); ?>
            <?php elseif (!portalImage('fotos-perfiles', 'staff-photo', sizes: 'clamp(5.8rem, 15vw, 8.25rem)')): ?>
              <?=uiIcon('groups')?>
            <?php endif ?>
          </div>
          <h<?=$headingLevel?>><?=e($row['title'])?></h<?=$headingLevel?>>
          <?php if ($label !== $row['title'] && $label !== ''): ?><p class="staff-role"><?=e($label)?></p><?php endif ?>
          <?php if (!$teachers && $subject !== '' && $subject !== $label): ?><p class="staff-subject"><?=e($subject)?></p><?php endif ?>
        </article>
      <?php endforeach ?>
      </div>
    <?php endif ?>
    </div><?php
}

function institutionInformation(array $rows): void
{
    if (!$rows) {
        emptyState('search', portalPage('institucion')['vacio']);
        return;
    }
    $overview = null;
    $groups = [];
    foreach ($rows as $row) {
        $fields = json_decode($row['fields'], true) ?? [];
        if ($row['slug'] === 'nosotros') {
            $overview = [$row, $fields];
            continue;
        }
        $section = trim($fields['seccion'] ?? '') ?: portalText('textos','seccion');
        $groups[$section][] = [$row, $fields];
    }
    ?><div class="institution-information">
      <?php if ($overview): institutionFeature($overview[0]['title'], [$overview], illustrate: false); endif ?>
      <?php foreach ($groups as $section=>$entries): institutionFeature((string) $section, $entries); endforeach ?>
    </div><?php
}

function institutionFeature(string $heading, array $entries, bool $illustrate = true): void
{
    [$first] = $entries[0];
    $headingId = 'seccion-' . $first['slug'];
    $section = $illustrate ? match (mb_strtolower($heading, 'UTF-8')) {
        'identidad institucional'=>'identidad', 'vida académica'=>'academica',
        'gestión institucional'=>'gestion', 'tecnología educativa'=>'tecnologia', default=>'',
    } : '';
    $panel = $section === '' ? '' : 'institucion-' . $section;
    $presentation = $panel === '' ? [] : portalValues($panel);
    $heading = $presentation['titulo'] ?? $heading;
    $showImage = ($presentation['imagen_visible'] ?? 'si') === 'si';
    $customImage = $showImage && $panel !== '' && !empty(portalRecord($panel)['media_id']);
    $image = $showImage && !$customImage
        ? array_find($entries, fn(array $entry) => str_starts_with($entry[0]['media_mime'] ?? '', 'image/'))
        : null;
    $imageId = (int) ($image[0]['media_id'] ?? 0);
    ?><section class="public-feature" aria-labelledby="<?=e($headingId)?>">
      <div class="feature-panel">
        <h2 id="<?=e($headingId)?>"><?=e($heading)?></h2>
        <?php if (count($entries) > 1): ?>
          <fieldset class="institution-topic-picker" aria-labelledby="<?=e($headingId)?>">
            <div class="institution-topic-options">
              <?php foreach ($entries as $index=>[$row]):
                  $id = 'tema-' . $row['slug'];
                  $contentId = 'contenido-' . $row['slug']; ?>
                <input class="institution-topic-option" type="radio" name="<?=e($headingId)?>" id="<?=e($id)?>" aria-controls="<?=e($contentId)?>"<?= $index === 0 ? ' checked' : '' ?>>
                <label id="<?=e($id)?>-nombre" for="<?=e($id)?>"><?=e($row['title'])?></label>
                <div class="institution-topic-content" id="<?=e($contentId)?>" role="region" aria-labelledby="<?=e($id)?>-nombre">
                  <?php informationBody($row, informationText($row), shownMedia: $imageId); ?>
                </div>
              <?php endforeach ?>
            </div>
          </fieldset>
        <?php else: ?>
          <?php if ($first['title'] !== $heading): ?><h3><?=e($first['title'])?></h3><?php endif ?>
          <?php informationBody($first, informationText($first), shownMedia: $imageId); ?>
        <?php endif ?>
      </div>
      <?php if ($customImage): ?><figure class="feature-photo"><?php portalImage($panel, 'feature-image'); ?></figure>
      <?php elseif ($image): featurePhoto(...$image);
      elseif ($showImage && $section !== ''): featureIllustration($section, $presentation['alt_respaldo']); endif ?>
    </section><?php
}

function informationList(array $rows): void
{
    ?><div class="information-list">
      <?php if ($rows): ?>
        <div class="information-entries">
          <?php foreach ($rows as $row): informationEntry($row); endforeach ?>
        </div>
      <?php else: emptyState('search', portalPage('administrativos')['vacio']); endif ?>
    </div><?php
}

function informationText(array $row): string
{
    if (bodyText($row['body']) !== '') {
        return $row['body'];
    }
    return $row['summary'] === '' ? '' : '<p>' . e($row['summary']) . '</p>';
}

function informationEntry(array $row): void
{
    $fields = json_decode($row['fields'], true) ?? [];
    $module = $row['module'];
    $labels = [];
    foreach (array_keys(portalFactLabels($module)) as $key) {
        $labels[$key] = portalFactLabel($module, $key);
    }
    $facts = array_filter(array_intersect_key($fields, $labels),
        fn($value) => is_string($value) && trim($value) !== '' && $value !== $row['title']);
    $body = informationText($row);

    if ($body === '' && !$facts && !$row['media_id']) {
        ?><p class="information-title"><?=e($row['title'])?></p><?php
        return;
    }
    ?><details class="information-entry" name="informacion">
      <summary><span><?=e($row['title'])?></span><?=uiIcon('expand_more')?></summary>
      <?php informationBody($row, $body, $facts, $labels); ?>
    </details><?php
}

function informationBody(array $row, string $body, array $facts = [], array $labels = [], int $shownMedia = 0): void
{
    ?><div class="information-body">
      <div class="information-copy">
        <?php if ($body !== ''): ?><div class="rich"><?= $body ?></div><?php endif ?>
        <?php if ($facts): ?><dl class="information-facts">
          <?php foreach ($facts as $key=>$value): ?>
            <div><dt><?=e($labels[$key])?></dt><dd><?=e($value)?></dd></div>
          <?php endforeach ?>
        </dl><?php endif ?>
      </div>
      <?php if ($row['media_id'] && (int) $row['media_id'] !== $shownMedia): showMedia($row); endif ?>
    </div><?php
}

function detail(array $row, ?int $preview = null): void
{
    $fields = json_decode($row['fields'] ?? '{}', true) ?? [];
    $public = $preview === null;
    $module = $row['module'];
    $person = in_array($row['module'], ['docentes','directivos','administrativos'], true);
    $cover = $public && !$person && str_starts_with($row['media_mime'] ?? '', 'image/');
    $metadata = array_filter(array_diff_key($fields, array_flip(['alt','fecha','hora'])), fn($value) => $value !== '');
    $portrait = $public && $person && !$row['media_id'] && !empty(portalRecord('fotos-perfiles')['media_id']);
    $copy = portalValues('textos');
    $tags = query('SELECT t.name,t.slug FROM revision_tags rt JOIN tags t ON t.name=rt.tag
                   WHERE rt.revision_id=? AND t.archived_at IS NULL ORDER BY t.name',
        [$preview ?? $row['id']])->fetchAll(PDO::FETCH_ASSOC);
    $showBody = $row['body'] !== '' || ($row['media_id'] && !$cover) || $portrait || $metadata || $tags;
    ?><article class="<?= $public ? 'public-story' : 'article' ?>">
    <?php if ($public):
        publicBreadcrumb(['/'=>'Inicio', '/' . $module=>portalPage($module)['titulo']]); ?>
        <header class="public-feature story-feature"><div class="feature-panel">
    <?php endif ?>
    <h1><?=e($row['title'])?></h1>
    <?php if (str_starts_with($row['media_filename'] ?? '', 'perfil-demo-')): ?><p class="staff-directory-note"><?=e($copy['perfil_demo'])?></p><?php endif ?>
    <?php if (!empty($row['publication_date']) && in_array($row['module'], ['noticias','comunicados','documentos'], true)): ?>
        <p class="article-date"><?=uiIcon('calendar_month')?> <time datetime="<?=e($row['publication_date'])?>"><?=e(publicationLabel($row['publication_date']))?></time></p>
    <?php endif ?>
    <?php if (!empty($fields['fecha'])): ?><p><?=e(eventDateLabel($fields))?></p><?php endif ?>
    <?php if ($row['summary']): ?><p class="lead"><?=e($row['summary'])?></p><?php endif ?>
    <?php if ($public): ?></div>
      <?php if ($cover): featurePhoto($row, $fields); endif ?>
      </header>
      <?php if ($showBody): ?><div class="article story-body<?= $person ? ' portrait-story' : '' ?>"><?php endif ?>
    <?php endif ?>
    <?php if (!$public || $showBody): ?>
    <?php if ($row['media_id'] && !$cover): showMedia($row, $preview);
    elseif ($portrait): portalImage('fotos-perfiles', 'media'); endif ?>
    <?php if ($row['body'] !== ''): ?><div class="rich"><?= $row['body'] ?></div><?php endif ?>
    <?php if ($metadata): ?><dl><?php foreach ($metadata as $key => $value): ?>
    <dt><?=e(portalFactLabel($module, $key))?></dt>
    <dd><?php if (in_array($key, ['video','enlace'], true)): ?><a href="<?=e($value)?>"><?=e($copy[$key === 'video' ? 'red_video' : 'enlace'])?></a>
    <?php if ($key === 'video' && ($id = youtubeId($value)) !== null): ?>
      <button type="button" data-video-id="<?=e($id)?>" data-video-title="<?=e($copy['titulo_video'])?>" hidden><?=e($copy['reproductor'])?></button>
    <?php endif ?>
    <?php else: ?><?=e(match ($key) {'fecha_galeria'=>limaDisplay($value),'tipo'=>portalNoticeLabel($value),default=>$value})?><?php endif ?></dd>
    <?php endforeach ?></dl><?php endif ?>
    <?php if ($tags): ?><p><?=e($copy['etiquetas'])?>
      <?php foreach ($tags as $tag): ?>
        <?php if ($preview === null): ?><a class="tag" href="/tags/<?=e($tag['slug'])?>"><?=e($tag['name'])?></a>
        <?php else: ?><span class="tag"><?=e($tag['name'])?></span><?php endif ?>
      <?php endforeach ?>
    </p><?php endif ?>
    <?php if ($public): ?></div><?php endif ?>
    <?php endif ?>
    </article><?php
}

function mesaPartes(?array $guide, array $contact, bool $futPublished): void
{
    $presentation = portalPage('mesa-partes');
    $cover = str_starts_with($guide['media_mime'] ?? '', 'image/');
    $instructions = $presentation['guia_local'] === 'si' ? $presentation['contenido'] : ($guide['body'] ?? $presentation['contenido']);
    ?><article class="public-story">
      <?php publicBreadcrumb(['/'=>'Inicio'], $presentation['titulo']); ?>
      <header class="public-feature story-feature">
        <div class="feature-panel">
          <h1><?=e($presentation['titulo'])?></h1>
          <p class="lead"><?=e($presentation['resumen'] ?: (($guide['summary'] ?? '') ?: $presentation['resumen_respaldo']))?></p>
          <div class="fut-access">
            <h2><?=e($presentation['fut_titulo'])?></h2>
            <p><?=e($presentation[$futPublished ? 'fut_publicado' : 'fut_modelo'])?></p>
            <a class="button" href="/mesa-partes/fut"><?=uiIcon('download')?> <?=e($presentation['fut_accion'])?></a>
          </div>
        </div>
        <?php if (!empty(portalRecord('pagina-mesa-partes')['media_id'])): ?><figure class="feature-photo"><?php portalImage('pagina-mesa-partes', 'feature-image'); ?></figure>
        <?php elseif ($cover): featurePhoto($guide, json_decode($guide['fields'], true) ?? []);
        else: featureIllustration('gestion', $presentation['alt_respaldo']); endif ?>
      </header>
      <div class="article story-body">
      <?php if (!empty($guide['media_id']) && !$cover): showMedia($guide); endif ?>
      <?php if ($instructions !== ''): ?><div class="rich"><?= $instructions ?></div><?php endif ?>
      <?php if ($presentation['enlaces']): ?><div class="links">
        <?php foreach ($presentation['enlaces'] as $link): ?>
          <a class="button secondary" href="<?=e($link['url'])?>"><?=uiIcon($link['icon'] ?: 'open_in_new')?> <?=e($link['label'])?></a>
        <?php endforeach ?>
      </div><?php endif ?>
      <?php institutionalContact($contact, $presentation['canales']); ?>
      </div>
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
        ?><p class="download-card"><a class="button secondary" href="<?=e($url)?>"><?=uiIcon('download')?> <?=e(portalText('textos','descargar'))?></a> <span>(<?=e($size)?> KiB<?= $row['module'] === 'documentos' ? ', ' . e(portalText('textos','version_documento')) . ' ' . e(documentVersion($row, $preview)) : '' ?>)</span></p><?php
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

function imageTag(array $row, string $alt, string $class, ?int $preview = null, bool $hero = false, ?string $sizes = null): void
{
    $base = '/medio/' . $row['media_id'];
    $full = $base . ($preview ? '?revision=' . $preview : '');
    $mini = $full . ($preview ? '&' : '?') . 'tam=mini';
    $width = (int) ($row['width'] ?? 0);
    $height = (int) ($row['height'] ?? 0);
    $smallWidth = max(1, (int) round($width * 640 / max(640, $width, $height)));
    $sizes ??= $hero ? '100vw' : '(max-width: 750px) 100vw, 640px';
    ?><img class="<?=e($class)?>" src="<?=e($full)?>" alt="<?=e($alt)?>"
        <?= $width && $height ? 'width="' . e($width) . '" height="' . e($height) . '"' : '' ?>
        <?= !empty($row['has_thumbnail']) && $smallWidth < $width
             ? 'srcset="' . e("$mini {$smallWidth}w, $full {$width}w") . '" sizes="' . e($sizes) . '"' : '' ?>
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
    $fields = json_decode($settings['fields'] ?? '{}', true) ?? [];
    $slides = homeSection(fn() => published('carrusel'));
    $galleryOptions = portalValues('bloque-galeria');
    $gallery = homeSection(fn() => published('galeria', limit: (int) $galleryOptions['cantidad'] + 1));
    $blocks = [
        'bloque-accesos'=>fn(array $options) => homeShortcuts($options, $fields),
        'bloque-actualidad'=>fn() => homeNewsroom(),
        'bloque-formacion'=>fn(array $options) => homeFormation($settings['body'] ?? '', $fields, $gallery ?? [], $options['titulo']),
        'bloque-galeria'=>fn(array $options) => homeGallery($options, $gallery),
        'bloque-destacados'=>fn(array $options) => homeHighlights($options, $slides),
        'bloque-cifras'=>fn(array $options) => homeMetrics($options, $fields),
        'bloque-contacto'=>fn(array $options) => institutionalContact($fields, $options['titulo'], $options),
    ];
    ?><div class="home">
    <?php homeCover($settings, $fields, $slides ?? [], $preview); ?>
    <?php foreach (visiblePortalBlocks(array_keys($blocks)) as $key=>$options):
        $blocks[$key]($options);
    endforeach ?>
    </div><?php
}

function homeCover(?array $settings, array $fields, array $slides, ?int $preview): void
{
    $options = portalValues('portada');
    $title = $settings['title'] ?? $options['titulo_respaldo'];
    if ($options['visible'] !== 'si') { ?>
        <h1 class="visually-hidden"><?=e($title)?></h1><?php
        return;
    }
    $selectable = ($fields['hero_modo'] ?? '') === 'carrusel'
        ? array_values(array_filter($slides, static fn(array $row) => str_starts_with($row['media_mime'] ?? '', 'image/'))) : [];
    $hero = $selectable[0] ?? $settings;
    $heroPreview = $selectable ? null : $preview;
    if (!empty($hero['media_id']) && !isset($hero['media_mime'])) {
        $hero += mediaInfo((int) $hero['media_id']);
    }
    ?><section class="hero">
      <div class="hero-copy home-inner">
        <h1><?=e($title)?></h1>
        <p><?=e(($fields['lema'] ?? '') ?: (($settings['summary'] ?? '') ?: $options['texto_respaldo']))?></p>
        <?php if ($options['accion'] !== '' && $options['destino'] !== ''): ?><div class="hero-actions">
          <a class="button" href="<?=e($options['destino'])?>"><?=e($options['accion'])?> <?=uiIcon('arrow_forward')?></a>
        </div><?php endif ?>
        <?php if ($selectable): ?>
          <div class="hero-slides" role="group" aria-label="<?=e($options['diapositivas'])?>"><?php foreach ($selectable as $index=>$slide):
            $slideFields = json_decode($slide['fields'], true); ?>
            <button type="button" data-hero-slide="/medio/<?=e($slide['media_id'])?>"
                data-slide-alt="<?=e(($slideFields['alt'] ?? '') ?: $slide['title'])?>"
                data-slide-width="<?=e($slide['width'] ?? 0)?>" data-slide-height="<?=e($slide['height'] ?? 0)?>"
                data-slide-small="<?= $slide['has_thumbnail'] ? '1' : '0' ?>"
                aria-label="<?=e($slide['title'])?>" title="<?=e($slide['title'])?>"
                aria-pressed="<?= $index === 0 ? 'true' : 'false' ?>" hidden><span aria-hidden="true"><?=$index+1?></span></button>
          <?php endforeach ?>
          <?php if (portalText('bloque-destacados','visible') === 'si' && $options['ver_diapositivas'] !== ''): ?><a href="#destacados"><?=e($options['ver_diapositivas'])?></a><?php endif ?>
          </div>
        <?php endif ?>
      </div>
      <div class="hero-visual">
      <?php if (!empty($hero['media_id'])):
        $heroFields = json_decode($hero['fields'], true);
        imageTag($hero, ($heroFields['alt'] ?? '') ?: $options['alt_portada'], 'hero-image', $heroPreview, true);
      elseif (!portalImage('portada', 'hero-image', hero: true)): ?><img src="/images/frontis_colegio.webp"
        srcset="/images/frontis_colegio-640.webp 640w, /images/frontis_colegio.webp 1360w" sizes="100vw"
        alt="<?=e($options['alt_respaldo'])?>" width="1360" height="1020" fetchpriority="high"><?php endif ?>
      </div>
    </section>
    <?php if ($settings === null): ?><div class="home-inner"><?php homeUnavailable($options['error']); ?></div><?php endif ?>
    <?php
}

function homeShortcuts(array $options, array $fields): void
{
    $links = $options['enlaces'];
    if (!empty($fields['acceso_texto']) && !empty($fields['acceso_url'])) {
        $links[] = ['label'=>$fields['acceso_texto'],'url'=>$fields['acceso_url'],'icon'=>'open_in_new'];
    }
    if (!$links) {
        return;
    }
    ?><section class="shortcut-section" aria-labelledby="accesos"><div class="home-inner">
      <div class="section-head"><h2 id="accesos"><?=e($options['titulo'])?></h2></div>
      <ul class="quick-grid">
      <?php foreach ($links as $link): ?>
        <li><a href="<?=e($link['url'])?>"><span class="quick-icon"><?=uiIcon($link['icon'] ?: 'open_in_new')?></span><strong><?=e($link['label'])?></strong><?=uiIcon('arrow_outward')?></a></li>
      <?php endforeach ?></ul>
    </div></section><?php
}

function homeNewsroom(): void
{
    $options = visiblePortalBlocks(['bloque-noticias','bloque-eventos','bloque-comunicados']);
    if (!$options) {
        return;
    }
    $news = $options['bloque-noticias'] ?? [];
    $agenda = array_diff_key($options, ['bloque-noticias'=>true]);
    ?><div class="home-inner home-newsroom<?= array_key_first($options) !== 'bloque-noticias' && $news ? ' agenda-first' : '' ?>">
      <?php if ($agenda && array_key_first($options) !== 'bloque-noticias'): homeAgenda($agenda); endif ?>
      <?php if ($news):
          $rows = homeSection(fn() => published('noticias', limit: (int) $news['cantidad'])); ?>
        <section class="home-news" aria-labelledby="novedades">
          <div class="section-head"><h2 id="novedades"><?=e($news['titulo'])?></h2><?php homeSectionAction($news); ?></div>
          <?php if ($rows === null): homeUnavailable($news['error']);
          elseif ($rows): listCards($rows, headingLevel: 3, gridClass: 'news-cards');
          else: emptyState('news', $news['vacio']); endif ?>
        </section>
      <?php endif ?>
      <?php if ($agenda && array_key_first($options) === 'bloque-noticias'): homeAgenda($agenda); endif ?>
    </div><?php
}

function homeAgenda(array $agenda): void
{
    ?><div class="home-agenda"><?php foreach ($agenda as $key=>$options):
        $module = substr($key, strlen('bloque-'));
        $rows = homeSection(fn() => published($module, limit: (int) $options['cantidad']));
        homeOverview($module, $options, $rows);
    endforeach ?></div><?php
}

function homeSectionAction(array $options, string $icon = 'arrow_forward'): void
{
    if ($options['accion'] !== '' && $options['destino'] !== ''): ?>
      <a class="section-link" href="<?=e($options['destino'])?>"><?=e($options['accion'])?> <?=uiIcon($icon)?></a>
    <?php endif;
}

function homeUnavailable(string $message): void
{
    ?><p class="notice" role="status"><?=e($message)?> <a href="/"><?=e(portalText('textos','reintentar'))?></a></p><?php
}

function homeGallery(array $options, ?array $rows): void
{
    if (!$rows && $rows !== null && $options['vacio'] === '') {
        return;
    }
    ?><section class="home-inner home-section home-gallery">
      <div class="section-head"><h2><?=e($options['titulo'])?></h2><?php homeSectionAction($options); ?></div>
      <?php if ($rows === null): homeUnavailable($options['error']);
      else: listCards(array_slice($rows, 0, (int) $options['cantidad']), headingLevel: 3, gridClass: 'gallery-cards', emptyMessage: $options['vacio']); endif ?>
    </section><?php
}

function homeHighlights(array $options, ?array $rows): void
{
    if ($rows === []) {
        return;
    }
    ?><section class="home-inner home-section" id="destacados">
      <div class="section-head"><h2><?=e($options['titulo'])?></h2></div>
      <?php if ($rows === null): homeUnavailable($options['error']);
      else: ?><div class="slides" tabindex="0" aria-label="<?=e($options['grupo'])?>">
        <?php foreach ($rows as $slide): $data = json_decode($slide['fields'], true); ?>
          <article class="card content-card">
            <?php if ($slide['media_id']): ?><div class="card-photo"><?php showMedia($slide); ?></div><?php endif ?>
            <div class="card-body"><h3><?=e($slide['title'])?></h3>
              <?php if ($slide['summary']): ?><p><?=e($slide['summary'])?></p><?php endif ?>
              <?php homeSectionAction(['accion'=>$options['accion'],'destino'=>$data['enlace'] ?? ''], 'arrow_outward'); ?>
            </div>
          </article>
        <?php endforeach ?>
      </div><?php endif ?>
    </section><?php
}

function homeMetrics(array $options, array $fields): void
{
    $metrics = [];
    for ($i=1; $i<=4; $i++) {
        $value = $fields["metrica{$i}_valor"] ?? '';
        $caption = $fields["metrica{$i}_etiqueta"] ?? '';
        $source = $fields["metrica{$i}_fuente"] ?? '';
        if ($value !== '' && $caption !== '' && $source !== '') {
            $metrics[] = [$value, $caption, $source, $fields["metrica{$i}_fecha"] ?? ''];
        }
    }
    if (!$metrics) {
        return;
    }
    ?><section class="home-inner home-section">
      <?php if ($options['titulo'] !== ''): ?><div class="section-head"><h2><?=e($options['titulo'])?></h2></div><?php endif ?>
      <div class="metrics"><?php foreach ($metrics as [$value,$caption,$source,$date]): ?>
        <p><strong><?=e($value)?></strong> <?=e($caption)?> <a href="<?=e($source)?>"><?=e($options['fuente'])?> <?=e($date)?></a></p>
      <?php endforeach ?></div>
    </section><?php
}

function homeOverview(string $module, array $options, ?array $rows): void
{
    $months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    ?><section class="overview-panel" aria-labelledby="inicio-<?=e($module)?>">
      <h2 id="inicio-<?=e($module)?>"><?=e($options['titulo'])?></h2>
      <?php if ($rows === null): homeUnavailable(portalText('textos','sin_servicio')); ?>
      <?php elseif ($rows): ?>
        <ul class="overview-list"><?php foreach ($rows as $row):
            $data = json_decode($row['fields'], true);
            $event = $module === 'eventos' && !empty($data['fecha']);
            ?>
            <li>
              <?php if ($event):
                  $date = new DateTimeImmutable($data['fecha'], new DateTimeZone('America/Lima')); ?>
                <time class="overview-date" datetime="<?=e($date->format('Y-m-d'))?>" aria-hidden="true"><span><?=e($months[(int) $date->format('n') - 1])?></span><strong><?=e($date->format('d'))?></strong></time>
              <?php else: ?><span class="quick-icon"><?=uiIcon(moduleIcon($module))?></span><?php endif ?>
              <div>
                <a href="/<?=e($module)?>/<?=e($row['slug'])?>"><?=e($row['title'])?></a>
                <?php if ($event): ?><small><?=e(eventDateLabel($data))?></small>
                <?php elseif ($row['publication_date']): ?><small><?=e(publicationLabel($row['publication_date']))?></small><?php endif ?>
              </div>
            </li>
        <?php endforeach ?></ul>
      <?php else: ?><p class="muted"><?=e($options['vacio'])?></p><?php endif ?>
      <?php homeSectionAction($options); ?>
    </section><?php
}

function homeFormation(string $intro, array $fields, array $gallery, string $title): void
{
    $pillars = array_filter([1,2,3], fn(int $i) => !empty($fields["pilar{$i}_titulo"]));
    if ($intro === '' && !$pillars) {
        return;
    }
    $sizes = '(max-width: 675px) 100vw, (max-width: 1280px) 46vw, 570px';
    ?><section class="home-formation"><div class="home-inner">
      <?php if (!portalImage('bloque-formacion', 'formation-image', sizes: $sizes)
              && ($image = array_find(array_reverse($gallery), fn(array $row) => str_starts_with($row['media_mime'] ?? '', 'image/')))):
          $data = json_decode($image['fields'], true);
          imageTag($image, ($data['alt'] ?? '') ?: $image['title'], 'formation-image', sizes: $sizes);
      endif ?>
      <div class="formation-copy">
        <h2><?=e($title)?></h2>
        <?php if ($intro !== ''): ?><div class="home-intro rich"><?= $intro ?></div><?php endif ?>
        <?php if ($pillars): ?><div class="formation-pillars">
          <?php foreach ($pillars as $i): ?><div>
            <h3><?=e($fields["pilar{$i}_titulo"])?></h3>
            <?php if (!empty($fields["pilar{$i}_desc"])): ?><p><?=e($fields["pilar{$i}_desc"])?></p><?php endif ?>
          </div><?php endforeach ?>
        </div><?php endif ?>
      </div>
    </div></section><?php
}

function institutionalContact(array $fields, string $title, array $action = []): void
{
    $home = $action !== [];
    $hasAction = $home && $action['accion'] !== '' && $action['destino'] !== '';
    if ($hasAction || array_filter(array_intersect_key($fields, array_flip(['direccion','correo','telefono','red_social'])))): ?>
      <?php if ($home): ?><div class="home-inner"><?php endif ?>
      <section class="home-section contact-section"><div><h2><?=e($title)?></h2><address>
      <?php foreach (['direccion'=>'location_on','correo'=>'mail','telefono'=>'call'] as $key=>$icon): if (!empty($fields[$key])): ?>
        <span><?=uiIcon($icon)?> <?=e($fields[$key])?></span>
      <?php endif; endforeach ?>
      <?php if (!empty($fields['red_social'])): ?><a href="<?=e($fields['red_social'])?>"><?=e(portalText('textos','red_social'))?> <?=uiIcon('arrow_outward')?></a><?php endif ?>
      </address></div>
      <?php if ($hasAction): ?><a class="button" href="<?=e($action['destino'])?>"><?=e($action['accion'])?> <?=uiIcon('arrow_forward')?></a><?php endif ?>
      </section>
      <?php if ($home): ?></div><?php endif ?>
    <?php endif;
}

function statusChip(string $label, string $tone = ''): void
{
    ?><span class="status-chip<?= $tone ? ' chip-' . e($tone) : '' ?>"><?=e($label)?></span><?php
}

function editForm(string $module, int $id, array $row, array $user, ?HttpError $error = null): void
{
    [$label,$labels,$kind] = modules()[$module];
    $portal = $module === 'portal' ? (portalCatalog()[$row['slug']] ?? fail(404, 'Sección no encontrada.')) : null;
    $staff = in_array($module, ['directivos','docentes'], true);
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
        <div class="heading-row"><h1><?= $portal ? e($portal['name']) : ($id ? e(($row['title'] ?? '') ?: 'Editar contenido') : 'Nuevo contenido') ?></h1>
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
      <?php if (in_array($invalid, [...array_keys($portal['fields'] ?? $labels),'title','slug','summary','body','tags','alt','media','publish_at'], true)): ?>
      <p><a href="#<?= isset($portal['fields'][$invalid]) ? 'portal-' : '' ?><?=e($invalid)?>">Ir al campo para corregir</a></p><?php endif ?>
      <?php if ($conflict && $id): ?><p>Los datos de este intento siguen en el formulario.
        <a target="_blank" rel="noopener" href="<?=e($url)?>">Abrir la edición vigente en otra pestaña</a>.</p><?php endif ?>
    </div><?php endif ?>
    <?php if (isset($_GET['guardado'])): ?><p role="status" class="notice success-notice"><?=uiIcon('check_circle')?> Borrador guardado.</p><?php endif ?>
    <div class="editor-layout<?= $showPublication ? ' with-inspector' : '' ?>">
    <?php if (!$deleted): ?>
    <form class="editor" method="post" action="<?=e($url)?>/guardar" enctype="multipart/form-data" <?= $portal ? 'data-portal-editor' : ($id ? 'data-autosave' : '') ?>>
      <?=token($user)?><input type="hidden" name="version" value="<?=e($version)?>">
      <?php if ($portal): portalEditorFields($portal, $row, $invalid);
      else: ?>
      <section class="form-card">
        <h2><?=uiIcon('edit_note')?> Contenido</h2>
        <label><?= $staff ? 'Nombre completo' : 'Título' ?> <input id="title" name="title" value="<?=e($row['title'] ?? '')?>" required maxlength="255"<?=invalidAttr($invalid,'title')?>></label>
        <label>Resumen <textarea id="summary" name="summary" rows="2" maxlength="1000"<?=invalidAttr($invalid,'summary')?>><?=e($row['summary'] ?? '')?></textarea></label>
        <div class="editor-body">
          <label for="body">Contenido</label>
          <textarea id="body" name="body" rows="10"<?=invalidAttr($invalid,'body')?>><?=e($row['body'] ?? '')?></textarea>
        </div>
      </section>
      <section class="form-card">
        <h2><?=uiIcon('description')?> Datos de la publicación</h2>
        <div class="field-grid">
          <label>Identificador de URL <input id="slug" name="slug" value="<?=e($row['slug'] ?? '')?>" pattern="[a-z0-9]+(-[a-z0-9]+)*" maxlength="120" <?= $id ? 'readonly' : 'placeholder="Se genera a partir del ' . ($staff ? 'nombre' : 'título') . '"' ?><?=invalidAttr($invalid,'slug')?>></label>
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
        <label class="file-field"><?= match (true) {
            $staff => 'Foto de perfil (hasta ' . PHOTO_MIB . ' MiB)',
            $module === 'documentos' => 'PDF (hasta ' . PDF_MIB . ' MiB)',
            $kind === 'document' => 'Archivo (imagen hasta ' . PHOTO_MIB . ' MiB o PDF hasta ' . PDF_MIB . ' MiB)',
            default => 'Archivo (imagen hasta ' . PHOTO_MIB . ' MiB)',
        } ?>
          <input id="media" type="file" name="media" accept="<?= $module === 'documentos' ? 'application/pdf' : 'image/jpeg,image/png,image/webp' . ($kind === 'document' ? ',application/pdf' : '') ?>"<?=invalidAttr($invalid,'media')?>></label>
        <?php if (!empty($row['media_id'])): ?><label class="check-field"><input type="checkbox" name="remove_media" value="1" <?= !empty($row['remove_media']) ? 'checked' : '' ?>> Quitar archivo actual</label><?php endif ?>
      </section>
      <?php endif ?>
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
    $labels = str_starts_with($path, '/admin/') ? portalValues('textos', []) : portalValues('textos');
    ?><nav class="pagination" aria-label="<?=e($labels['paginacion'])?>">
    <?php if ($page > 1): ?><a href="<?=e($path . '?' . http_build_query($params + ['pagina'=>$page-1]))?>"><?=uiIcon('chevron_left')?> <?=e($labels['anterior'])?></a><?php endif ?>
    <span><?=e($labels['pagina'])?> <?=e($page)?></span>
    <?php if ($more): ?><a href="<?=e($path . '?' . http_build_query($params + ['pagina'=>$page+1]))?>"><?=e($labels['siguiente'])?> <?=uiIcon('chevron_right')?></a><?php endif ?>
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

function selectOptions(string $key, array $options, string $selected, ?string $invalid = null, ?string $id = null): void
{
    ?><select id="<?=e($id ?? $key)?>" name="<?=e($key)?>"<?=invalidAttr($invalid,$key)?>>
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
    return limaDisplay($fields['fecha']) . ' · ' . (($fields['hora'] ?? '') ?: portalText('textos','sin_hora'));
}

function catalogFilters(string $module, array $filters, string $search, string $tag): void
{
    if (!in_array($module, ['noticias','comunicados','eventos','galeria','documentos'], true)) {
        return;
    }
    $labels = portalValues('filtros');
    ?><form method="get" class="catalog-filters">
      <label class="search-field"><?=e($labels['buscar'])?> <input name="q" type="search" maxlength="200" value="<?=e($search)?>"></label>
      <?php if ($tag !== ''): ?><input type="hidden" name="etiqueta" value="<?=e($tag)?>"><?php endif ?>
      <?php if ($module === 'galeria'): ?>
        <label><?=e($labels['tipo'])?> <?php selectOptions('tipo', [''=>$labels['todos'],'foto'=>$labels['foto'],'video'=>$labels['video']], $filters['tipo']); ?></label>
      <?php endif ?>
      <?php if (isset($filters['anio'])): ?><label><?=e($labels['anio'])?> <input name="anio" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" value="<?=e($filters['anio'])?>"></label><?php endif ?>
      <?php if ($module === 'comunicados'): ?>
        <label><?=e($labels['comunicado'])?> <?php selectOptions('aviso', [''=>$labels['todos']] + portalValues('avisos'), $filters['aviso']); ?></label>
      <?php endif ?>
      <?php if ($module === 'documentos'): ?>
        <label><?=e($labels['categoria'])?> <input name="categoria" list="document-categories" maxlength="255" value="<?=e($filters['categoria'])?>"></label>
        <datalist id="document-categories"><?php foreach (documentCategories() as $category): ?><option value="<?=e($category)?>"><?php endforeach ?></datalist>
      <?php endif ?>
      <?php if ($module === 'eventos'): ?>
        <label><?=e($labels['periodo'])?> <?php selectOptions('periodo', [''=>$labels['proximos'],'anteriores'=>$labels['anteriores']], $filters['periodo']); ?></label>
        <label><?=e($labels['mes'])?> <input type="month" name="mes" value="<?=e($filters['mes'])?>"></label>
      <?php endif ?>
      <button class="secondary"><?=uiIcon('filter_list')?> <?=e($labels[$module === 'galeria' ? 'filtrar_galeria' : 'filtrar'])?></button>
      <?php if ($module === 'eventos' && $filters['mes'] === ''): ?>
        <a class="section-link" href="?mes=<?=e((new DateTimeImmutable('now', new DateTimeZone('America/Lima')))->format('Y-m'))?>"><?=e($labels['calendario_mes'])?></a>
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
    $labels = portalValues('filtros');
    if (!$rows) {
        emptyState('calendar_month', $labels['vacio']);
        return;
    }
    $first = new DateTimeImmutable($month . '-01', new DateTimeZone('America/Lima'));
    $byDay = [];
    foreach ($rows as $row) {
        $fields = json_decode($row['fields'], true);
        $byDay[substr($fields['fecha'],0,10)][] = $row;
    }
    ?><section aria-labelledby="calendar-title">
      <h2 id="calendar-title" class="calendar-title"><?=e($labels['calendario'])?> <?=e($month)?></h2>
      <div class="calendar">
        <?php for ($slot=1; $slot < (int) $first->format('N'); $slot++): ?><span class="calendar-gap" aria-hidden="true"></span><?php endfor ?>
        <?php for ($day=1; $day <= (int) $first->format('t'); $day++):
            $date = $month . '-' . str_pad((string) $day, 2, '0', STR_PAD_LEFT); ?>
        <section aria-label="<?=e($labels['dia'])?> <?=$day?>"><h3><time datetime="<?=e($date)?>"><?=$day?></time></h3>
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
