const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'colegio_db',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool; // Al usar mysql2/promise, ya no necesitas .promise()