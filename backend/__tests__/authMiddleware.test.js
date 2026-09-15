/**
 * Tests del middleware de autenticación.
 * Validan que el JWT se verifique correctamente desde cookies y Authorization header.
 */

// Mockeamos las dependencias antes de requerir el middleware
process.env.JWT_SECRET = 'test_secret_key_for_unit_tests_only';

const jwt = require('jsonwebtoken');
const { verificarToken, soloAdmin } = require('../../middleware/authMiddleware');

function mockReqRes(headers = {}, cookies = {}) {
  const req = { headers, cookies };
  const res = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('verificarToken', () => {
  test('rechaza si no hay token ni cookie', () => {
    const { req, res, next } = mockReqRes();
    verificarToken(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Token requerido');
    expect(next).not.toHaveBeenCalled();
  });

  test('acepta token válido vía Authorization Bearer', () => {
    const token = jwt.sign({ id: 1, rol: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const { req, res, next } = mockReqRes({ authorization: `Bearer ${token}` });
    verificarToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.usuario.rol).toBe('admin');
  });

  test('acepta token válido vía cookie httpOnly', () => {
    const token = jwt.sign({ id: 2, rol: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const { req, res, next } = mockReqRes({}, { cbp_token: token });
    verificarToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.usuario.id).toBe(2);
  });

  test('rechaza token expirado', () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const { req, res, next } = mockReqRes({ authorization: `Bearer ${token}` });
    verificarToken(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/expirado|inválido/i);
    expect(next).not.toHaveBeenCalled();
  });

  test('rechaza token con firma inválida', () => {
    const token = jwt.sign({ id: 1 }, 'otro_secreto', { expiresIn: '1h' });
    const { req, res, next } = mockReqRes({ authorization: `Bearer ${token}` });
    verificarToken(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('soloAdmin', () => {
  test('permite paso si rol es admin', () => {
    const { req, res, next } = mockReqRes();
    req.usuario = { id: 1, rol: 'admin' };
    soloAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('bloquea si rol es user', () => {
    const { req, res, next } = mockReqRes();
    req.usuario = { id: 1, rol: 'user' };
    soloAdmin(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/administradores/i);
    expect(next).not.toHaveBeenCalled();
  });

  test('bloquea si no hay usuario en req', () => {
    const { req, res, next } = mockReqRes();
    soloAdmin(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });
});
