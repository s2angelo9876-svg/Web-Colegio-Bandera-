<?php
declare(strict_types=1);

function portalCatalog(): array
{
    static $catalog;
    if ($catalog !== null) {
        return $catalog;
    }
    $definition = static fn(string $group, string $name, string $route, array $fields, string $image = '') =>
        compact('group', 'name', 'route', 'fields', 'image');
    $link = static fn(string $label, string $url, string $group = '', string $icon = '') =>
        compact('label', 'url', 'group', 'icon');
    $identity = 'Identidad y navegación';
    $home = 'Página de inicio';
    $pages = 'Páginas públicas';
    $details = 'Textos y recursos';
    $block = static fn(string $title, int $order, array $fields = []) => [
        'titulo'=>['Título visible','text',$title],
        'visible'=>['Mostrar en Inicio','toggle','si'],
        'orden'=>['Orden en Inicio','order',(string) $order],
        ...$fields,
    ];
    $action = static fn(string $label, string $url) => [
        'accion'=>['Texto del enlace','text',$label],
        'destino'=>['Destino del enlace','url',$url],
    ];
    $catalog = [
        'marca'=>$definition($identity, 'Nombre y logotipo', '/', [
            'nombre'=>['Nombre junto al logotipo','text','Bandera del Perú'],
            'subtitulo'=>['Subtítulo del logotipo','text','Institución educativa'],
            'pestana'=>['Nombre del sitio en el navegador','text','I.E. Bandera del Perú'],
        ], 'Logotipo'),
        'icono'=>$definition($identity, 'Icono de la pestaña', '/', [], 'Icono de la pestaña'),
        'apariencia'=>$definition($identity, 'Colores, tipografía y espacios', '/', [
            'marca'=>['Color de paneles y pie','color','#15263f'],
            'acento'=>['Color de acciones principales','color','#bc2838'],
            'fondo_claro'=>['Fondo en modo claro','color','#f7f6f3'],
            'panel_claro'=>['Tarjetas en modo claro','color','#ffffff'],
            'fondo_oscuro'=>['Fondo en modo oscuro','color','#111a28'],
            'panel_oscuro'=>['Tarjetas en modo oscuro','color','#182437'],
            'fuente'=>['Tipografía general','font','manrope'],
            'espaciado'=>['Separación entre secciones','density','normal'],
            'esquinas'=>['Esquinas de tarjetas y paneles','radius','normal'],
        ]),
        'menu'=>$definition($identity, 'Menú principal', '/', [
            'enlaces'=>['Enlaces del menú','links',[
                $link('Inicio','/'), $link('Conoce el colegio','/institucion','Institución'),
                $link('Equipo directivo','/directivos','Institución'), $link('Docentes','/docentes','Institución'),
                $link('Administrativos','/administrativos','Institución'), $link('Noticias','/noticias'),
                $link('Comunicados','/comunicados'), $link('Eventos','/eventos'),
                $link('Documentos institucionales','/documentos','Recursos'), $link('Galería','/galeria','Recursos'),
                $link('Mesa de Partes','/mesa-partes'),
            ]],
            'lista'=>['Nombre accesible de la navegación','text','Principal'],
            'menu'=>['Nombre del botón de menú móvil','text','Menú'],
            'buscar'=>['Nombre del botón de búsqueda','text','Buscar'],
            'ruta_buscar'=>['Destino del botón de búsqueda','url','/buscar'],
            'personal'=>['Texto del acceso del personal','text','Acceso del personal'],
            'ruta_personal'=>['Destino del acceso del personal','url','/admin/ingresar'],
            'tema'=>['Nombre del selector de tema','text','Alternar modo claro y oscuro'],
            'salto'=>['Texto del enlace de accesibilidad','text','Saltar al contenido'],
        ]),
        'pie'=>$definition($identity, 'Pie de página', '/', [
            'leyenda'=>['Texto al pie','text','I.E. Bandera del Perú'],
            'personal'=>['Texto del enlace inferior','text','Acceso del personal'],
            'ruta_personal'=>['Destino del enlace inferior','url','/admin/ingresar'],
            'enlaces'=>['Grupos y enlaces del pie','links',[
                $link('Institución','/institucion','El colegio'), $link('Docentes','/docentes','El colegio'),
                $link('Equipo directivo','/directivos','El colegio'), $link('Administrativos','/administrativos','El colegio'),
                $link('Documentos institucionales','/documentos','Recursos y novedades'),
                $link('Noticias','/noticias','Recursos y novedades'), $link('Galería','/galeria','Recursos y novedades'),
                $link('Calendario','/eventos','Recursos y novedades'), $link('Mesa de Partes','/mesa-partes','Recursos y novedades'),
            ]],
        ]),
        'portada'=>$definition($home, 'Acción y recursos de portada', '/', [
            ...$action('Conoce el colegio','/institucion'),
            'titulo_pestana'=>['Título de inicio en el navegador','text','Inicio'],
            'titulo_respaldo'=>['Título cuando falta la configuración de Inicio','text','Colegio Bandera del Perú'],
            'texto_respaldo'=>['Texto cuando falta el lema o resumen','paragraph','Noticias, actividades y recursos para la comunidad educativa.'],
            'descripcion'=>['Descripción predeterminada para buscadores','paragraph','Portal institucional del Colegio Bandera del Perú.'],
            'alt_respaldo'=>['Descripción de la foto original','text','Fachada del colegio'],
            'alt_portada'=>['Descripción alternativa si la foto publicada no tiene una','text','Imagen institucional'],
            'diapositivas'=>['Nombre accesible de las diapositivas','text','Diapositivas de portada'],
            'ver_diapositivas'=>['Texto del enlace a destacados','text','Ver diapositivas'],
            'visible'=>['Mostrar portada','toggle','si'],
            'error'=>['Mensaje de portada temporalmente indisponible','paragraph','La información de portada no está disponible temporalmente.'],
        ], 'Imagen de respaldo de portada'),
        'bloque-accesos'=>$definition($home, 'Accesos rápidos', '/', $block('Accesos rápidos', 10, [
            'enlaces'=>['Enlaces e iconos','links',[
                $link('Documentos institucionales','/documentos',icon:'description'),
                $link('Docentes','/docentes',icon:'school'), $link('Equipo directivo','/directivos',icon:'account_tree'),
                $link('Galería','/galeria',icon:'photo_library'),
            ]],
        ])),
        'bloque-actualidad'=>$definition($home, 'Orden del bloque de actualidad', '/', [
            'visible'=>['Mostrar noticias, agenda y comunicados','toggle','si'],
            'orden'=>['Orden en Inicio','order','20'],
        ]),
        'bloque-noticias'=>$definition($home, 'Noticias de inicio', '/', $block('Noticias recientes', 10, [
            ...$action('Todas las noticias','/noticias'),
            'cantidad'=>['Cantidad de publicaciones','count','3'],
            'vacio'=>['Mensaje sin noticias','paragraph','Todavía no hay noticias publicadas.'],
            'error'=>['Mensaje de indisponibilidad','paragraph','No fue posible cargar las noticias.'],
        ])),
        'bloque-eventos'=>$definition($home, 'Agenda de inicio', '/', $block('Próximos eventos', 20, [
            ...$action('Ver calendario','/eventos'), 'cantidad'=>['Cantidad de eventos','count','3'],
            'vacio'=>['Mensaje sin eventos','paragraph','Por ahora no hay actividades programadas.'],
        ])),
        'bloque-comunicados'=>$definition($home, 'Comunicados de inicio', '/', $block('Comunicados', 30, [
            ...$action('Ver avisos','/comunicados'), 'cantidad'=>['Cantidad de avisos','count','3'],
            'vacio'=>['Mensaje sin comunicados','paragraph','Por ahora no hay comunicados vigentes.'],
        ])),
        'bloque-formacion'=>$definition($home, 'Formación', '/', $block('Formación', 30), 'Foto de Formación'),
        'bloque-galeria'=>$definition($home, 'Galería de inicio', '/', $block('Galería', 40, [
            ...$action('Ver galería','/galeria'), 'cantidad'=>['Cantidad de publicaciones','count','3'],
            'vacio'=>['Mensaje sin imágenes','paragraph',''],
            'error'=>['Mensaje de indisponibilidad','paragraph','No fue posible cargar la galería.'],
        ])),
        'bloque-destacados'=>$definition($home, 'Destacados', '/', $block('Destacados', 50, [
            'accion'=>['Texto de la acción de cada destacado','text','Más información'],
            'grupo'=>['Nombre accesible de las tarjetas','text','Tarjetas destacadas'],
            'error'=>['Mensaje de indisponibilidad','paragraph','No fue posible cargar los destacados.'],
        ])),
        'bloque-cifras'=>$definition($home, 'Cifras de inicio', '/', [
            'titulo'=>['Título opcional','text',''], 'visible'=>['Mostrar cifras','toggle','si'],
            'orden'=>['Orden en Inicio','order','60'], 'fuente'=>['Texto del enlace a la fuente','text','Fuente'],
        ]),
        'bloque-contacto'=>$definition($home, 'Contacto de inicio', '/', $block('Contacto', 70, $action('Mesa de Partes','/mesa-partes'))),
    ];
    $page = static fn(string $title) => [
        'titulo'=>['Título visible','text',$title],
        'resumen'=>['Introducción visible','paragraph',''],
        'contenido'=>['Texto adicional','html',''],
        'meta'=>['Descripción para buscadores','paragraph',''],
        'vacio'=>['Mensaje sin resultados (deja vacío para usar el mensaje general)','paragraph',''],
        'cantidad'=>['Resultados por página','count','24'],
        ...$action('', ''),
    ];
    foreach (modules() as $module=>[$label]) {
        if ($module === 'portal') {
            continue;
        }
        $catalog['pagina-' . $module] = $definition($pages, $label, '/' . $module, $page($label), 'Imagen de encabezado');
        foreach (portalFactLabels($module) as $key=>$caption) {
            $catalog['pagina-' . $module]['fields']['etiqueta_' . $key] = ["Etiqueta pública de $caption", 'text', $caption];
        }
    }
    unset($catalog['pagina-inicio']['fields']['cantidad']);
    $catalog['pagina-noticias']['fields']['etiquetas'] = ['Texto del botón de etiquetas','text','Ver etiquetas'];
    $catalog['pagina-noticias']['fields']['relacionadas'] = ['Título de las noticias relacionadas','text','Noticias relacionadas'];
    $catalog['pagina-directivos']['fields']['vacio'][2] = 'No hay perfiles del equipo directivo publicados.';
    $catalog['pagina-docentes']['fields']['vacio'][2] = 'No hay docentes publicados.';
    foreach ([
        'identidad'=>['Identidad institucional','Cuadernos de archivo y una bandera peruana'],
        'academica'=>['Vida académica','Materiales para un proyecto de aula sobre una mesa'],
        'gestion'=>['Gestión institucional','Materiales de planificación en una oficina escolar'],
        'tecnologia'=>['Tecnología educativa','Computadoras y teclados en un aula'],
    ] as $key=>[$title,$alt]) {
        $catalog['institucion-' . $key] = $definition($details, "Panel «{$title}»", '/institucion', [
            'titulo'=>['Título visible del panel','text',$title],
            'alt_respaldo'=>['Descripción de la foto predeterminada','text',$alt],
            'imagen_visible'=>['Mostrar una imagen en el panel','toggle','si'],
        ], 'Foto del panel');
    }
    $catalog['pagina-mesa-partes'] = $definition($pages, 'Mesa de Partes y FUT', '/mesa-partes', [
        'titulo'=>['Título visible','text','Mesa de Partes'],
        'resumen'=>['Introducción','paragraph',''],
        'resumen_respaldo'=>['Introducción sin guía publicada','paragraph','Orientación para presentar documentos y consultar solicitudes al colegio.'],
        'meta'=>['Descripción para buscadores','paragraph','Presenta documentos y consulta solicitudes por los canales de atención del colegio.'],
        'guia_local'=>['Usar el texto de esta pantalla como guía principal','toggle','no'],
        'contenido'=>['Texto de la guía de atención','html',
            '<h2>Presentar una solicitud</h2><ol><li>Consulta con Secretaría el canal de atención y los requisitos de tu trámite.</li><li>Prepara tu solicitud y los documentos que te indiquen para el trámite.</li><li>Presenta la solicitud por el canal indicado y guarda la constancia que recibas.</li></ol><h2>Consultar un trámite</h2><p>Comunícate con Secretaría y ten a la mano el número de expediente o la constancia de presentación.</p>'],
        'fut_titulo'=>['Título del formulario','text','Formulario Único de Trámite'],
        'fut_accion'=>['Texto del botón de descarga','text','Descargar FUT'],
        'fut_modelo'=>['Texto junto al modelo referencial','paragraph','Modelo referencial editable. Puedes completarlo en tu lector de PDF.'],
        'fut_publicado'=>['Texto junto al formulario del colegio','paragraph','Completa el formulario y preséntalo por el canal de atención indicado.'],
        'canales'=>['Título de los canales de atención','text','Canales de atención'],
        'enlaces'=>['Accesos de Mesa de Partes','links',[
            $link('Documentos institucionales','/documentos',icon:'description'),
            $link('Directorio administrativo','/administrativos',icon:'groups'),
        ]],
        'alt_respaldo'=>['Descripción de la ilustración predeterminada','text','Materiales de planificación en una oficina escolar'],
    ], 'Imagen de Mesa de Partes');
    $catalog['pagina-buscar'] = $definition($pages, 'Buscador público', '/buscar', [
        ...$page('Buscar en el portal'),
        'termino'=>['Etiqueta del término de búsqueda','text','Término'],
        'ejemplo'=>['Ejemplo del cuadro de búsqueda','text','Noticias, eventos o documentos'],
        'boton'=>['Texto del botón','text','Buscar'],
        'resultados'=>['Título de los resultados','text','Resultados'],
    ], 'Imagen del buscador');
    $catalog['pagina-etiquetas'] = $definition($pages, 'Etiquetas públicas', '/tags', [
        ...$page('Etiquetas de noticias'),
        'vacio'=>['Mensaje sin etiquetas','paragraph','Todavía no hay etiquetas publicadas.'],
        'resultados'=>['Título de resultados por etiqueta','text','Noticias etiquetadas'],
        'ruta'=>['Nombre en la ruta de navegación','text','Etiquetas'],
    ], 'Imagen de la página de etiquetas');
    $catalog['acceso'] = $definition($pages, 'Acceso del personal', '/admin/ingresar', [
        'titulo'=>['Título visible','text','Ingresar a la administración'],
        'intro'=>['Introducción opcional','paragraph',''],
        'usuario'=>['Etiqueta de usuario','text','Usuario'],
        'clave'=>['Etiqueta de contraseña','text','Contraseña'],
        'boton'=>['Texto del botón','text','Ingresar'],
        'volver'=>['Texto del enlace de regreso','text','Volver al portal'],
        'destino'=>['Destino del enlace de regreso','url','/'],
    ], 'Foto de acceso del personal');
    $catalog['fotos-perfiles'] = $definition($details, 'Retrato de respaldo', '/docentes', [], 'Foto para perfiles sin retrato');
    $catalog['textos'] = $definition($details, 'Etiquetas y acciones comunes', '/', [
        'inicio'=>['Nombre de Inicio en rutas de navegación','text','Inicio'],
        'ilustracion'=>['Etiqueta de las ilustraciones','text','Imagen ilustrativa'],
        'seccion'=>['Grupo cuando una ficha no tiene sección','text','Información institucional'],
        'red_social'=>['Texto del enlace a redes sociales','text','Red social institucional'],
        'reintentar'=>['Texto de reintento','text','Reintentar'],
        'sin_servicio'=>['Mensaje de sección indisponible','paragraph','Esta sección no está disponible.'],
        'vacio'=>['Mensaje general sin publicaciones','paragraph','No hay contenido publicado que coincida.'],
        'perfiles_demo'=>['Aviso en directorios de muestra','paragraph','El directorio incluye nombres y retratos de demostración.'],
        'perfil_demo'=>['Aviso en un perfil de muestra','paragraph','Nombre y retrato de demostración.'],
        'descargar'=>['Texto para descargar PDF','text','Descargar PDF'],
        'version_documento'=>['Etiqueta de versión de un documento','text','versión'],
        'etiquetas'=>['Etiqueta junto a los temas de una publicación','text','Etiquetas'],
        'enlace'=>['Texto de un enlace adjunto','text','Abrir enlace'],
        'red_video'=>['Texto del enlace al video','text','Ver video en su origen'],
        'reproductor'=>['Texto del botón de reproducción','text','Mostrar reproductor de YouTube'],
        'titulo_video'=>['Nombre accesible del reproductor','text','Reproductor de video de YouTube'],
        'paginacion'=>['Nombre accesible de la paginación','text','Paginación'],
        'pagina'=>['Etiqueta del número de página','text','Página'],
        'anterior'=>['Texto de página anterior','text','Anterior'],
        'siguiente'=>['Texto de página siguiente','text','Siguiente'],
        'sin_hora'=>['Texto de eventos sin hora','text','Horario por confirmar'],
        'tema'=>['Prefijo para el filtro por etiqueta','text','Etiqueta'],
    ]);
    $catalog['filtros'] = $definition($details, 'Filtros y calendario', '/eventos', [
        'buscar'=>['Etiqueta de búsqueda','text','Buscar'], 'tipo'=>['Etiqueta de tipo','text','Tipo'],
        'todos'=>['Opción sin filtro','text','Todos'], 'foto'=>['Opción de fotos','text','Fotos'],
        'video'=>['Opción de videos','text','Videos'], 'anio'=>['Etiqueta de año','text','Año'],
        'comunicado'=>['Etiqueta de tipo de comunicado','text','Tipo de comunicado'],
        'categoria'=>['Etiqueta de categoría','text','Categoría'], 'periodo'=>['Etiqueta de periodo','text','Periodo'],
        'proximos'=>['Opción de eventos próximos','text','Próximos'], 'anteriores'=>['Opción de eventos anteriores','text','Anteriores'],
        'mes'=>['Etiqueta del mes','text','Mes del calendario'],
        'filtrar'=>['Botón para filtrar publicaciones','text','Filtrar publicaciones'],
        'filtrar_galeria'=>['Botón para filtrar galería','text','Filtrar galería'],
        'calendario_mes'=>['Enlace al mes actual','text','Calendario del mes'],
        'calendario'=>['Título del calendario','text','Calendario'],
        'dia'=>['Nombre accesible de cada día','text','Día'],
        'vacio'=>['Mensaje sin eventos en el mes','paragraph','No hay eventos este mes.'],
    ]);
    $catalog['avisos'] = $definition($details, 'Nombres de tipos de comunicado', '/comunicados',
        array_map(static fn(string $name) => ["Etiqueta para $name",'text',$name], communicationTypes()));
    $catalog['estados'] = $definition($details, 'Páginas de estado', '/no-existe', [
        'e401'=>['Título al necesitar sesión','text','Inicia sesión para continuar'],
        'e403'=>['Título de acceso restringido','text','Acceso restringido'],
        'e404'=>['Título de página no encontrada','text','Página no encontrada'],
        'mensaje404'=>['Mensaje opcional de página no encontrada','paragraph',''],
        'e405'=>['Título de acción no disponible','text','Acción no disponible'],
        'e429'=>['Título de límite de intentos','text','Inténtalo más tarde'],
        'e500'=>['Título de errores del portal','text','No se pudo completar la solicitud'],
        'volver'=>['Texto para volver al inicio','text','Volver al inicio'],
        'ingresar'=>['Texto de acceso a la administración','text','Ingresar a la administración'],
        'referencia'=>['Texto previo al código de soporte','text','Referencia para soporte'],
    ]);
    return $catalog;
}

