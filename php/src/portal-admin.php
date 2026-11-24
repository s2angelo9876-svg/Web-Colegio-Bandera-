<?php
declare(strict_types=1);

function portalAdmin(): void
{
    $visible = '(' . visibleRevision() . ')';
    $rows = query("SELECT c.id,c.slug,c.deleted_at,$visible IS NOT NULL AS visible,c.publish_at>now() AS future
                   FROM content c WHERE c.module='portal'")->fetchAll(PDO::FETCH_ASSOC);
    $records = array_column($rows, null, 'slug');
    $resources = query("SELECT module,id FROM content WHERE (module='institucion' AND slug='mesa-partes')
                        OR (module='documentos' AND slug=?)", [FUT_DOCUMENT_SLUG])->fetchAll(PDO::FETCH_KEY_PAIR);
    $guide = isset($resources['institucion']) ? '/admin/institucion/' . $resources['institucion'] : '/admin/institucion';
    $fut = isset($resources['documentos']) ? '/admin/documentos/' . $resources['documentos'] : '/admin/documentos';
    $groups = [];
    foreach (portalCatalog() as $key=>$definition) {
        $groups[$definition['group']][$key] = $definition['name'];
    }
    ?><div class="page-heading">
      <p class="breadcrumb"><a href="/admin">Panel</a><?=uiIcon('chevron_right')?> Sitio web</p>
      <h1>Diseño y contenido del portal</h1>
      <p>Elige una sección, guarda un borrador y revisa la vista previa antes de publicar.</p>
    </div>
    <div class="links portal-admin-shortcuts">
      <a class="button secondary" href="/admin/inicio"><?=uiIcon('web')?> Textos, portada y contacto de Inicio</a>
      <a class="button secondary" href="<?=e($guide)?>"><?=uiIcon('edit_note')?> Guía de Mesa de Partes</a>
      <a class="button secondary" href="<?=e($fut)?>"><?=uiIcon('download')?> Formulario Único de Trámite</a>
    </div>
    <div class="portal-admin-grid">
      <?php foreach ($groups as $heading=>$entries): ?>
        <section class="form-card">
          <h2><?=e($heading)?></h2>
          <ul class="portal-catalog">
            <?php foreach ($entries as $key=>$label):
                $record = $records[$key] ?? null;
                $href = $record ? '/admin/portal/' . $record['id'] : '/admin/portal/nuevo?seccion=' . $key;
                [$status,$tone] = match (true) {
                    !$record => ['Predeterminado',''],
                    (bool) $record['deleted_at'] => ['En papelera','alert'],
                    (bool) $record['visible'] => ['Publicado','success'],
                    (bool) $record['future'] => ['Programado','planned'],
                    default => ['Borrador',''],
                }; ?>
              <li><a href="<?=e($href)?>"><?=e($label)?> <?=uiIcon('chevron_right')?></a><?php statusChip($status, $tone); ?></li>
            <?php endforeach ?>
          </ul>
        </section>
      <?php endforeach ?>
    </div><?php
}

function portalEditorFields(array $definition, array $row, ?string $invalid): void
{
    $slug = $row['slug'];
    $stored = json_decode($row['fields'] ?? '{}', true) ?? [];
    $values = portalValues($slug, $stored);
    ?><input type="hidden" name="slug" value="<?=e($slug)?>">
    <?php if ($definition['fields']): ?><section class="form-card">
      <h2><?=uiIcon('edit_note')?> <?=e($definition['name'])?></h2>
      <div class="field-grid">
        <?php foreach ($definition['fields'] as $key=>[$label,$type]):
            $value = $values[$key];
            $inputId = 'portal-' . $key;
            if ($type === 'links') {
                portalLinkEditor($key, $label, is_array($value) ? $value : [], $invalid,
                    in_array($slug, ['menu','pie'], true), in_array($slug, ['bloque-accesos','pagina-mesa-partes'], true));
                continue;
            }
            if ($type === 'html') { ?>
                <div class="editor-body portal-field-wide">
                  <label id="<?=e($inputId)?>-label" for="<?=e($inputId)?>"><?=e($label)?></label>
                  <textarea id="<?=e($inputId)?>" name="<?=e($key)?>" rows="9" maxlength="24000" data-rich aria-labelledby="<?=e($inputId)?>-label"<?=invalidAttr($invalid,$key)?>><?=e($value)?></textarea>
                </div><?php
                continue;
            }
            $choices = portalChoices($type);
            $inputType = match ($type) {'color'=>'color', 'order','count'=>'number', default=>'text'};
            $wide = in_array($type, ['paragraph','url'], true);
            ?><label<?= $wide ? ' class="portal-field-wide"' : '' ?>><?=e($label)?>
              <?php if ($choices): selectOptions($key, $choices, $value, $invalid, $inputId);
              elseif ($type === 'paragraph'): ?>
                <textarea id="<?=e($inputId)?>" name="<?=e($key)?>" rows="3" maxlength="1000"<?=invalidAttr($invalid,$key)?>><?=e($value)?></textarea>
              <?php else: ?><input id="<?=e($inputId)?>" name="<?=e($key)?>" type="<?=e($inputType)?>"
                  <?= $type === 'order' ? 'min="0" max="999" required' : ($type === 'count' ? 'min="1" max="48" required' : 'maxlength="' . ($type === 'url' ? 500 : 255) . '"') ?>
                  value="<?=e($value)?>"<?=invalidAttr($invalid,$key)?>><?php endif ?>
            </label><?php
        endforeach ?>
      </div>
    </section><?php endif ?>
    <?php if ($definition['image'] !== ''): ?><section class="form-card">
      <h2><?=uiIcon('photo_library')?> <?=e($definition['image'])?></h2>
      <?php if (!empty($row['media_id']) && !empty($row['working'])): ?>
        <img class="portal-asset-preview" alt="" src="/medio/<?=e($row['media_id'])?>?revision=<?=e($row['working'])?>">
      <?php endif ?>
      <?php if ($slug !== 'icono'): ?><label>Descripción de la imagen <input id="alt" name="alt" maxlength="200" value="<?=e($stored['alt'] ?? '')?>"<?=invalidAttr($invalid,'alt')?>></label><?php endif ?>
      <label class="file-field">Subir imagen (hasta <?=PHOTO_MIB?> MiB)
        <input id="media" type="file" name="media" accept="image/jpeg,image/png,image/webp"<?=invalidAttr($invalid,'media')?>></label>
      <?php if (!empty($row['media_id'])): ?><label class="check-field"><input type="checkbox" name="remove_media" value="1"<?= !empty($row['remove_media']) ? ' checked' : '' ?>> Quitar imagen personalizada</label><?php endif ?>
    </section><?php endif;
}

function portalLinkEditor(string $key, string $label, array $rows, ?string $invalid, bool $group, bool $icon): void
{
    $rows = array_values(array_filter(array_slice($rows, 0, 40), 'is_array'));
    if (count($rows) < 40) {
        $rows[] = [];
    }
    ?><fieldset id="portal-<?=e($key)?>" class="portal-field-wide portal-link-editor" data-link-editor tabindex="-1"<?=invalidAttr($invalid,$key)?>>
      <legend><?=e($label)?></legend>
      <p>Usa rutas del portal como /noticias o enlaces HTTPS. La lista respeta el orden de las filas.</p>
      <div data-link-rows>
        <?php foreach ($rows as $index=>$row): portalLinkInputs($key, (string) $index, $row, $group, $icon); endforeach ?>
      </div>
      <template data-link-template><?php portalLinkInputs($key, '__INDEX__', [], $group, $icon); ?></template>
      <button type="button" data-link-add hidden><?=uiIcon('add')?> Añadir enlace</button>
    </fieldset><?php
}

function portalLinkInputs(string $key, string $index, array $row, bool $group, bool $icon): void
{
    $prefix = e($key . '[' . $index . ']');
    $value = static fn(string $field): string => is_string($row[$field] ?? null) ? $row[$field] : '';
    ?><div class="portal-link-row" data-link-row>
      <label>Texto <input name="<?=$prefix?>[label]" maxlength="100" value="<?=e($value('label'))?>"></label>
      <label>Destino <input name="<?=$prefix?>[url]" maxlength="500" value="<?=e($value('url'))?>"></label>
      <?php if ($group): ?><label>Grupo opcional <input name="<?=$prefix?>[group]" maxlength="100" value="<?=e($value('group'))?>"></label><?php endif ?>
      <?php if ($icon): ?><label>Icono <select name="<?=$prefix?>[icon]">
        <?php foreach (portalIcons() as $id=>$label): ?><option value="<?=e($id)?>"<?= $id === $value('icon') ? ' selected' : '' ?>><?=e($label)?></option><?php endforeach ?>
      </select></label><?php endif ?>
      <div class="portal-link-actions">
        <button type="button" data-link-move="-1" hidden><?=uiIcon('arrow_upward')?> Subir</button>
        <button type="button" data-link-move="1" hidden><?=uiIcon('arrow_downward')?> Bajar</button>
        <label class="check-field"><input type="checkbox" name="<?=$prefix?>[remove]" value="1"<?= $value('remove') === '1' ? ' checked' : '' ?>> Quitar</label>
      </div>
    </div><?php
}
