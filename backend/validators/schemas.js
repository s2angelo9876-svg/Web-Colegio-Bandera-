const { body, param } = require('express-validator');

const login = [
  body('username').trim().notEmpty().withMessage('El usuario es requerido').isLength({ max: 255 }),
  body('password').isLength({ min: 4 }).withMessage('La contraseña debe tener al menos 4 caracteres'),
];

const noticia = [
  body('titulo').trim().notEmpty().withMessage('El título es requerido').isLength({ max: 255 }),
  body('contenido').trim().notEmpty().withMessage('El contenido es requerido').isLength({ max: 50_000 }),
];

const evento = [
  body('titulo').trim().notEmpty().withMessage('El título es requerido').isLength({ max: 255 }),
  body('descripcion').optional({ checkFalsy: true }).isLength({ max: 5_000 }),
  body('fecha_evento').notEmpty().withMessage('La fecha es obligatoria').isISO8601().withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
  body('hora_evento').optional({ checkFalsy: true }).matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Hora inválida (HH:MM)'),
  body('lugar').optional({ checkFalsy: true }).isLength({ max: 255 }),
];

const comunicado = [
  body('titulo').trim().notEmpty().withMessage('El título es requerido').isLength({ max: 255 }),
  body('descripcion').trim().notEmpty().withMessage('La descripción es requerida').isLength({ max: 10_000 }),
  body('tipo').optional().isIn(['urgente', 'academico', 'administrativo', 'general', 'aviso'])
    .withMessage('Tipo de comunicado inválido'),
];

const docente = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 255 }),
  body('cargo').optional({ checkFalsy: true }).isLength({ max: 255 }),
  body('especialidad').optional({ checkFalsy: true }).isLength({ max: 255 }),
  body('orden').optional().isInt({ min: 0 }).withMessage('Orden debe ser entero >= 0'),
];

const administrativo = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 255 }),
  body('cargo').optional({ checkFalsy: true }).isLength({ max: 255 }),
  body('area').optional({ checkFalsy: true }).isLength({ max: 255 }),
];

const directivo = [
  body('nombres').trim().notEmpty().withMessage('Los nombres son requeridos').isLength({ max: 255 }),
  body('cargo').optional({ checkFalsy: true }).isLength({ max: 255 }),
  body('frase').optional({ checkFalsy: true }).isLength({ max: 1_000 }),
  body('correo').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido').isLength({ max: 255 }),
  body('orden').optional().isInt({ min: 0 }),
];

const admision = [
  body('nombre_padre').trim().notEmpty().withMessage('Nombre del padre es requerido').isLength({ max: 255 }),
  body('nombre_estudiante').trim().notEmpty().withMessage('Nombre del estudiante es requerido').isLength({ max: 255 }),
  body('grado_interes').trim().notEmpty().withMessage('El grado es requerido').isLength({ max: 100 }),
  body('celular').trim().matches(/^\d{7,15}$/).withMessage('Celular inválido (solo dígitos, 7-15 caracteres)'),
];

const transparencia = [
  body('titulo').trim().notEmpty().withMessage('El título es requerido').isLength({ max: 255 }),
  body('descripcion').optional({ checkFalsy: true }).isLength({ max: 5_000 }),
  body('categoria').trim().notEmpty().withMessage('La categoría es requerida').isLength({ max: 100 }),
];

const carrusel = [
  body('titulo').optional({ checkFalsy: true }).isLength({ max: 255 }),
  body('subtitulo').optional({ checkFalsy: true }).isLength({ max: 500 }),
  body('orden').optional().isInt().withMessage('El orden debe ser un número'),
];

const galeria = [
  body('titulo').optional({ checkFalsy: true }).isLength({ max: 255 }),
  body('tipo').optional().isIn(['foto', 'video']).withMessage('Tipo debe ser "foto" o "video"'),
  body('video_url').optional({ checkFalsy: true }).isURL().withMessage('URL de video inválida').isLength({ max: 500 }),
];

const mesaPartes = [
  body('asunto').trim().notEmpty().withMessage('El asunto es requerido').isLength({ max: 255 }),
  body('nombres_completos').trim().notEmpty().withMessage('Los nombres son requeridos').isLength({ max: 255 }),
  body('dni').trim().matches(/^\d{8}$/).withMessage('DNI debe tener 8 dígitos'),
  body('direccion').trim().notEmpty().withMessage('La dirección es requerida').isLength({ max: 500 }),
  body('telefono').trim().matches(/^\d{7,15}$/).withMessage('Teléfono inválido'),
  body('correo').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido').isLength({ max: 255 }),
  body('fundamentacion').trim().notEmpty().withMessage('La fundamentación es requerida').isLength({ max: 10_000 }),
];

const estadoMesaPartes = [
  body('estado').isIn(['pendiente', 'en_proceso', 'resuelto']).withMessage('Estado inválido'),
];

const idParam = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido').toInt(),
];

module.exports = {
  login, noticia, evento, comunicado, docente, administrativo,
  directivo, admision, transparencia, carrusel, galeria,
  mesaPartes, estadoMesaPartes, idParam,
};
