#!/usr/bin/env bash
set -euo pipefail
database=$1 web=$2
docker exec "$database" createdb -U postgres colegio_upgrade
for migration in migrations/001.sql migrations/002_editorial.sql; do
  docker exec -i "$database" psql -U postgres -d colegio_upgrade -v ON_ERROR_STOP=1 -q < "$migration"
done
docker exec -i "$database" psql -U postgres -d colegio_upgrade -v ON_ERROR_STOP=1 -q <<'SQL'
CREATE TABLE schema_migrations (name text PRIMARY KEY);
INSERT INTO schema_migrations VALUES ('001.sql'),('002_editorial.sql');
INSERT INTO accounts (username,password_hash,role) VALUES ('prev-admin','hash-sintetico','admin');
INSERT INTO sessions (token_hash,csrf,user_id,generation,expires) VALUES ('sesion-previa','csrf-previo',1,1,now()+interval '1 hour');
INSERT INTO content (module,slug) VALUES ('noticias','previa');
INSERT INTO revisions (content_id,title,summary,body,fields) VALUES
 (1,'Primera versión','','<p>texto</p>','{}'), (1,'Segunda versión','','<p>texto</p>','{}');
UPDATE content SET published=1,working=2 WHERE id=1;
INSERT INTO tags VALUES ('Historia'),('História');
INSERT INTO revision_tags VALUES (1,'Historia'), (1,'História'), (2,'História');
INSERT INTO media (mime,filename,bytes) VALUES ('image/png','previo.png',decode('010203','hex'));
INSERT INTO revision_media VALUES (1,1);
SQL
ip=$(docker inspect --format '{{.NetworkSettings.Networks.bridge.IPAddress}}' "$database")
docker exec -e "COLEGIO_DSN=pgsql:host=$ip;dbname=colegio_upgrade;connect_timeout=3" "$web" php bin/console.php migrate
migration_result=$(docker exec "$database" psql -U postgres -d colegio_upgrade -Atqc   "SELECT (SELECT count(*) FROM tags)=1 AND (SELECT count(*) FROM revision_tags)=2
   AND (SELECT published=1 AND working=2 AND published_at IS NOT NULL FROM content WHERE id=1)
   AND (SELECT encode(bytes,'hex')='010203' FROM media WHERE id=1)
   AND (SELECT mfa_secret IS NULL AND mfa_last_step IS NULL FROM accounts WHERE id=1)
   AND (SELECT NOT mfa_verified FROM sessions WHERE token_hash='sesion-previa')")
[[ "$migration_result" == t ]]
echo 'Actualización 001/002 → 004 verificada con revisiones, etiquetas, medios y sesiones previas.'
