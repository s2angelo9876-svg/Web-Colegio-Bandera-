const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Configuración crítica faltante: JWT_SECRET no está definido en .env');
}

function extractToken(req) {
  // 1. Authorization: Bearer xxx
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  // 2. Cookie httpOnly
  if (req.cookies && req.cookies.cbp_token) {
    return req.cookies.cbp_token;
  }
  return null;
}

const verificarToken = (req, res, next) => {
  const token = extractToken(req);

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

const soloAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({
      error: 'Acceso solo para administradores',
      tu_rol_actual: req.usuario?.rol,
    });
  }
  next();
};

module.exports = { verificarToken, soloAdmin };
