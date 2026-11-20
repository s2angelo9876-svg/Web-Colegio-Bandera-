<?php
declare(strict_types=1);

const INACTIVITY_MINUTES = 30;
const SESSION_HOURS = 8;
const ARGON_OPTIONS = ['memory_cost'=>65536, 'time_cost'=>3, 'threads'=>1];

function session(?array $user = null): string
{
    $token = bin2hex(random_bytes(32));
    $csrf = bin2hex(random_bytes(32));
    query("INSERT INTO sessions (token_hash,csrf,user_id,generation,expires)
           VALUES (?,?,?,?,now()+make_interval(hours=>?))",
        [hash('sha256', $token), $csrf, $user['id'] ?? null, $user['generation'] ?? null, SESSION_HOURS]);
    return $token;
}

function sessionCookie(string $token, int $expiry): void
{
    setcookie('colegio_session', $token, [
        'expires' => $expiry, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax',
        'secure' => getenv('COLEGIO_ENV') === 'production' || getenv('COLEGIO_SECURE_COOKIE') !== '0',
    ]);
}

function currentSession(?string $token = null): array
{
    $token ??= $_COOKIE['colegio_session'] ?? '';
    if (!is_string($token) || !preg_match('/^[a-f0-9]{64}$/D', $token)) {
        return [];
    }
    $hash = hash('sha256', $token);
    $row = query("SELECT s.token_hash,s.csrf,a.id,a.username,a.role,
                        s.last_seen < now()-interval '30 seconds' AS touch
                  FROM sessions s LEFT JOIN accounts a ON a.id=s.user_id
                  WHERE s.token_hash=? AND s.expires>now() AND s.last_seen>now()-make_interval(mins=>?)
                  AND (s.user_id IS NULL OR (a.enabled AND s.generation=a.generation))",
        [$hash, INACTIVITY_MINUTES])->fetch(PDO::FETCH_ASSOC);
    if ($row && $row['touch']) {
        query('UPDATE sessions SET last_seen=now() WHERE token_hash=?', [$hash]);
    }
    return $row ?: [];
}

function originOf(string $url): ?string
{
    $parts = parse_url($url);
    if (!$parts || !isset($parts['scheme'], $parts['host']) || (isset($parts['user']) || isset($parts['pass']))) {
        return null;
    }
    $scheme = strtolower($parts['scheme']);
    if (!in_array($scheme, ['http', 'https'], true)) {
        return null;
    }
    $port = $parts['port'] ?? ($scheme === 'https' ? 443 : 80);
    return $scheme . '://' . strtolower($parts['host']) . ':' . $port;
}

function configuredOrigin(): string
{
    $url = rtrim(getenv('COLEGIO_PUBLIC_ORIGIN') ?: '', '/');
    return httpsUrl($url) && originOf($url) !== null
        && parse_url($url, PHP_URL_PATH) === null && parse_url($url, PHP_URL_QUERY) === null
        && parse_url($url, PHP_URL_FRAGMENT) === null ? $url : '';
}

function csrf(array $session): void
{
    $token = $_POST['_csrf'] ?? '';
    if (!isset($session['csrf']) || !is_string($token) || !hash_equals($session['csrf'], $token)) {
        logEvent('csrf_denied');
        fail(403, 'La sesión del formulario venció. Vuelve a cargar la página.');
    }
    $source = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? null;
    if ($source !== null) {
        $local = (($_SERVER['HTTPS'] ?? '') === 'on' ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? '');
        $expected = getenv('COLEGIO_ENV') === 'production' ? configuredOrigin() : $local;
        if (originOf($expected) === null || originOf($source) !== originOf($expected)) {
            logEvent('csrf_origin_denied');
            fail(403, 'Origen del formulario no autorizado.');
        }
    }
}

function allowed(array $user, string $module, string $action): bool
{
    if (($user['role'] ?? null) === 'admin') {
        return true;
    }
    if (!in_array($user['role'] ?? null, ['editor','publisher'], true)) {
        return false;
    }
    if ($module === 'etiquetas') {
        return in_array($action, ['list','save'], true);
    }
    if (!in_array($module, ['noticias','comunicados','eventos','galeria','docentes','carrusel'], true)) {
        return false;
    }
    return in_array($action, ['list','edit','preview','save','publish','schedule','unpublish','cancel'], true)
        || ($action === 'order' && orderable($module));
}

function requireAccess(array $user, string $module, string $action): void
{
    if (!allowed($user, $module, $action)) {
        logEvent('authorization_denied', ['account_id'=>(int) $user['id'],'module'=>$module]);
        fail(403, 'Tu rol no tiene permiso para esta acción.');
    }
}

function rateKey(string $scope, ?string $identity = null): string
{
    return hash('sha256', $scope . '|' . ($identity ?? ($_SERVER['REMOTE_ADDR'] ?? 'local')));
}

function consumeRate(string $key, int $max): void
{
    $allowed = query("INSERT INTO rate_limits (key,bucket,hits)
        VALUES (?,floor(extract(epoch FROM now())/900)::bigint,1)
        ON CONFLICT (key,bucket) DO UPDATE SET hits=rate_limits.hits+1
        WHERE rate_limits.hits<? AND (rate_limits.retry_at IS NULL OR rate_limits.retry_at<=now()) RETURNING hits",
        [$key,$max])->fetchColumn();
    if ($allowed === false) {
        $retry = query("SELECT greatest(1,ceil(extract(epoch FROM
                   (CASE WHEN hits>=? THEN to_timestamp((bucket+1)*900) ELSE retry_at END)-now())))::int
                   FROM rate_limits WHERE key=? AND bucket=floor(extract(epoch FROM now())/900)::bigint",
            [$max,$key])->fetchColumn();
        header('Retry-After: ' . ($retry ?: 1));
        fail(429, 'Demasiadas solicitudes. Inténtalo más tarde.');
    }
}

