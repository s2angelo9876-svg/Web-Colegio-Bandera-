CREATE TABLE accounts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'editor', 'publisher')),
  enabled boolean NOT NULL DEFAULT true,
  generation bigint NOT NULL DEFAULT 1
);
CREATE TABLE sessions (
  token_hash text PRIMARY KEY,
  csrf text NOT NULL,
  user_id bigint REFERENCES accounts ON DELETE CASCADE,
  generation bigint,
  expires timestamptz NOT NULL
);
CREATE INDEX ON sessions(expires);
CREATE TABLE rate_limits (
  key text NOT NULL,
  bucket bigint NOT NULL,
  hits integer NOT NULL,
  PRIMARY KEY (key, bucket)
);
CREATE TABLE content (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  module text NOT NULL,
  slug text NOT NULL,
  working bigint,
  published bigint,
  scheduled bigint,
  publish_at timestamptz,
  deleted_at timestamptz,
  position integer NOT NULL DEFAULT 0,
  version integer NOT NULL DEFAULT 0,
  UNIQUE (module, slug)
);
CREATE TABLE revisions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  content_id bigint NOT NULL REFERENCES content ON DELETE CASCADE,
  author bigint REFERENCES accounts ON DELETE SET NULL,
  title text NOT NULL,
  summary text NOT NULL,
  body text NOT NULL,
  fields jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (content_id, id)
);
ALTER TABLE content
  ADD FOREIGN KEY (id, working) REFERENCES revisions(content_id, id),
  ADD FOREIGN KEY (id, published) REFERENCES revisions(content_id, id),
  ADD FOREIGN KEY (id, scheduled) REFERENCES revisions(content_id, id);
CREATE TABLE media (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  mime text NOT NULL,
  filename text NOT NULL,
  bytes bytea NOT NULL
);
CREATE TABLE revision_media (
  revision_id bigint PRIMARY KEY REFERENCES revisions ON DELETE CASCADE,
  media_id bigint NOT NULL REFERENCES media
);
CREATE TABLE tags (name text PRIMARY KEY);
CREATE TABLE revision_tags (
  revision_id bigint REFERENCES revisions ON DELETE CASCADE,
  tag text REFERENCES tags,
  PRIMARY KEY (revision_id, tag)
);
CREATE INDEX ON content (publish_at) WHERE scheduled IS NOT NULL;
CREATE INDEX ON content (module, position, id) WHERE deleted_at IS NULL;
