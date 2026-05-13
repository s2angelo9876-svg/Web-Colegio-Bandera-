const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'colegio_db'
    });

    try {
        const [columns] = await pool.query('SHOW COLUMNS FROM galeria');
        console.log('Columns in galeria:', JSON.stringify(columns, null, 2));
    } catch (err) {
        console.error('Error checking schema:', err.message);
    } finally {
        await pool.end();
    }
}

checkSchema();
