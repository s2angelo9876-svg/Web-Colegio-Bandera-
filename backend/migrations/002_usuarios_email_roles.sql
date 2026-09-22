-- =====================================================================
-- Colegio Bandera del Perú — Migración 002: usuarios con email + roles
-- =====================================================================
-- Agrega columnas email y reset_token a la tabla usuarios.
-- Amplia el CHECK de rol para incluir 'editor'.
-- Es idempotente: se puede correr varias veces sin romper.
-- =====================================================================

-- Columna email (opcional pero única si existe)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_expira TIMESTAMPTZ;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultimo_acceso TIMESTAMPTZ;

-- Indice unico para email (solo si no existe ya el indice)
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email)
  WHERE email IS NOT NULL;

-- Ampliar el CHECK de rol para incluir editor
-- Primero eliminamos el constraint si existe (puede tener varios nombres)
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check1;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check2;

-- Recrear el constraint ampliado
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN ('admin', 'editor', 'user'));

-- Establecer email al admin existente si no tiene
UPDATE usuarios
SET email = username || '@banderadelperu.edu.pe'
WHERE email IS NULL;

-- Confirmar
SELECT 'Migracion 002 aplicada correctamente' AS status,
       (SELECT COUNT(*) FROM usuarios) AS total_usuarios,
       (SELECT COUNT(*) FROM usuarios WHERE email IS NOT NULL) AS con_email;
