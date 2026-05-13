const db = require('./db');

const initDb = async () => {
    try {
        console.log('--- Iniciando Verificación de Base de Datos ---');

        // 1. Tabla Usuarios
        await db.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                rol ENUM('admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Tabla Noticias
        await db.query(`
            CREATE TABLE IF NOT EXISTS noticias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255) NOT NULL,
                contenido TEXT NOT NULL,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                imagen VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Tabla Galería
        await db.query(`
            CREATE TABLE IF NOT EXISTS galeria (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255),
                imagen_url VARCHAR(255),
                anio VARCHAR(10),
                dia VARCHAR(10),
                mes VARCHAR(20),
                fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. Tabla Carrusel
        await db.query(`
            CREATE TABLE IF NOT EXISTS carrusel (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255),
                subtitulo TEXT,
                imagen_url VARCHAR(255),
                orden INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 5. Tabla Configuración
        await db.query(`
            CREATE TABLE IF NOT EXISTS configuracion (
                clave VARCHAR(191) PRIMARY KEY,
                valor TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 6. Tabla Comunicados
        await db.query(`
            CREATE TABLE IF NOT EXISTS comunicados (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255),
                descripcion TEXT,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                tipo VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 7. Tabla Admisiones
        await db.query(`
            CREATE TABLE IF NOT EXISTS admisiones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre_padre VARCHAR(255) NOT NULL,
                nombre_estudiante VARCHAR(255) NOT NULL,
                grado_interes VARCHAR(100) NOT NULL,
                celular VARCHAR(20) NOT NULL,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Base de datos verificada y tablas aseguradas.');
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error.message);
        // No detenemos el proceso para permitir que el servidor intente arrancar
    }
};

module.exports = initDb;
