<?php
declare(strict_types=1);

function db(): PDO
{
    static $pdo;
    if ($pdo !== null) {
        return $pdo;
    }
    $dsn = getenv('COLEGIO_DSN') ?: throw new RuntimeException('Falta COLEGIO_DSN');
    if (getenv('COLEGIO_ENV') === 'production'
        && !preg_match('~(?:^pgsql:|;)\s*host=/[^;]+(?:;|$)~', $dsn)
        && !preg_match('~(?:^pgsql:|;)\s*sslmode=verify-full(?:;|$)~', $dsn)) {
        throw new RuntimeException('PostgreSQL remoto requiere verificación de TLS.');
    }
    $password = getenv('COLEGIO_DB_PASSWORD');
    $passwordFile = getenv('COLEGIO_DB_PASSWORD_FILE');
    if ($passwordFile !== false && $passwordFile !== '') {
        $password = is_readable($passwordFile) ? file_get_contents($passwordFile) : false;
        if ($password === false || ($password = rtrim($password, "\r\n")) === '') {
            throw new RuntimeException('No se pudo leer la credencial de PostgreSQL.');
        }
    }
    $options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false];
    // PDO_PGSQL appends its own connection timeout after the DSN options.
    if (preg_match('~(?:^pgsql:|;)\s*connect_timeout\s*=\s*(\d+)\s*(?:;|$)~', $dsn, $timeout) === 1) {
        $options[PDO::ATTR_TIMEOUT] = (int) $timeout[1];
    }
    $pdo = new PDO(
        $dsn,
        getenv('COLEGIO_DB_USER') ?: null,
        $password === false ? null : $password,
        $options
    );
    return $pdo;
}

function migrationNames(): array
{
    return array_map('basename', glob(dirname(__DIR__) . '/migrations/*.sql'));
}

function query(string $sql, array $params = []): PDOStatement
{
    $statement = db()->prepare($sql);
    $statement->execute($params);
    return $statement;
}

function transaction(callable $run): mixed
{
    db()->beginTransaction();
    try {
        $result = $run();
        db()->commit();
        return $result;
    } catch (Throwable $error) {
        db()->rollBack();
        throw $error;
    }
}

final class HttpError extends RuntimeException
{
    public function __construct(string $message, int $status, public readonly ?string $field = null)
    {
        parent::__construct($message, $status);
    }
}

function fail(int $code, string $message, ?string $field = null): never
{
    throw new HttpError($message, $code, $field);
}

function requestId(): string
{
    static $id;
    return $id ??= bin2hex(random_bytes(12));
}

function logEvent(string $event, array $context = []): void
{
    error_log(json_encode(['time'=>gmdate('c'), 'request_id'=>requestId(), 'event'=>$event] + $context, JSON_THROW_ON_ERROR));
}

function e(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function redirect(string $path, int $status = 303): never
{
    header('Location: ' . $path, true, $status);
    exit;
}

function field(string $key, int $limit, ?array $source = null): string
{
    $value = ($source ?? $_POST)[$key] ?? '';
    if (!is_string($value) || strlen($value) > $limit * 4 || !mb_check_encoding($value, 'UTF-8')
        || str_contains($value, "\0") || mb_strlen($value, 'UTF-8') > $limit) {
        fail(422, 'Revisa el valor o la longitud del campo.', $key);
    }
    return trim($value);
}

function pageNumber(): int
{
    $page = filter_var($_GET['pagina'] ?? '1', FILTER_VALIDATE_INT, ['options'=>['min_range'=>1,'max_range'=>10000]]);
    return $page === false ? fail(422, 'Número de página inválido.') : $page;
}

function orderable(string $module): bool
{
    return in_array($module, ['galeria','docentes','administrativos','directivos','carrusel'], true);
}

function isUrlField(string $key): bool
{
    return in_array($key, ['video','enlace','red_social','acceso_url'], true) || str_ends_with($key, '_fuente');
}

function communicationTypes(): array
{
    return ['urgente'=>'Urgente','academico'=>'Académico','administrativo'=>'Administrativo','general'=>'General','aviso'=>'Aviso'];
}

function metricLabels(): array
{
    $labels = [];
    for ($i=1; $i<=4; $i++) {
        foreach (['valor'=>'Valor','etiqueta'=>'Descripción','fecha'=>'Fecha','fuente'=>'Fuente HTTPS'] as $key=>$label) {
            $labels["metrica{$i}_$key"] = "$label de la cifra $i";
        }
    }
    return $labels;
}

function modules(): array
{
    return [
        'noticias' => ['Noticias', ['autor' => 'Firma'], 'image'],
        'comunicados' => ['Comunicados', ['tipo' => 'Tipo'], 'document'],
        'eventos' => ['Eventos', ['fecha' => 'Fecha en Lima', 'hora' => 'Hora en Lima (opcional)', 'lugar' => 'Lugar'], 'image'],
        'galeria' => ['Galería', ['fecha_galeria' => 'Fecha', 'video' => 'Enlace HTTPS al video'], 'image'],
        'documentos' => ['Documentos institucionales', ['categoria' => 'Categoría'], 'pdf'],
        'docentes' => ['Docentes', ['cargo' => 'Cargo', 'especialidad' => 'Especialidad'], 'image'],
        'administrativos' => ['Administrativos', ['cargo' => 'Cargo', 'area' => 'Área'], 'image'],
        'directivos' => ['Equipo directivo', ['cargo' => 'Cargo', 'frase' => 'Frase', 'correo' => 'Correo institucional'], 'image'],
        'carrusel' => ['Carrusel', ['enlace' => 'Enlace HTTPS de destino'], 'image'],
        'institucion' => ['Institución', ['seccion' => 'Sección'], 'document'],
        'inicio' => ['Configuración del inicio', ['lema' => 'Lema', 'hero_modo' => 'Imagen de portada', 'direccion' => 'Dirección', 'correo' => 'Correo', 'telefono' => 'Teléfono',
            'pilar1_titulo' => 'Primer pilar', 'pilar1_desc' => 'Descripción del primer pilar',
            'pilar2_titulo' => 'Segundo pilar', 'pilar2_desc' => 'Descripción del segundo pilar',
            'pilar3_titulo' => 'Tercer pilar', 'pilar3_desc' => 'Descripción del tercer pilar',
            ...metricLabels(),
            'red_social' => 'Red social institucional (HTTPS)', 'meta_descripcion' => 'Descripción para buscadores',
            'acceso_texto' => 'Texto de acceso rápido', 'acceso_url' => 'Enlace de acceso rápido (HTTPS)'], 'image'],
    ];
}
