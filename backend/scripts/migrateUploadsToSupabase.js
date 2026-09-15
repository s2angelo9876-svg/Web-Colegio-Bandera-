/**
 * Script de migración: sube los archivos de /uploads a Supabase Storage
 * y actualiza las URLs en la base de datos.
 *
 * USO:
 *   1) Asegúrate de tener SUPABASE_URL, SUPABASE_SERVICE_KEY y SUPABASE_BUCKET en .env
 *   2) Ejecuta:  node scripts/migrateUploadsToSupabase.js
 *   3) Revisa la consola. Si todo salió bien, los archivos locales pueden borrarse.
 *
 * IMPORTANTE: haz un backup de la BD antes de correr este script.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const { uploadBufferToStorage, deleteFromStorage } = require('../config/storage');
const logger = require('../config/logger');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Mapeo: tabla → campo → carpeta local
const TARGETS = [
  { table: 'noticias',        column: 'imagen',     folder: 'noticias' },
  { table: 'docentes',        column: 'imagen_url', folder: 'docentes' },
  { table: 'administrativos', column: 'imagen_url', folder: 'administrativos' },
  { table: 'equipo_directivo',column: 'imagen_url', folder: 'directivos' },
  { table: 'galeria',         column: 'imagen_url', folder: 'galeria' },
  { table: 'carrusel',        column: 'imagen_url', folder: 'carrusel' },
  { table: 'transparencia',   column: 'archivo_pdf',folder: 'transparencia' },
  { table: 'mesa_partes',     column: 'archivo_adjunto', folder: 'mesa_partes' },
];

async function migrateTarget({ table, column, folder }) {
  if (!fs.existsSync(path.join(UPLOADS_DIR, folder))) {
    logger.info(`Carpeta local ${folder} no existe, saltando`);
    return;
  }

  const { rows } = await db.query(`SELECT id, ${column} AS archivo FROM ${table} WHERE ${column} LIKE '/uploads/%'`);
  logger.info(`${table}.${column}: ${rows.length} archivos locales encontrados`);

  for (const row of rows) {
    const filename = path.basename(row.archivo);
    const filepath = path.join(UPLOADS_DIR, folder, filename);
    if (!fs.existsSync(filepath)) {
      logger.warn(`Archivo no encontrado en disco: ${filepath}`);
      continue;
    }
    try {
      const buffer = fs.readFileSync(filepath);
      const contentType = filename.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/webp';
      const newFilename = `migrated-${Date.now()}-${filename}`;

      const { url } = await uploadBufferToStorage(buffer, {
        folder,
        filename: newFilename,
        contentType,
      });

      await db.query(`UPDATE ${table} SET ${column} = $1 WHERE id = $2`, [url, row.id]);
      logger.info(`✓ ${table}#${row.id} → ${url}`);
    } catch (err) {
      logger.error(`✗ Error migrando ${table}#${row.id}`, { message: err.message });
    }
  }
}

async function main() {
  logger.info('Iniciando migración de uploads a Supabase Storage…');
  for (const target of TARGETS) {
    await migrateTarget(target);
  }
  logger.info('Migración completada. Verifica que las URLs se vean correctamente en la web.');
  logger.info('Si todo está OK, puedes borrar el contenido de /uploads/ (NO la carpeta).');
  process.exit(0);
}

main().catch((err) => {
  logger.error('Migración falló', { message: err.message });
  process.exit(1);
});
