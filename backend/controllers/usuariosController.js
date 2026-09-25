const db = require('../config/db');
const bcrypt = require('bcryptjs');

const VALID_ROLES = ['admin', 'editor', 'user'];

// Cache del nombre de la columna de fecha de creacion
// (puede ser 'created_at' o 'creado_en' segun como se creo la tabla original)
let createdAtColumnCache = null;
async function getCreatedAtColumn() {
  if (createdAtColumnCache) return createdAtColumnCache;
  try {
    // Preferir 'created_at' sobre 'creado_en' (orden determinista)
    const { rows } = await db.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'usuarios'
        AND column_name IN ('created_at', 'creado_en')
      ORDER BY (column_name = 'created_at') DESC
      LIMIT 1
    `);
    createdAtColumnCache = rows[0]?.column_name || 'created_at';
  } catch {
    createdAtColumnCache = 'created_at';
  }
  return createdAtColumnCache;
}

// Listar usuarios (solo admin)
exports.getUsuarios = async (req, res) => {
  try {
    const createdAt = await getCreatedAtColumn();
    const { rows } = await db.query(
      `SELECT id, username, email, rol,
              to_char(ultimo_acceso, 'YYYY-MM-DD HH24:MI') AS ultimo_acceso,
              to_char(${createdAt}, 'YYYY-MM-DD') AS creado
       FROM usuarios
       ORDER BY rol DESC, username ASC`
    );
    res.json(rows);
  } catch (err) {
    const logger = require('../config/logger');
    logger.error('Error en getUsuarios', {
      message: err.message,
      code: err.code,
      detail: err.detail,
    });
    res.status(500).json({
      error: 'Error al obtener usuarios',
      detail: err.message,
    });
  }
};

// Crear usuario (solo admin)
exports.createUsuario = async (req, res) => {
  const { username, password, email, rol } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contrasena son obligatorios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contrasena debe tener al menos 6 caracteres' });
  }
  if (rol && !VALID_ROLES.includes(rol)) {
    return res.status(400).json({ error: 'Rol invalido' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO usuarios (username, password, email, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, rol`,
      [username.trim(), hash, email || null, rol || 'editor']
    );
    res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: rows[0] });
  } catch (err) {
    if (err.message && err.message.includes('duplicate')) {
      return res.status(409).json({ error: 'Ese usuario o email ya existe' });
    }
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

// Actualizar usuario (solo admin)
exports.updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { email, rol, password } = req.body;

  if (rol && !VALID_ROLES.includes(rol)) {
    return res.status(400).json({ error: 'Rol invalido' });
  }

  try {
    // Verificar que el usuario existe y no es el ultimo admin
    const { rows: existing } = await db.query('SELECT rol FROM usuarios WHERE id = $1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Prevenir dejar el sistema sin admins
    if (rol && rol !== 'admin' && existing[0].rol === 'admin') {
      const { rows: adminCount } = await db.query(
        "SELECT COUNT(*)::int AS n FROM usuarios WHERE rol = 'admin'"
      );
      if (adminCount[0].n <= 1) {
        return res.status(400).json({ error: 'No puedes quitar el rol admin al ultimo administrador.' });
      }
    }

    // Construir UPDATE dinamico
    const sets = [];
    const params = [];
    let i = 1;
    if (email !== undefined) { sets.push(`email = $${i++}`); params.push(email || null); }
    if (rol !== undefined) { sets.push(`rol = $${i++}`); params.push(rol); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      sets.push(`password = $${i++}`);
      params.push(hash);
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'Nada que actualizar' });
    }

    params.push(parseInt(id, 10));
    const { rows } = await db.query(
      `UPDATE usuarios SET ${sets.join(', ')} WHERE id = $${i} RETURNING id, username, email, rol`,
      params
    );
    res.json({ mensaje: 'Usuario actualizado', usuario: rows[0] });
  } catch (err) {
    if (err.message && err.message.includes('duplicate')) {
      return res.status(409).json({ error: 'Ese email ya esta en uso' });
    }
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

// Eliminar usuario (solo admin, no se puede eliminar a si mismo ni al ultimo admin)
exports.deleteUsuario = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.usuario.id;

  if (parseInt(id, 10) === currentUserId) {
    return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
  }

  try {
    const { rows: existing } = await db.query('SELECT rol FROM usuarios WHERE id = $1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Prevenir dejar el sistema sin admins
    if (existing[0].rol === 'admin') {
      const { rows: adminCount } = await db.query(
        "SELECT COUNT(*)::int AS n FROM usuarios WHERE rol = 'admin'"
      );
      if (adminCount[0].n <= 1) {
        return res.status(400).json({ error: 'No puedes eliminar al ultimo administrador.' });
      }
    }

    await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};
