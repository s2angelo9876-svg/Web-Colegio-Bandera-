<?php
declare(strict_types=1);
require dirname(__DIR__) . '/src/bootstrap.php';
require dirname(__DIR__) . '/src/content.php';
require dirname(__DIR__) . '/src/security.php';

function protectLastAdmin(string $name): void
{
    $sole = query("SELECT count(*)=1 AND bool_or(username=?)
                   FROM accounts WHERE enabled AND role='admin'", [$name])->fetchColumn();
    if ($sole) {
        throw new HttpError('Conserva al menos un administrador activo.', 409);
    }
}

try {
    switch ($argv[1] ?? '') {
        case 'migrate':
            transaction(function (): void {
                query('SELECT pg_advisory_xact_lock(216704)');
                query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY)');
                foreach (migrationNames() as $name) {
                    $file = dirname(__DIR__) . '/migrations/' . $name;
                    if (!query('SELECT 1 FROM schema_migrations WHERE name = ?', [$name])->fetchColumn()) {
                        db()->exec(file_get_contents($file));
                        query('INSERT INTO schema_migrations VALUES (?)', [$name]);
                        echo "$name aplicada\n";
                    }
                }
            });
            break;
        case 'account':
            $name = $argv[2] ?? '';
            $role = $argv[3] ?? 'admin';
            $password = rtrim((string) fgets(STDIN), "\r\n");
            if (!preg_match('/^[a-z0-9_.-]{3,64}$/D', $name) || !in_array($role, ['admin','editor','publisher'], true)
                || !validNewPassword($password)) {
                fwrite(STDERR, "Usuario, rol o contraseña inválidos.\n");
                exit(1);
            }
            transaction(function () use ($name,$password,$role): void {
                query('SELECT pg_advisory_xact_lock(216705)');
                if ($role !== 'admin') {
                    protectLastAdmin($name);
                }
                query('INSERT INTO accounts (username,password_hash,role) VALUES (?,?,?)
                       ON CONFLICT (username) DO UPDATE SET password_hash=EXCLUDED.password_hash,
                       role=EXCLUDED.role, enabled=true, generation=accounts.generation+1',
                    [$name, newPasswordHash($password), $role]);
            });
            logEvent('account_credentials_updated');
            break;
        case 'disable':
            $name = $argv[2] ?? '';
            transaction(function () use ($name): void {
                query('SELECT pg_advisory_xact_lock(216705)');
                protectLastAdmin($name);
                if (!query('UPDATE accounts SET enabled=false,generation=generation+1 WHERE username=? AND enabled', [$name])->rowCount()) {
                    fail(404, 'Cuenta activa no encontrada.');
                }
            });
            logEvent('account_disabled');
            break;
        case 'publish':
            echo publishDue() . " publicaciones procesadas\n";
            break;
        case 'cleanup':
            query("DELETE FROM sessions WHERE expires<=now() OR last_seen<=now()-make_interval(mins=>?)", [INACTIVITY_MINUTES]);
            query('DELETE FROM rate_limits WHERE bucket < floor(extract(epoch FROM now())/900)-1');
            break;
        default:
            fwrite(STDERR, "Comandos: migrate, account, disable, publish, cleanup\n");
            exit(1);
    }
} catch (Throwable $error) {
    fwrite(STDERR, ($error instanceof HttpError ? $error->getMessage() : 'Operación incompleta. Revisa el estado de PostgreSQL y la configuración.') . PHP_EOL);
    exit(1);
}
