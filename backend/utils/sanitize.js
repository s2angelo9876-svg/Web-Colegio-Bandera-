const xss = require('xss');

const XSS_OPTIONS = {
  whiteList: {
    b: [], i: [], em: [], strong: [], p: [], br: [],
    ul: [], ol: [], li: [],
    h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
    a: ['href', 'target', 'rel'],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
};

/**
 * Sanitiza un string permitiendo un set limitado de HTML seguro.
 * Normaliza null/undefined a string vacio para evitar bugs en consumidores.
 */
function sanitizeHTML(value) {
  if (value == null) return '';
  if (typeof value !== 'string') return String(value);
  return xss(value, XSS_OPTIONS);
}

/**
 * Sanitiza un string removiendo TODO el HTML (solo texto plano).
 * Normaliza null/undefined a string vacio.
 */
function sanitizeText(value) {
  if (value == null) return '';
  if (typeof value !== 'string') return String(value);
  return xss(value, { whiteList: {}, stripIgnoreTag: true });
}

/**
 * Middleware que sanitiza los campos de texto en req.body.
 * Uso: router.post('/', sanitizeBody(['titulo', 'descripcion']), handler)
 */
function sanitizeBody(fields = []) {
  return (req, _res, next) => {
    if (!req.body || typeof req.body !== 'object') return next();
    for (const field of fields) {
      if (field in req.body && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeHTML(req.body[field]);
      }
    }
    next();
  };
}

module.exports = { sanitizeHTML, sanitizeText, sanitizeBody };