function portalPreviewContext(?array $context = null): ?array
{
    static $preview = null;
    if ($context !== null) {
        $preview = $context;
    }
    return $preview;
}

function portalRecord(string $slug): array
{
    $preview = portalPreviewContext()['row'] ?? [];
    if (($preview['slug'] ?? '') === $slug) {
        return $preview;
    }
    static $records;
    if ($records === null) {
        try {
            $records = array_column(published('portal', limit: count(portalCatalog())), null, 'slug');
        } catch (RuntimeException $error) {
            logEvent('portal_settings_unavailable', ['kind'=>get_class($error)]);
            $records = [];
        }
    }
    return $records[$slug] ?? [];
}

function portalValues(string $slug, ?array $stored = null): array
{
    $stored ??= json_decode(portalRecord($slug)['fields'] ?? '{}', true) ?? [];
    $definitions = portalCatalog()[$slug]['fields'] ?? [];
    $values = [];
    foreach ($definitions as $key=>[, , $default]) {
        $values[$key] = $stored[$key] ?? $default;
    }
    return $values;
}

function portalText(string $slug, string $key): string
{
    return portalValues($slug)[$key];
}

function visiblePortalBlocks(array $keys): array
{
    $blocks = [];
    foreach ($keys as $key) {
        $options = portalValues($key);
        if ($options['visible'] === 'si') {
            $blocks[$key] = $options;
        }
    }
    uasort($blocks, static fn(array $a, array $b) => (int) $a['orden'] <=> (int) $b['orden']);
    return $blocks;
}

