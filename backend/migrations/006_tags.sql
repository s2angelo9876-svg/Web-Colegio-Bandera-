-- =====================================================================
-- Colegio Bandera del Perú — Migración 006: Tags y Categorias
-- =====================================================================
-- Tabla maestra de tags y tablas intermedias many-to-many con
-- noticias, comunicados y eventos.
-- =====================================================================

-- 1. Tabla maestra de tags
CREATE TABLE IF NOT EXISTS tags (
  id        SERIAL PRIMARY KEY,
  nombre    VARCHAR(50)  NOT NULL UNIQUE,
  slug      VARCHAR(50)  NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabla intermedia para tags en noticias
CREATE TABLE IF NOT EXISTS noticia_tags (
  noticia_id INTEGER NOT NULL REFERENCES noticias(id)    ON DELETE CASCADE,
  tag_id      INTEGER NOT NULL REFERENCES tags(id)       ON DELETE CASCADE,
  PRIMARY KEY (noticia_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_noticia_tags_tag ON noticia_tags(tag_id);

-- 3. Tabla intermedia para tags en comunicados
CREATE TABLE IF NOT EXISTS comunicado_tags (
  comunicado_id INTEGER NOT NULL REFERENCES comunicados(id) ON DELETE CASCADE,
  tag_id         INTEGER NOT NULL REFERENCES tags(id)        ON DELETE CASCADE,
  PRIMARY KEY (comunicado_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_comunicado_tags_tag ON comunicado_tags(tag_id);

-- 4. Tabla intermedia para tags en eventos
CREATE TABLE IF NOT EXISTS evento_tags (
  evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  tag_id    INTEGER NOT NULL REFERENCES tags(id)   ON DELETE CASCADE,
  PRIMARY KEY (evento_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_evento_tags_tag ON evento_tags(tag_id);

SELECT 'Migracion 006 aplicada correctamente' AS status;
