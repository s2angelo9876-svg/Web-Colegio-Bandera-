const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Configuración crítica faltante: JWT_SECRET no está definido en .env');
}

const COOKIE_NAME = 'cbp_token';
const COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 horas

// En producción usa Secure (solo HTTPS). En dev puede ir sin él.
function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  };
}

// Login: ahora setea cookie httpOnly Y devuelve token (para compatibilidad)
const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    const { rows } = await db.query(
      'SELECT id, username, password, rol FROM usuarios WHERE username = $1',
      [username]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: usuario.id, username: usuario.username, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie(COOKIE_NAME, token, cookieOptions());

    return res.json({
      mensaje: 'Login exitoso',
      token, // sigue siendo útil para clientes no-cookie
      usuario: { id: usuario.id, username: usuario.username, rol: usuario.rol },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Verificar token vivo (lee de cookie O de Authorization header)
const verificar = (req, res) => {
  res.json({ valido: true, usuario: req.usuario });
};

// Logout: limpia la cookie
const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ mensaje: 'Sesión cerrada' });
};

// Cambiar contrasena del usuario autenticado
const cambiarPassword = async (req, res) => {
  const { passwordActual, passwordNueva } = req.body;
  const userId = req.usuario.id;

  if (!passwordActual || !passwordNueva) {
    return res.status(400).json({ error: 'Debes ingresar la contrasena actual y la nueva.' });
  }
  if (passwordNueva.length < 6) {
    return res.status(400).json({ error: 'La nueva contrasena debe tener al menos 6 caracteres.' });
  }
  if (passwordActual === passwordNueva) {
    return res.status(400).json({ error: 'La nueva contrasena debe ser diferente a la actual.' });
  }

  try {
    const { rows } = await db.query('SELECT password FROM usuarios WHERE id = $1', [userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const passwordValida = await bcrypt.compare(passwordActual, rows[0].password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'La contrasena actual es incorrecta.' });
    }

    const nuevoHash = await bcrypt.hash(passwordNueva, 10);
    await db.query('UPDATE usuarios SET password = $1 WHERE id = $2', [nuevoHash, userId]);

    res.json({ mensaje: 'Contrasena actualizada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar la contrasena.' });
  }
};

// Actualizar perfil del usuario autenticado (email, username)
const actualizarPerfil = async (req, res) => {
  const { username, email } = req.body;
  const userId = req.usuario.id;

  if (!username || username.trim().length < 3) {
    return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres.' });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'El email no tiene formato valido.' });
  }

  try {
    // Verificar unicidad de username y email
    const { rows: dupes } = await db.query(
      'SELECT id FROM usuarios WHERE (username = $1 OR (email = $2 AND $2 IS NOT NULL)) AND id != $3',
      [username, email || null, userId]
    );
    if (dupes.length > 0) {
      return res.status(409).json({ error: 'Ese usuario o email ya esta en uso.' });
    }

    await db.query(
      'UPDATE usuarios SET username = $1, email = $2 WHERE id = $3',
      [username.trim(), email || null, userId]
    );

    const { rows } = await db.query(
      'SELECT id, username, email, rol FROM usuarios WHERE id = $1',
      [userId]
    );
    res.json({ mensaje: 'Perfil actualizado.', usuario: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el perfil.' });
  }
};

module.exports = {
  login,
  verificar,
  logout,
  cambiarPassword,
  actualizarPerfil,
  COOKIE_NAME,
};
