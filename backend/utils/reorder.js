/**
 * Helper para reordenar items en masa.
 *
 * Usado por: galeria, docentes, administrativos, carrusel, configuracion.pilares.
 *
 * Recibe un array [{id, orden}] y actualiza la columna 'orden' en batch
 * usando una sola transaccion.
 *
 * @param {object} db  - instancia de db
 * @param {string} table - nombre de la tabla
 * @param {string} idCol - nombre de la columna PK (por defecto 'id')
 * @param {Array} items - [{id, orden}, ...]
 */
async function reorderItems(db, table, items, idCol = 'id') {
  if (!Array.isArray(items) || items.length === 0) {
    return { updated: 0 };
  }
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    let updated = 0;
    for (const it of items) {
      const id = Number(it.id);
      const orden = Number(it.orden);
      if (!Number.isFinite(id) || !Number.isFinite(orden)) continue;
      await client.query(
        `UPDATE ${table} SET orden = $1 WHERE ${idCol} = $2`,
        [orden, id]
      );
      updated++;
    }
    await client.query('COMMIT');
    return { updated };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { reorderItems };
