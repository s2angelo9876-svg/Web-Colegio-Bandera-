const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Configuración crítica faltante: JWT_SECRET no está definido en .env');
}

// Login
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

    return res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: { id: usuario.id, username: usuario.username, rol: usuario.rol },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Verificar token vivo
const verificar = (req, res) => {
  res.json({ valido: true, usuario: req.usuario });
};

module.exports = { login, verificar };
