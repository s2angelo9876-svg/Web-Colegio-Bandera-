const multer = require('multer');
const sharp = require('sharp');
const { fileTypeFromBuffer } = require('file-type');
const path = require('path');
const { uploadBufferToStorage } = require('../config/storage');
const logger = require('../config/logger');

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_DOC_BYTES = 15 * 1024 * 1024;

// ── Multer en memoria (nunca escribimos a disco del servidor) ──────────
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_DOC_BYTES },
});

/**
 * Verifica que el archivo realmente es del tipo declarado leyendo
 * los magic bytes del buffer. Esto evita que un .exe renombrado a .jpg
 * pase el filtro.
 */
async function verifyMagicBytes(req, _res, next) {
  if (!req.file) return next();

  try {
    const detected = await fileTypeFromBuffer(req.file.buffer);
    const mimetype = req.file.mimetype;
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    const isImage = detected && detected.mime.startsWith('image/');
    const isPdf   = detected && detected.mime === 'application/pdf';

    if (!isImage && !isPdf) {
      return next(new Error('Tipo de archivo no permitido. Solo imágenes y PDF.'));
    }

    // Validación cruzada: lo que dice multer vs lo que realmente es
    if (isImage && !mimetype.startsWith('image/')) {
      return next(new Error('El archivo no es una imagen válida'));
    }
    if (isPdf && mimetype !== 'application/pdf') {
      return next(new Error('El archivo no es un PDF válido'));
    }

    // Guardamos metadata útil
    req.file.detectedType = detected.mime;
    req.file.detectedExt = detected.ext;
    req.file.ext = ext;
    next();
  } catch (err) {
    logger.error('Error verificando magic bytes', { message: err.message });
    next(new Error('No se pudo verificar el archivo subido'));
  }
}

/**
 * Procesa imágenes (resize + WebP) y las sube a Supabase Storage.
 * PDFs pasan directamente sin procesar.
 *
 * Espera que el cliente suba el archivo en el campo "archivo" o "imagen".
 * Define req.file.url_public, req.file.storage_path en éxito.
 */
async function processAndUpload(folder) {
  return async (req, _res, next) => {
    if (!req.file) return next();

    const isPdf = req.file.detectedType === 'application/pdf';

    try {
      let buffer;
      let contentType;
      let ext;
      let filename;

      if (isPdf) {
        buffer = req.file.buffer;
        contentType = 'application/pdf';
        ext = 'pdf';
        filename = `doc-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
      } else {
        // Convertir SIEMPRE a WebP optimizado
        buffer = await sharp(req.file.buffer)
          .resize(1600, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        contentType = 'image/webp';
        ext = 'webp';
        filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
      }

      const { url, path: storagePath } = await uploadBufferToStorage(buffer, {
        folder,
        filename,
        contentType,
      });

      req.file.url_public = url;
      req.file.storage_path = storagePath;
      next();
    } catch (err) {
      logger.error('Error procesando/subiendo archivo', { message: err.message, folder });
      next(err);
    }
  };
}

module.exports = { upload, verifyMagicBytes, processAndUpload };
