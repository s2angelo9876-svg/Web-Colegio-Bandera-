-- =====================================================================
-- Colegio Bandera del Perú — Migración inicial (PostgreSQL / Supabase)
-- Idempotente: se puede ejecutar varias veces sin romper nada.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------
-- 1. Usuarios (autenticación admin)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(255) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  rol           VARCHAR(20)  NOT NULL DEFAULT 'user'
                  CHECK (rol IN ('admin', 'user')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 2. Noticias
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS noticias (
  id            SERIAL PRIMARY KEY,
  titulo        VARCHAR(255) NOT NULL,
  contenido     TEXT         NOT NULL,
  fecha         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  imagen        VARCHAR(500)
);
CREATE INDEX IF NOT EXISTS idx_noticias_fecha ON noticias (fecha DESC);

-- ---------------------------------------------------------------------
-- 3. Eventos
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS eventos (
  id            SERIAL PRIMARY KEY,
  titulo        VARCHAR(255) NOT NULL,
  descripcion   TEXT,
  fecha_evento  DATE         NOT NULL,
  hora_evento   TIME,
  lugar         VARCHAR(255),
  imagen_url    VARCHAR(500)
);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos (fecha_evento ASC);

-- ---------------------------------------------------------------------
-- 4. Comunicados
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comunicados (
  id            SERIAL PRIMARY KEY,
  titulo        VARCHAR(255) NOT NULL,
  descripcion   TEXT         NOT NULL,
  fecha         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  tipo          VARCHAR(50)  NOT NULL DEFAULT 'general'
);
CREATE INDEX IF NOT EXISTS idx_comunicados_fecha ON comunicados (fecha DESC);

-- ---------------------------------------------------------------------
-- 5. Admisiones (leads)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admisiones (
  id                 SERIAL PRIMARY KEY,
  nombre_padre       VARCHAR(255) NOT NULL,
  nombre_estudiante  VARCHAR(255) NOT NULL,
  grado_interes      VARCHAR(100) NOT NULL,
  celular            VARCHAR(20)  NOT NULL,
  fecha_registro     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 6. Transparencia (documentos PDF públicos)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transparencia (
  id            SERIAL PRIMARY KEY,
  titulo        VARCHAR(255) NOT NULL,
  descripcion   TEXT,
  archivo_pdf   VARCHAR(500) NOT NULL,
  categoria     VARCHAR(100) NOT NULL,
  fecha         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 7. Configuración (key-value dinámico)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS configuracion (
  clave         VARCHAR(191) PRIMARY KEY,
  valor         TEXT,
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 8. Docentes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS docentes (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(255) NOT NULL,
  cargo         VARCHAR(255),
  especialidad  VARCHAR(255),
  imagen_url    VARCHAR(500),
  orden         INTEGER       NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_docentes_orden ON docentes (orden ASC, nombre ASC);

-- ---------------------------------------------------------------------
-- 9. Administrativos
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS administrativos (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(255) NOT NULL,
  cargo         VARCHAR(255),
  area          VARCHAR(255),
  imagen_url    VARCHAR(500),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 10. Equipo directivo
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipo_directivo (
  id            SERIAL PRIMARY KEY,
  nombres       VARCHAR(255) NOT NULL,
  cargo         VARCHAR(255),
  frase         TEXT,
  correo        VARCHAR(255),
  imagen_url    VARCHAR(500),
  orden         INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_directivos_orden ON equipo_directivo (orden ASC, id ASC);

-- ---------------------------------------------------------------------
-- 11. Galería
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS galeria (
  id                 SERIAL PRIMARY KEY,
  titulo             VARCHAR(255),
  imagen_url         VARCHAR(500),
  anio               VARCHAR(4),
  dia                VARCHAR(2),
  mes                VARCHAR(2),
  tipo               VARCHAR(20) NOT NULL DEFAULT 'foto',
  video_url          VARCHAR(500),
  fecha_publicacion  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_galeria_fecha ON galeria (fecha_publicacion DESC);

-- ---------------------------------------------------------------------
-- 12. Carrusel (banners principales)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carrusel (
  id            SERIAL PRIMARY KEY,
  titulo        VARCHAR(255),
  subtitulo     VARCHAR(500),
  imagen_url    VARCHAR(500) NOT NULL,
  orden         INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_carrusel_orden ON carrusel (orden ASC);

-- ---------------------------------------------------------------------
-- 13. Mesa de partes (trámites virtuales)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mesa_partes (
  id                   SERIAL PRIMARY KEY,
  codigo_seguimiento   VARCHAR(50)  NOT NULL UNIQUE,
  asunto               VARCHAR(255) NOT NULL,
  nombres_completos    VARCHAR(255) NOT NULL,
  dni                  VARCHAR(20)  NOT NULL,
  direccion            VARCHAR(500) NOT NULL,
  telefono             VARCHAR(20)  NOT NULL,
  correo               VARCHAR(255),
  fundamentacion       TEXT         NOT NULL,
  archivo_adjunto      VARCHAR(500),
  estado               VARCHAR(20)  NOT NULL DEFAULT 'pendiente'
                         CHECK (estado IN ('pendiente', 'en_proceso', 'resuelto')),
  fecha_registro       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mesa_partes_estado ON mesa_partes (estado);
CREATE INDEX IF NOT EXISTS idx_mesa_partes_fecha ON mesa_partes (fecha_registro DESC);