function portalLink(string $value): bool
{
    if (preg_match('~[\\\\\x00-\x20\x7f]~', $value)) {
        return false;
    }
    return preg_match('~^/(?!/)[^<>"]*$|^#[a-zA-Z0-9_-]+$~D', $value) === 1 || httpsUrl($value);
}

function portalChoices(string $type): array
{
    return match ($type) {
        'toggle'=>['si'=>'Sí', 'no'=>'No'],
        'font'=>['manrope'=>'Manrope', 'system'=>'Sistema', 'serif'=>'Georgia'],
        'density'=>['compacto'=>'Compacto', 'normal'=>'Normal', 'amplio'=>'Amplio'],
        'radius'=>['recto'=>'Rectas', 'normal'=>'Redondeadas', 'amplio'=>'Muy redondeadas'],
        default=>[],
    };
}

function portalIcons(): array
{
    return [
        ''=>'Automático', 'description'=>'Documento', 'school'=>'Educación', 'account_tree'=>'Equipo directivo',
        'groups'=>'Personas', 'photo_library'=>'Galería', 'calendar_month'=>'Calendario', 'news'=>'Noticias',
        'campaign'=>'Comunicado', 'account_balance'=>'Institución', 'download'=>'Descarga', 'open_in_new'=>'Enlace',
    ];
}

