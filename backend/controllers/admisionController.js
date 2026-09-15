const db = require('../config/db');

exports.crearSolicitud = async (req, res) => {
  const { nombre_padre, nombre_estudiante, grado_interes, celular } = req.body;

  try {
    await db.query(
      'INSERT INTO admisiones (nombre_padre, nombre_estudiante, grado_interes, celular) VALUES ($1, $2, $3, $4)',
      [nombre_padre, nombre_estudiante, grado_interes, celular]
    );
    res.status(201).json({ message: 'Solicitud enviada con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar la solicitud' });
  }
};

exports.obtenerSolicitudes = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM admisiones ORDER BY fecha_registro DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
};

exports.eliminarSolicitud = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM admisiones WHERE id = $1', [id]);
    res.json({ message: 'Solicitud eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la solicitud' });
  }
};
