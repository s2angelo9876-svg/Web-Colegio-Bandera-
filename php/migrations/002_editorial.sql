CREATE UNIQUE INDEX singleton_home ON content(module) WHERE module = 'inicio';
ALTER TABLE content ADD CHECK ((scheduled IS NULL) = (publish_at IS NULL));

CREATE TABLE editorial_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  content_id bigint NOT NULL REFERENCES content,
  actor_id bigint REFERENCES accounts ON DELETE SET NULL,
  action text NOT NULL,
  revision_id bigint NOT NULL REFERENCES revisions,
  happened_at timestamptz NOT NULL DEFAULT now()
);