function portalReadLinks(string $key, array $source): array
{
    $inputs = $source[$key] ?? [];
    if (!is_array($inputs) || count($inputs) > 40) {
        fail(422, 'Guarda hasta 40 enlaces por sección.', $key);
    }
    $links = [];
    foreach ($inputs as $input) {
        if (!is_array($input)) {
            fail(422, 'Revisa los datos de los enlaces.', $key);
        }
        if (($input['remove'] ?? '') === '1') {
            continue;
        }
        $label = field('label', 100, $input);
        $url = field('url', 500, $input);
        $group = field('group', 100, $input);
        $icon = field('icon', 32, $input);
        if ($label === '' && $url === '') {
            continue;
        }
        if ($label === '' || !portalLink($url) || !array_key_exists($icon, portalIcons())) {
            fail(422, 'Completa cada enlace con un texto y una ruta del portal o una dirección HTTPS.', $key);
        }
        $links[] = compact('label', 'url', 'group', 'icon');
    }
    return $links;
}

function portalReadFields(string $slug, array $source): array
{
    $definitions = portalCatalog()[$slug]['fields'] ?? fail(422, 'Selecciona una sección del portal.', 'slug');
    $values = [];
    foreach ($definitions as $key=>[$label, $type, $default]) {
        if ($type === 'links') {
            $values[$key] = portalReadLinks($key, $source);
            continue;
        }
        $max = match ($type) {'url'=>500, 'paragraph'=>1000, 'html'=>24000, default=>255};
        $value = field($key, $max, $source);
        $choices = portalChoices($type);
        if (($choices && !array_key_exists($value, $choices))
                || ($type === 'url' && $value !== '' && !portalLink($value))
                || ($type === 'color' && !preg_match('/^#[0-9a-f]{6}$/iD', $value))
                || ($type === 'order' && (!ctype_digit($value) || (int) $value > 999))
                || ($type === 'count' && (!ctype_digit($value) || (int) $value < 1 || (int) $value > 48))
                || ($key === 'titulo' && $default !== '' && bodyText($value) === '')
                || ($slug === 'marca' && in_array($key, ['nombre','pestana'], true) && bodyText($value) === '')) {
            fail(422, 'Revisa ' . mb_strtolower($label, 'UTF-8') . '.', $key);
        }
        $values[$key] = match ($type) {'html'=>sanitize($value), 'color'=>strtolower($value), default=>$value};
    }
    if ($slug === 'apariencia') {
        portalValidateColors($values);
    }
    return $values;
}

