<?php
declare(strict_types=1);
require dirname(__DIR__) . '/src/bootstrap.php';
require dirname(__DIR__) . '/src/security.php';
require dirname(__DIR__) . '/src/content.php';

foreach (array_keys(modules()) as $module) {
    foreach (['list','edit','preview','save','publish','unpublish','schedule','cancel','order','trash','restore'] as $action) {
        $grant = [
            'noticias' => 'list edit preview save',
            'comunicados' => 'list edit preview save',
            'eventos' => 'list edit preview save',
            'galeria' => 'list edit preview save order',
            'docentes' => 'list edit preview save order',
            'carrusel' => 'list edit preview save order',
        ][$module] ?? '';
        $editor = $grant !== '' && in_array($action, explode(' ', $grant . ' publish schedule unpublish cancel'), true);
        $matrix = ['admin'=>true, 'publisher'=>$editor, 'editor'=>$editor, ''=>false];
        foreach ($matrix as $role => $expected) {
            if (allowed(['role'=>$role],$module,$action) !== $expected) {
                throw new RuntimeException("Permiso inesperado para $role / $module / $action");
            }
        }
    }
}
$html = sanitize('<h2>Hola</h2><p><strong>Mundo</strong> <a href="https://example.org">Enlace</a></p>');
if ($html !== '<h2>Hola</h2><p><strong>Mundo</strong> <a rel="noopener noreferrer" href="https://example.org">Enlace</a></p>') {
    throw new RuntimeException('El editor perdió formato autorizado.');
}
echo "Matriz de permisos y formato admitido verificados.\n";

if (sanitize('<p><strike>Texto</strike></p>') !== '<p><s>Texto</s></p>') {
    throw new RuntimeException('El tachado del editor debe normalizarse.');
}
if (!validNewPassword(str_repeat('á', 128)) || validNewPassword(str_repeat('á', 129))) {
    throw new RuntimeException('La política de contraseñas debe medir caracteres Unicode.');
}

foreach (portalCatalog() as $section => $definition) {
    $fields = portalValues($section, []);
    $reserved = ['_csrf','version','slug','title','summary','body','tags','media','remove_media','alt'];
    if (array_intersect($reserved, array_keys($fields))) {
        throw new RuntimeException("Un campo de $section coincide con uno del formulario editorial.");
    }
    if (array_keys(portalReadFields($section, $fields)) !== array_keys($definition['fields'])) {
        throw new RuntimeException("Campos predeterminados inválidos para $section.");
    }
}
foreach (['/','/eventos?mes=2026-11','#destacados','https://colegio.example/documentos'] as $destination) {
    if (!portalLink($destination)) {
        throw new RuntimeException('Se rechazó un enlace válido del portal.');
    }
}
foreach (['//colegio.example','/\colegio.example','http://colegio.example',"/espacio\taquí",'javascript:'] as $destination) {
    if (portalLink($destination)) {
        throw new RuntimeException('Se aceptó un enlace con un formato inválido.');
    }
}
