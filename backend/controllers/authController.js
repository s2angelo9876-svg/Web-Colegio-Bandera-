const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'colegio_bandera_peru_secret';

// LOGIN (Copiado de la versión funcional que hicimos)
const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    const [results] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    if (results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const usuario = results[0];
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
      usuario: { id: usuario.id, username: usuario.username, rol: usuario.rol }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ESTA ES LA FUNCIÓN QUE TE FALTA EXPORTAR
const verificar = (req, res) => {
  res.json({ valido: true, usuario: req.usuario });
};

// EXPORTACIÓN COMPLETA
module.exports = { 
  login, 
  verificar 
};
