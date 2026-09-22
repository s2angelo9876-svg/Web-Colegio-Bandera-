-- =====================================================================
-- Colegio Bandera del Perú — Migración 004: Engagement (Fase U7)
-- Contador de visitas, log de actividad y notificaciones admin.
-- Idempotente: se puede correr varias veces sin romper.
-- =====================================================================

-- 1. Tabla de visitas por página (contador ligero, una fila por página por día)
CREATE TABLE IF NOT EXISTS page_views (
  id     SERIAL PRIMARY KEY,
  page   VARCHAR(100) NOT NULL,
  date   DATE NOT NULL DEFAULT CURRENT_DATE,
  count  INTEGER NOT NULL DEFAULT 1,
  UNIQUE (page, date)
);
CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views (date DESC);

-- 2. Log de actividad (auditoría de acciones en el CMS)
CREATE TABLE IF NOT EXISTS activity_log (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  username     VARCHAR(255) NOT NULL,
  action       VARCHAR(50) NOT NULL,
  entity_type  VARCHAR(50) NOT NULL,
  entity_id    INTEGER,
  entity_title VARCHAR(255),
  details      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log (user_id);

-- 3. Notificaciones admin (campana de alertas)
CREATE TABLE IF NOT EXISTS admin_notifications (
  id         SERIAL PRIMARY KEY,
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  link       VARCHAR(255),
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON admin_notifications (is_read, created_at DESC);

-- Confirmar
SELECT 'Migracion 004 aplicada correctamente' AS status;
