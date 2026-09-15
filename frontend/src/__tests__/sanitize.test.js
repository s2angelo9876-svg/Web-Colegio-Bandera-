import { describe, test, expect } from 'vitest';
import { sanitizeHTML, sanitizeText, validateDNI, validateEmail, validatePhone } from '../utils/sanitize';

describe('sanitizeHTML (frontend)', () => {
  test('elimina scripts', () => {
    const out = sanitizeHTML('<script>alert(1)</script>Hola');
    expect(out).not.toMatch(/<script/i);
    expect(out).toContain('Hola');
  });

  test('permite <b> y <strong>', () => {
    const out = sanitizeHTML('<b>Hola</b> <strong>mundo</strong>');
    expect(out).toContain('<b>');
    expect(out).toContain('<strong>');
  });

  test('devuelve "" para valores vacíos', () => {
    expect(sanitizeHTML('')).toBe('');
    expect(sanitizeHTML(null)).toBe('');
  });
});

describe('sanitizeText', () => {
  test('remueve todo HTML dejando solo texto', () => {
    const out = sanitizeText('<a href="x">click</a> aqui');
    expect(out).not.toMatch(/<[^>]+>/);
    expect(out).toContain('click');
  });
});

describe('validateDNI', () => {
  test.each(['12345678', '87654321'])('acepta DNI válido %s', (dni) => {
    expect(validateDNI(dni).valid).toBe(true);
  });

  test.each(['1234567', '123456789', '1234abcd', ''])('rechaza DNI inválido %s', (dni) => {
    expect(validateDNI(dni).valid).toBe(false);
  });
});

describe('validateEmail', () => {
  test('acepta emails válidos', () => {
    expect(validateEmail('user@example.com').valid).toBe(true);
    expect(validateEmail('user.name+tag@sub.example.co').valid).toBe(true);
  });

  test('rechaza emails inválidos', () => {
    expect(validateEmail('no-es-email').valid).toBe(false);
    expect(validateEmail('@example.com').valid).toBe(false);
    expect(validateEmail('user@').valid).toBe(false);
  });
});

describe('validatePhone', () => {
  test('acepta teléfonos de 7-9 dígitos', () => {
    expect(validatePhone('1234567').valid).toBe(true);
    expect(validatePhone('987654321').valid).toBe(true);
  });

  test('rechaza teléfonos fuera de rango o con letras', () => {
    expect(validatePhone('123456').valid).toBe(false);
    expect(validatePhone('1234567890').valid).toBe(false);
    expect(validatePhone('abc12345').valid).toBe(false);
  });
});
