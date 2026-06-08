const { Pool } = require('pg');
const pg = require('pg');
require('dotenv').config();

// Configurar parser para que los enteros grandes (como COUNT(*)) se devuelvan como Numbers de JS
pg.types.setTypeParser(pg.types.builtins.INT8, (value) => parseInt(value, 10));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const query = async (sql, params = []) => {
  let pgSql = sql;

  // 1. Traducir reemplazos de MySQL "?" a Postgres "$1, $2, $3..."
  let index = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${index++}`);

  // 2. Traducir " LIKE " a " ILIKE " para mantener insensibilidad a mayúsculas/minúsculas en búsquedas
  pgSql = pgSql.replace(/\s+like\s+/ig, ' ILIKE ');

  // 3. Traducir MySQL "ON DUPLICATE KEY UPDATE" de la tabla de configuraciones
  if (pgSql.toLowerCase().includes('on duplicate key update')) {
    pgSql = pgSql.replace(/on duplicate key update\s+valor\s*=\s*\$3/i, 'ON CONFLICT (clave) DO UPDATE SET valor = $3');
  }

  // 4. Identificar si es una consulta de inserción para retornar el ID
  const isInsert = /^\s*insert\s+/i.test(pgSql);
  if (isInsert && !/\s+returning\s+/i.test(pgSql) && !pgSql.toLowerCase().includes('configuracion')) {
    pgSql += ' RETURNING id';
  }

  try {
    const res = await pool.query(pgSql, params);

    if (isInsert) {
      // Devolver formato compatible con mysql2 para inserts
      const insertId = res.rows[0]?.id || null;
      return [{ insertId }, null];
    } else {
      // Diferenciar SELECT de operaciones como UPDATE/DELETE
      const isSelect = /^\s*select\s+/i.test(pgSql) || /^\s*show\s+/i.test(pgSql) || /^\s*desc\s+/i.test(pgSql);
      if (isSelect) {
        return [res.rows, null];
      } else {
        return [{ affectedRows: res.rowCount }, null];
      }
    }
  } catch (err) {
    console.error('Error ejecutando query en Postgres:', err.message);
    console.error('Query original:', sql);
    console.error('Query traducido:', pgSql);
    throw err;
  }
};

module.exports = {
  query,
  pool
};