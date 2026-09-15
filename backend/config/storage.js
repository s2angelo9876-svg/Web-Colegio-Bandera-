const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'colegio-archivos';

let supabase = null;
let storageEnabled = false;

if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  storageEnabled = true;
  logger.info('Supabase Storage habilitado', { bucket: SUPABASE_BUCKET });
} else {
  logger.warn('Supabase Storage NO configurado — los uploads devolverán URLs locales en /uploads');
}

/**
 * Sube un buffer a Supabase Storage y devuelve { url, path }.
 * Si Supabase no está configurado, escribe el archivo en /uploads/<folder>
 * (modo legacy / local).
 */
async function uploadBufferToStorage(buffer, { folder, filename, contentType }) {
  const objectPath = `${folder}/${filename}`;

  if (storageEnabled) {
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(objectPath, buffer, { contentType, upsert: false });

    if (error) {
      logger.error('Error subiendo a Supabase Storage', { message: error.message });
      throw new Error('No se pudo subir el archivo al storage');
    }

    const { data: pub } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(objectPath);
    return { url: pub.publicUrl, path: objectPath };
  }

  // Fallback local
  const fs = require('fs');
  const path = require('path');
  const dir = path.join(__dirname, '..', 'uploads', folder);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, filename);
  fs.writeFileSync(dest, buffer);
  return { url: `/uploads/${folder}/${filename}`, path: objectPath };
}

/**
 * Borra un objeto del storage. Acepta tanto URLs públicas (Supabase)
 * como paths locales (/uploads/...).
 */
async function deleteFromStorage(value) {
  if (!value) return;
  try {
    if (storageEnabled && value.startsWith(SUPABASE_URL)) {
      const prefix = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/`;
      const objectPath = value.startsWith(prefix) ? value.slice(prefix.length) : null;
      if (objectPath) {
        await supabase.storage.from(SUPABASE_BUCKET).remove([objectPath]);
        return;
      }
    }

    if (value.startsWith('/uploads/')) {
      const fs = require('fs');
      const filePath = require('path').join(__dirname, '..', value);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  } catch (err) {
    logger.warn('No se pudo borrar archivo del storage', { value, message: err.message });
  }
}

module.exports = { uploadBufferToStorage, deleteFromStorage, storageEnabled };
