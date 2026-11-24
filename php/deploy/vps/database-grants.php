<?php
declare(strict_types=1);
require dirname(__DIR__, 2) . '/src/bootstrap.php';

transaction(static function (): void {
    db()->exec(<<<'SQL'
        REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
        GRANT EXECUTE ON FUNCTION editorial_slug(text) TO colegio_app;
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO colegio_app;

        GRANT SELECT ON accounts, schema_migrations TO colegio_app;
        GRANT UPDATE (password_hash, mfa_last_step) ON accounts TO colegio_app;
        GRANT SELECT, INSERT, UPDATE, DELETE ON sessions, rate_limits TO colegio_app;
        GRANT SELECT, INSERT, UPDATE ON content, tags TO colegio_app;
        GRANT SELECT, INSERT ON revisions, media, revision_media, revision_tags, editorial_events TO colegio_app;
        SQL);
});
