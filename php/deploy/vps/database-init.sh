#!/bin/sh
set -eu

COLEGIO_MIGRATOR_PASSWORD=$(cat /run/secrets/db_migrator)
COLEGIO_APP_PASSWORD=$(cat /run/secrets/db_app)
export COLEGIO_MIGRATOR_PASSWORD COLEGIO_APP_PASSWORD

psql --no-psqlrc --set ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'SQL'
\getenv migrator_password COLEGIO_MIGRATOR_PASSWORD
\getenv app_password COLEGIO_APP_PASSWORD

BEGIN;
CREATE ROLE colegio_migrator LOGIN PASSWORD :'migrator_password';
CREATE ROLE colegio_app LOGIN PASSWORD :'app_password';
ALTER DATABASE colegio_php OWNER TO colegio_migrator;
REVOKE ALL ON DATABASE colegio_php FROM PUBLIC;
GRANT CONNECT ON DATABASE colegio_php TO colegio_app;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO colegio_app;
COMMIT;
SQL