function portalValidateColors(array $values): void
{
    $luminance = static function (string $hex): float {
        $rgb = array_map(static fn(string $pair) => hexdec($pair) / 255, str_split(substr($hex, 1), 2));
        $linear = array_map(static fn(float $c) => $c <= .04045 ? $c / 12.92 : (($c + .055) / 1.055) ** 2.4, $rgb);
        return .2126 * $linear[0] + .7152 * $linear[1] + .0722 * $linear[2];
    };
    foreach ([
        'marca'=>['#d1dded', false], 'acento'=>['#ffffff', false],
        'fondo_claro'=>['#566479', true], 'panel_claro'=>['#566479', true],
        'fondo_oscuro'=>['#aacbff', false], 'panel_oscuro'=>['#aacbff', false],
    ] as $key=>[$text, $light]) {
        [$background, $foreground] = [$luminance($values[$key]), $luminance($text)];
        $ratio = $light ? ($background + .05) / ($foreground + .05) : ($foreground + .05) / ($background + .05);
        if ($ratio < 4.5) {
            fail(422, 'Elige un color con más contraste para conservar la legibilidad.', $key);
        }
    }
}

function portalThemeCss(array $colors): string
{
    $fonts = ['manrope'=>'Manrope, system-ui, sans-serif', 'system'=>'system-ui, sans-serif', 'serif'=>'Georgia, serif'];
    $spaces = ['compacto'=>'clamp(1.8rem,4vw,3.4rem)', 'normal'=>'clamp(2.4rem,5vw,4.25rem)', 'amplio'=>'clamp(3rem,6.5vw,5.75rem)'];
    $radii = ['recto'=>'.25rem', 'normal'=>'1rem', 'amplio'=>'1.5rem'];
    // Only the fixed declarations below and validated hexadecimal values enter the CSS response.
    $hex = static fn(string $key, string $fallback) => preg_match('/^#[0-9a-f]{6}$/iD', $colors[$key] ?? '') ? $colors[$key] : $fallback;
    $brand = $hex('marca','#15263f');
    $accent = $hex('acento','#bc2838');
    $light = '--page:' . $hex('fondo_claro','#f7f6f3') . ';--panel:' . $hex('panel_claro','#ffffff');
    $dark = '--page:' . $hex('fondo_oscuro','#111a28') . ';--panel:' . $hex('panel_oscuro','#182437');
    return ':root{--brand:' . $brand . ';--accent:' . $accent . ';--accent-hover:color-mix(in srgb,var(--accent) 84%,black);'
        . '--font-ui:' . ($fonts[$colors['fuente']] ?? $fonts['manrope']) . ';--section-space:' . ($spaces[$colors['espaciado']] ?? $spaces['normal'])
        . ';--radius:' . ($radii[$colors['esquinas']] ?? $radii['normal']) . ';}'
        . ':root[data-theme="light"]{' . $light . '}:root[data-theme="dark"]{' . $dark . '}'
        . '@media (prefers-color-scheme:light){:root:not([data-theme="dark"]){' . $light . '}}'
        . '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){' . $dark . '}}';
}

