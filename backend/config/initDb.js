const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');
const logger = require('./logger');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

async function ensureMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id          SERIAL PRIMARY KEY,
      filename    VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);
}

async function runMigrations() {
  await ensureMigrationsTable();
  const { rows: applied } = await db.query('SELECT filename FROM _migrations');
  const appliedSet = new Set(applied.map((r) => r.filename));

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (appliedSet.has(file)) {
      logger.debug(`Migración ya aplicada: ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    logger.info(`Ejecutando migración: ${file}`);
    try {
      await db.query(sql);
      await db.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
      logger.info(`Migración aplicada correctamente: ${file}`);
    } catch (err) {
      logger.error(`Error en migración ${file}`, { message: err.message });
      throw err;
    }
  }
}

async function ensureSeedAdmin() {
  const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM usuarios');
  if (rows[0].n === 0) {
    const username = process.env.SEED_ADMIN_USER || 'admin';
    const password = process.env.SEED_ADMIN_PASS || 'Cambiar123!';
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO usuarios (username, password, rol) VALUES ($1, $2, $3)',
      [username, hash, 'admin']
    );
    logger.info(`Usuario admin creado: ${username} (contraseña por defecto — cámbiala al primer login)`);
  } else {
    logger.debug('Tabla usuarios ya tiene datos, seed omitido');
  }
}

async function initDb() {
  try {
    await runMigrations();
    await ensureSeedAdmin();
    logger.info('Base de datos lista ✅');
  } catch (err) {
    logger.error('Fallo en inicialización de BD', { message: err.message });
    // No re-lanzamos para que el servidor intente arrancar de todos modos;
    // /api/health mostrará el error y los logs tendrán el detalle.
  }
}

module.exports = initDb;
