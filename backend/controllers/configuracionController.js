const db = require('../config/db');

// Obtener todas las configuraciones como objeto
exports.getConfig = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT clave, valor FROM configuracion');
    const config = {};
    rows.forEach((row) => { config[row.clave] = row.valor; });
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener configuración' });
  }
};

// Actualizar múltiples configuraciones (upsert)
exports.updateConfig = async (req, res) => {
  const settings = req.body;

  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return res.status(400).json({ message: 'Datos de configuración inválidos' });
  }

  const entries = Object.entries(settings);
  if (entries.length === 0) {
    return res.status(400).json({ message: 'Sin datos para actualizar' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    for (const [clave, valor] of entries) {
      await client.query(
        `INSERT INTO configuracion (clave, valor, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, updated_at = NOW()`,
        [clave, String(valor)]
      );
    }
    await client.query('COMMIT');
    res.json({ message: 'Configuración actualizada correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error al actualizar configuración' });
  } finally {
    client.release();
  }
};