function portalPage(string $module): array
{
    $page = portalValues('pagina-' . $module);
    if (($page['vacio'] ?? null) === '') {
        $page['vacio'] = portalText('textos','vacio');
    }
    return $page;
}

function portalFactLabels(string $module): array
{
    return array_diff_key(modules()[$module][1], array_flip(['fecha','hora','seccion']));
}

function portalFactLabel(string $module, string $key): string
{
    return portalPage($module)['etiqueta_' . $key] ?? modules()[$module][1][$key] ?? $key;
}

function portalNoticeLabel(string $type): string
{
    $labels = portalValues('avisos');
    return $labels[$type] ?? $labels['general'];
}

function portalThemeResponse(array $session): void
{
    $stored = null;
    if (isset($_GET['revision'])) {
        $revision = field('revision', 18, $_GET);
        if (!ctype_digit($revision) || !allowed($session, 'portal', 'preview')) {
            fail(404, 'Tema no encontrado.');
        }
        $stored = query("SELECT r.fields FROM revisions r JOIN content c ON c.id=r.content_id
                         WHERE c.module='portal' AND c.slug='apariencia' AND r.id=?", [$revision])->fetchColumn();
        if ($stored === false) {
            fail(404, 'Tema no encontrado.');
        }
        $stored = json_decode($stored, true) ?? [];
        header('X-Robots-Tag: noindex, nofollow');
    }
    header('Content-Type: text/css; charset=utf-8');
    echo portalThemeCss(portalValues('apariencia', $stored));
}

function portalMediaUrl(array $row): string
{
    return '/medio/' . $row['media_id'] . (isset($row['preview_revision']) ? '?revision=' . $row['preview_revision'] : '');
}

function portalLinksByGroup(array $links): array
{
    $groups = [];
    foreach ($links as $index=>$link) {
        $group = $link['group'];
        $key = $group === '' ? $index : 'group:' . $group;
        $groups[$key]['title'] = $group;
        $groups[$key]['links'][] = $link;
    }
    return $groups;
}

function portalStartsAt(string $href, string $current): bool
{
    if ($current === '' || !str_starts_with($href, '/')) {
        return false;
    }
    $path = match ($current) {'inicio'=>'/', 'acceso'=>'/admin/ingresar', default=>'/' . $current};
    return parse_url($href, PHP_URL_PATH) === $path;
}

function portalErrorTitle(int $status): string
{
    return portalText('estados', in_array($status, [401,403,404,405,429], true) ? 'e' . $status : 'e500');
}
