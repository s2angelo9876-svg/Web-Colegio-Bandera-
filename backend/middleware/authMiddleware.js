const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'colegio_bandera_peru_secret'

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
  // LOG DE DIAGNÓSTICO
  console.log("DATOS DEL USUARIO EN EL TOKEN:", req.usuario);

  if (!req.usuario || req.usuario.rol !== 'admin') {
    console.log("BLOQUEADO: El rol es", req.usuario?.rol, "y se esperaba 'admin'");
    return res.status(403).json({ 
      error: 'Acceso solo para administradores',
      tu_rol_actual: req.usuario?.rol 
    });
  }
  next()
}

module.exports = { verificarToken, soloAdmin }