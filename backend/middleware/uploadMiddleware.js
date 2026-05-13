const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento centralizada
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Asegura que la carpeta uploads existe (Multer no la crea automáticamente si no existe el path)
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Formato: timestamp-nombreoriginal (limpio)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de archivos para asegurar que solo se suban imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Solo se permiten imágenes (jpeg, jpg, png, webp, gif)'));
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
    fileFilter: fileFilter
});

module.exports = upload;
