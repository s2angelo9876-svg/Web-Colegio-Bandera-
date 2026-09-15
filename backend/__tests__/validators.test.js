/**
 * Tests de los schemas de validación con express-validator.
 */
process.env.JWT_SECRET = 'test';
const { validationResult } = require('express-validator');
const schemas = require('../../validators/schemas');

async function runValidation(schema, body) {
  const req = { body };
  for (const validator of schema) {
    await validator.run(req);
  }
  return validationResult(req);
}

describe('schema login', () => {
  test('rechaza body vacío', async () => {
    const result = await runValidation(schemas.login, {});
    expect(result.isEmpty()).toBe(false);
    const fields = result.array().map((e) => e.path);
    expect(fields).toContain('username');
    expect(fields).toContain('password');
  });

  test('rechaza password muy corta', async () => {
    const result = await runValidation(schemas.login, { username: 'admin', password: '12' });
    expect(result.isEmpty()).toBe(false);
    expect(result.array().some((e) => e.path === 'password')).toBe(true);
  });

  test('acepta credenciales válidas', async () => {
    const result = await runValidation(schemas.login, { username: 'admin', password: '12345678' });
    expect(result.isEmpty()).toBe(true);
  });
});

describe('schema noticia', () => {
  test('rechaza falta de titulo y contenido', async () => {
    const result = await runValidation(schemas.noticia, {});
    expect(result.isEmpty()).toBe(false);
  });

  test('acepta titulo y contenido válidos', async () => {
    const result = await runValidation(schemas.noticia, {
      titulo: 'Nueva noticia',
      contenido: 'Contenido del aviso institucional',
    });
    expect(result.isEmpty()).toBe(true);
  });

  test('rechaza titulo demasiado largo (>255)', async () => {
    const result = await runValidation(schemas.noticia, {
      titulo: 'a'.repeat(256),
      contenido: 'ok',
    });
    expect(result.isEmpty()).toBe(false);
  });
});

describe('schema mesaPartes', () => {
  test('rechaza DNI no numérico', async () => {
    const result = await runValidation(schemas.mesaPartes, {
      asunto: 'asunto',
      nombres_completos: 'Juan',
      dni: 'abc12345',
      direccion: 'Calle 1',
      telefono: '987654321',
      fundamentacion: 'motivo',
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array().some((e) => e.path === 'dni')).toBe(true);
  });

  test('rechaza email inválido', async () => {
    const result = await runValidation(schemas.mesaPartes, {
      asunto: 'asunto',
      nombres_completos: 'Juan',
      dni: '12345678',
      direccion: 'Calle 1',
      telefono: '987654321',
      correo: 'no-es-email',
      fundamentacion: 'motivo',
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array().some((e) => e.path === 'correo')).toBe(true);
  });

  test('acepta trámite válido completo', async () => {
    const result = await runValidation(schemas.mesaPartes, {
      asunto: 'Solicitud de certificado',
      nombres_completos: 'Juan Pérez',
      dni: '12345678',
      direccion: 'Av. Principal 123',
      telefono: '987654321',
      correo: 'juan@example.com',
      fundamentacion: 'Necesito el certificado de estudios',
    });
    expect(result.isEmpty()).toBe(true);
  });
});

describe('schema estadoMesaPartes', () => {
  test.each(['pendiente', 'en_proceso', 'resuelto'])('acepta estado %s', async (estado) => {
    const result = await runValidation(schemas.estadoMesaPartes, { estado });
    expect(result.isEmpty()).toBe(true);
  });

  test('rechaza estado inválido', async () => {
    const result = await runValidation(schemas.estadoMesaPartes, { estado: 'borrado' });
    expect(result.isEmpty()).toBe(false);
  });
});
