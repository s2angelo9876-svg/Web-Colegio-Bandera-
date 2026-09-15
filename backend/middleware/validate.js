const { validationResult } = require('express-validator');

/**
 * Middleware genérico que captura los errores de express-validator
 * y los devuelve en una respuesta 400 uniforme.
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((e) => ({
        field: e.path || e.param,
        msg: e.msg,
      })),
    });
  }
  next();
}

module.exports = { handleValidation };
