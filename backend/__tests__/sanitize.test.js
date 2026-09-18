/**
 * Tests de sanitización contra XSS.
 * Validan que el backend bloquee payloads maliciosos antes de persistir.
 */
process.env.JWT_SECRET = 'test_secret';
const { sanitizeHTML, sanitizeText, sanitizeBody } = require('../utils/sanitize');

describe('sanitizeHTML', () => {
  test('elimina <script> completo', () => {
    const input = 'Hola <script>alert("xss")</script> mundo';
    const out = sanitizeHTML(input);
    expect(out).not.toMatch(/<script/i);
    expect(out).toContain('Hola');
    expect(out).toContain('mundo');
  });

  test('elimina handlers de eventos on*', () => {
    const input = '<img src=x onerror="alert(1)">';
    const out = sanitizeHTML(input);
    expect(out).not.toMatch(/onerror/i);
  });

  test('permite etiquetas seguras (b, strong, p, br)', () => {
    const input = '<p>Hola <strong>mundo</strong></p>';
    const out = sanitizeHTML(input);
    expect(out).toContain('<strong>');
    expect(out).toContain('</strong>');
  });

  test('devuelve "" para null/undefined', () => {
    expect(sanitizeHTML(null)).toBe('');
    expect(sanitizeHTML(undefined)).toBe('');
    expect(sanitizeHTML('')).toBe('');
  });

  test('no rompe strings que no son HTML', () => {
    const input = 'Solo texto plano 123 #$%';
    expect(sanitizeHTML(input)).toBe(input);
  });
});

describe('sanitizeText', () => {
  test('remueve TODO el HTML dejando solo texto', () => {
    const input = '<b>Hola</b> <script>x</script> mundo';
    const out = sanitizeText(input);
    expect(out).not.toMatch(/<[^>]+>/);
    expect(out).toContain('Hola');
    expect(out).toContain('mundo');
  });
});

describe('sanitizeBody middleware', () => {
  test('limpia los campos listados en req.body', () => {
    const req = {
      body: {
        titulo: '<script>alert(1)</script>Noticia',
        descripcion: '<b>Texto</b>',
        otro: 'no se toca',
      },
    };
    const next = jest.fn();
    sanitizeBody(['titulo', 'descripcion'])(req, {}, next);
    expect(req.body.titulo).not.toMatch(/<script/i);
    expect(req.body.descripcion).toContain('<b>');
    expect(req.body.otro).toBe('no se toca');
    expect(next).toHaveBeenCalled();
  });

  test('si body no es objeto, sigue sin tocar nada', () => {
    const req = { body: null };
    const next = jest.fn();
    sanitizeBody(['titulo'])(req, {}, next);
    expect(next).toHaveBeenCalled();
  });
});

