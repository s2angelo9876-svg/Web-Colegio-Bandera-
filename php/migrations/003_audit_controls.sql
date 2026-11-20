ALTER TABLE sessions ADD COLUMN last_seen timestamptz;
UPDATE sessions SET last_seen = expires - interval '8 hours';
ALTER TABLE sessions ALTER COLUMN last_seen SET DEFAULT now(),
                     ALTER COLUMN last_seen SET NOT NULL;
CREATE INDEX sessions_inactivity ON sessions(last_seen);

ALTER TABLE rate_limits ADD COLUMN retry_at timestamptz;
ALTER TABLE content ADD COLUMN published_at timestamptz;
UPDATE content c
SET published_at = COALESCE(
  (SELECT max(e.happened_at) FROM editorial_events e
   WHERE e.content_id = c.id AND e.revision_id = c.published AND e.action IN ('publish', 'publish-due')),
  r.created_at
)
FROM revisions r WHERE r.id = c.published;
ALTER TABLE editorial_events ADD COLUMN reason text;
ALTER TABLE media ADD COLUMN width integer,
                  ADD COLUMN height integer,
                  ADD COLUMN thumbnail bytea;

CREATE FUNCTION editorial_slug(value text) RETURNS text
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE AS $$
  SELECT trim(both '-' FROM regexp_replace(
    regexp_replace(lower(normalize(value, NFD)), U&'[\0300-\036f]', '', 'g'),
    '[^a-z0-9]+', '-', 'g'
  ));
$$;

ALTER TABLE tags ADD COLUMN slug text, ADD COLUMN archived_at timestamptz;
UPDATE tags SET slug = COALESCE(NULLIF(editorial_slug(name), ''), 'etiqueta-' || md5(name));
CREATE TEMP TABLE tag_merge ON COMMIT DROP AS
SELECT name, first_value(name) OVER (PARTITION BY slug ORDER BY name COLLATE "C") AS canonical
FROM tags;
INSERT INTO revision_tags (revision_id, tag)
SELECT rt.revision_id, tm.canonical
FROM revision_tags rt JOIN tag_merge tm ON tm.name = rt.tag
WHERE tm.name <> tm.canonical
ON CONFLICT DO NOTHING;
DELETE FROM revision_tags rt USING tag_merge tm WHERE rt.tag = tm.name AND tm.name <> tm.canonical;
DELETE FROM tags t USING tag_merge tm WHERE t.name = tm.name AND tm.name <> tm.canonical;
ALTER TABLE tags ALTER COLUMN slug SET NOT NULL, ADD UNIQUE (slug);
CREATE UNIQUE INDEX tags_active_normalization ON tags (editorial_slug(name)) WHERE editorial_slug(name)<>'';

ALTER TABLE revision_tags DROP CONSTRAINT revision_tags_tag_fkey,
  ADD FOREIGN KEY (tag) REFERENCES tags(name) ON UPDATE CASCADE;
CREATE INDEX revision_tags_by_tag ON revision_tags(tag, revision_id);
CREATE INDEX revisions_search ON revisions USING gin (
  to_tsvector('spanish', title || ' ' || summary || ' ' || regexp_replace(body, '<[^>]+>', ' ', 'g'))
);