function throttle(string $scope, int $max): void
{
    consumeRate(rateKey($scope), $max);
}

function loginFailure(string $key): void
{
    query("UPDATE rate_limits SET retry_at=now()+make_interval(secs=>CASE WHEN hits<2 THEN 0 ELSE power(2,least(5,hits-1)) END)
           WHERE key=? AND bucket=floor(extract(epoch FROM now())/900)::bigint", [$key]);
    logEvent('login_denied');
    fail(401, 'Usuario o contraseña incorrectos.');
}

function validNewPassword(string $password): bool
{
    return strlen($password) <= 512 && !str_contains($password, "\0") && mb_check_encoding($password, 'UTF-8')
        && mb_strlen($password, 'UTF-8') >= 12 && mb_strlen($password, 'UTF-8') <= 128;
}

function newPasswordHash(string $password): string
{
    return password_hash($password, PASSWORD_ARGON2ID, ARGON_OPTIONS);
}

function loginAccount(array $anonymous): never
{
    throttle('login-ip', 30);
    csrf($anonymous);
    $name = strtolower(field('username', 64));
    $key = rateKey('login-account', $name);
    consumeRate($key, 5);
    $password = $_POST['password'] ?? '';
    if (!is_string($password) || strlen($password) > 512 || str_contains($password, "\0")) {
        loginFailure($key);
    }
    $account = query('SELECT * FROM accounts WHERE username=?', [$name])->fetch(PDO::FETCH_ASSOC);
    $hash = $account['password_hash'] ?? '$argon2id$v=19$m=65536,t=3,p=1$dDBvbDVkY2J5Q01WbUdUUw$zIAmHb7Yv9+vJP3lFkEmJQIwVOkpSaJM20GPES0fsnw';
    $valid = password_verify($password, $hash);
    if (!$valid || !$account || !$account['enabled'] || (str_starts_with($hash, '$2y$') && strlen($password) > 72)) {
        loginFailure($key);
    }
    $refresh = password_needs_rehash($hash, PASSWORD_ARGON2ID, ARGON_OPTIONS) ? newPasswordHash($password) : null;
    $token = transaction(function () use ($anonymous, $account, $refresh, $key): string {
        $current = query('SELECT id,generation FROM accounts WHERE id=? AND enabled AND generation=? FOR UPDATE',
            [$account['id'],$account['generation']])->fetch(PDO::FETCH_ASSOC);
        if (!$current || !query('DELETE FROM sessions WHERE token_hash=?', [$anonymous['token_hash']])->rowCount()) {
            fail(401, 'La sesión ya no está disponible. Vuelve a ingresar.');
        }
        if ($refresh !== null) {
            query('UPDATE accounts SET password_hash=? WHERE id=?', [$refresh,$account['id']]);
        }
        query('DELETE FROM rate_limits WHERE key=? AND bucket=floor(extract(epoch FROM now())/900)::bigint', [$key]);
        return session($current);
    });
    sessionCookie($token, time() + SESSION_HOURS * 3600);
    logEvent('login_success', ['account_id' => (int) $account['id']]);
    redirect('/admin');
}

function httpsUrl(string $value): bool
{
    return filter_var($value, FILTER_VALIDATE_URL) !== false
        && strtolower((string) parse_url($value, PHP_URL_SCHEME)) === 'https'
        && parse_url($value, PHP_URL_USER) === null;
}

function sanitize(string $html): string
{
    $document = Dom\HTMLDocument::createFromString($html, LIBXML_NOERROR, 'UTF-8');
    $body = $document->getElementsByTagName('body')->item(0);
    if (!$body) {
        return '';
    }
    $clean = function (Dom\Node $node) use (&$clean): string {
        if ($node instanceof Dom\Text) {
            return e($node->data);
        }
        if (!$node instanceof Dom\Element || in_array($node->localName, ['script','style','iframe','template','svg','math'], true)) {
            return '';
        }
        $tag = $node->localName === 'strike' ? 's' : $node->localName;
        if ($tag === 'span' && preg_match('/^text-decoration(?:-line)?:\s*line-through;?$/iD', trim($node->getAttribute('style') ?? ''))) {
            $tag = 's';
        }
        $inner = '';
        foreach ($node->childNodes as $child) {
            $inner .= $clean($child);
        }
        if (in_array($tag, ['br','hr'], true)) {
            return "<$tag>";
        }
        if ($tag === 'a' && httpsUrl($node->getAttribute('href') ?? '')) {
            return '<a rel="noopener noreferrer" href="' . e($node->getAttribute('href')) . '">' . $inner . '</a>';
        }
        if (in_array($tag, ['p','div','b','strong','i','em','u','s','h2','h3','ul','ol','li','blockquote','code','pre','sub','sup'], true)) {
            return "<$tag>$inner</$tag>";
        }
        return $inner;
    };
    $result = '';
    foreach ($body->childNodes as $node) {
        $result .= $clean($node);
    }
    return $result;
}
