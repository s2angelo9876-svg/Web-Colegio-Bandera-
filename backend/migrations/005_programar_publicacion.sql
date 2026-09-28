-- =====================================================================
-- Colegio Bandera del Perú — Migración 005: Programar Publicación
-- =====================================================================
-- Agrega estados (borrador, programado, publicado) y fecha_publicacion
-- a las tablas de contenido que se publican en la web.
-- =====================================================================

-- 1. NOTICIAS
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'publicado'
  CHECK (estado IN ('borrador', 'programado', 'publicado'));
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS fecha_publicacion TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_noticias_estado ON noticias (estado, fecha_publicacion);

-- 2. COMUNICADOS
ALTER TABLE comunicados ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'publicado'
  CHECK (estado IN ('borrador', 'programado', 'publicado'));
ALTER TABLE comunicados ADD COLUMN IF NOT EXISTS fecha_publicacion TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_comunicados_estado ON comunicados (estado, fecha_publicacion);

-- 3. EVENTOS
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'publicado'
  CHECK (estado IN ('borrador', 'programado', 'publicado'));
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS fecha_publicacion TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos (estado, fecha_publicacion);

-- Confirmar
SELECT 'Migracion 005 aplicada correctamente' AS status;
