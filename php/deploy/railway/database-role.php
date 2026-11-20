<?php
declare(strict_types=1);
require dirname(__DIR__, 2) . '/src/bootstrap.php';

$password = getenv('COLEGIO_APP_PASSWORD');
if ($password === false || strlen($password) < 32) {
    fwrite(STDERR, "Genera una contraseña de al menos 32 caracteres para COLEGIO_APP_PASSWORD.\n");
    exit(1);
}

try {
    transaction(static function () use ($password): void {
        query('SELECT pg_advisory_xact_lock(216704)');
        if (query("SELECT 1 FROM pg_roles WHERE rolname = 'colegio_app'")->fetchColumn() === false) {
            db()->exec('CREATE ROLE colegio_app');
        }
        $quotedPassword = db()->quote($password);
        db()->exec("ALTER ROLE colegio_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD $quotedPassword");

        $database = query('SELECT quote_ident(current_database())')->fetchColumn();
        db()->exec("REVOKE ALL ON DATABASE $database FROM PUBLIC");
        db()->exec("GRANT CONNECT ON DATABASE $database TO colegio_app");
        db()->exec('REVOKE ALL ON SCHEMA public FROM PUBLIC');
        db()->exec('GRANT USAGE ON SCHEMA public TO colegio_app');
    });
} catch (Throwable) {
    fwrite(STDERR, "No se pudo preparar el rol de la aplicación. Verifica la CA, el dominio privado y la cuenta de migración.\n");
    exit(1);
}
