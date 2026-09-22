-- =====================================================================
-- Colegio Bandera del Perú — Migración 003: Workflow, Estados y Tags (Fase U6)
-- Idempotente: se puede correr varias veces sin romper.
-- =====================================================================

-- 1. Columnas de estado y fecha_publicacion en NOTICIAS
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'publicado';
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS fecha_publicacion TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'noticias_estado_check'
  ) THEN
    ALTER TABLE noticias ADD CONSTRAINT noticias_estado_check
      CHECK (estado IN ('borrador', 'programado', 'publicado'));
  END IF;
END $$;

UPDATE noticias SET estado = 'publicado' WHERE estado IS NULL;
UPDATE noticias SET fecha_publicacion = fecha WHERE fecha_publicacion IS NULL;

CREATE INDEX IF NOT EXISTS idx_noticias_estado_fecha ON noticias (estado, fecha_publicacion DESC);

-- 2. Columnas de estado y fecha_publicacion en EVENTOS
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'publicado';
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS fecha_publicacion TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'eventos_estado_check'
  ) THEN
    ALTER TABLE eventos ADD CONSTRAINT eventos_estado_check
      CHECK (estado IN ('borrador', 'programado', 'publicado'));
  END IF;
END $$;

UPDATE eventos SET estado = 'publicado' WHERE estado IS NULL;
UPDATE eventos SET fecha_publicacion = NOW() WHERE fecha_publicacion IS NULL;

CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos (estado, fecha_evento ASC);

-- 3. Columnas de estado y fecha_publicacion en COMUNICADOS
ALTER TABLE comunicados ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'publicado';
ALTER TABLE comunicados ADD COLUMN IF NOT EXISTS fecha_publicacion TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comunicados_estado_check'
  ) THEN
    ALTER TABLE comunicados ADD CONSTRAINT comunicados_estado_check
      CHECK (estado IN ('borrador', 'programado', 'publicado'));
  END IF;
END $$;

UPDATE comunicados SET estado = 'publicado' WHERE estado IS NULL;
UPDATE comunicados SET fecha_publicacion = fecha WHERE fecha_publicacion IS NULL;

CREATE INDEX IF NOT EXISTS idx_comunicados_estado ON comunicados (estado, fecha_publicacion DESC);

-- 4. Campo orden en GALERIA para Drag & Drop
ALTER TABLE galeria ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_galeria_orden ON galeria (orden ASC, id DESC);

-- 5. Tabla de TAGS y relación con NOTICIAS
CREATE TABLE IF NOT EXISTS tags (
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  slug   VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS noticias_tags (
  noticia_id INTEGER REFERENCES noticias(id) ON DELETE CASCADE,
  tag_id     INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (noticia_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_noticias_tags_tag ON noticias_tags (tag_id);

-- Sembrar tags iniciales si no existen
INSERT INTO tags (nombre, slug) VALUES
  ('Institucional', 'institucional'),
  ('Académico', 'academico'),
  ('Deportes', 'deportes'),
  ('Cultura y Arte', 'cultura-y-arte'),
  ('Aniversario', 'aniversario')
ON CONFLICT (nombre) DO NOTHING;

-- Confirmar
SELECT 'Migracion 003 aplicada correctamente' AS status;
