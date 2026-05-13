const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Almacenamiento en memoria para procesar con Sharp antes de guardar
const storage = multer.memoryStorage();

// Filtro de archivos para asegurar que solo se suban imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp, gif)'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Aumentamos límite a 10MB porque Sharp lo comprimirá
    fileFilter: fileFilter
});

// Middleware para optimizar la imagen después de la carga
const processImage = async (req, res, next) => {
    if (!req.file) return next();

    const fileName = `img-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
    const outputPath = path.join('uploads', fileName);

    try {
        await sharp(req.file.buffer)
            .resize(1200, 800, { // Redimensionar a un tamaño estándar máximo
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 80 }) // Convertir a WebP con calidad 80
            .toFile(outputPath);

        // Actualizamos req.file para que los controladores usen el nuevo nombre y ruta
        req.file.filename = fileName;
        req.file.path = outputPath;
        
        next();
    } catch (error) {
        console.error('Error procesando imagen:', error);
        next(); // Continuamos aunque falle la optimización, o podrías manejar el error
    }
};

module.exports = { upload, processImage };
