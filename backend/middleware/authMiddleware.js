const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('Configuración crítica faltante: JWT_SECRET no está definido en .env')
}

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ error: 'Token requerido' })

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.usuario = decoded
    next()
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' })
  }
}

const soloAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({
      error: 'Acceso solo para administradores',
      tu_rol_actual: req.usuario?.rol
    });
  }
  next()
}

module.exports = { verificarToken, soloAdmin }