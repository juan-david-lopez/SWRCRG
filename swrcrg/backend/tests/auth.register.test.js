'use strict';

/**
 * Suite: Autenticación — Registro e inicio de sesión
 * Cubre: POST /api/auth/send-verification-code
 *        POST /api/auth/register
 *        POST /api/auth/login
 *        GET  /api/auth/me
 */

const request = require('supertest');
const app     = require('../src/app');
const {
  cleanTestData,
  crearUsuarioCiudadano,
  crearCodigoVerificacion,
  closeDb,
} = require('./helpers/db');

const BASE = '/api/auth';

const VALID_USER = {
  nombre:    'Juan',
  apellido:  'Pérez',
  correo:    'juan.perez@test.com',
  contrasena: 'Segura123',
  telefono:  '3001234567',
};

beforeEach(async () => {
  await cleanTestData();
});

afterAll(async () => {
  await cleanTestData();
  await closeDb();
});

// ─── send-verification-code ───────────────────────────────────────────────────

describe('POST /api/auth/send-verification-code', () => {
  test('devuelve 200 y el código (modo dev) para un correo nuevo', async () => {
    const res = await request(app)
      .post(`${BASE}/send-verification-code`)
      .send({ correo: VALID_USER.correo });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Código enviado');
    expect(res.body.codigo).toMatch(/^\d{6}$/);
  });

  test('devuelve 400 con correo inválido', async () => {
    const res = await request(app)
      .post(`${BASE}/send-verification-code`)
      .send({ correo: 'no-es-correo' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('devuelve 409 si el correo ya está registrado', async () => {
    await crearUsuarioCiudadano({ correo: VALID_USER.correo });

    const res = await request(app)
      .post(`${BASE}/send-verification-code`)
      .send({ correo: VALID_USER.correo });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/registrado/i);
  });
});

// ─── register ────────────────────────────────────────────────────────────────

describe('POST /api/auth/register — casos exitosos', () => {
  test('registra un usuario con código válido y devuelve 201', async () => {
    await crearCodigoVerificacion(VALID_USER.correo, '654321');

    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...VALID_USER, codigo: '654321' });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      nombre:   VALID_USER.nombre,
      apellido: VALID_USER.apellido,
      correo:   VALID_USER.correo,
    });
  });

  test('no devuelve la contraseña en la respuesta', async () => {
    await crearCodigoVerificacion(VALID_USER.correo, '111111');

    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...VALID_USER, codigo: '111111' });

    expect(res.status).toBe(201);
    expect(res.body.user.contrasena).toBeUndefined();
  });

  test('asigna el rol ciudadano por defecto', async () => {
    await crearCodigoVerificacion(VALID_USER.correo, '222222');

    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...VALID_USER, codigo: '222222' });

    expect(res.status).toBe(201);
    expect(res.body.user.rol_id).toBeDefined();
  });

  test('registra usuario sin teléfono (campo opcional)', async () => {
    await crearCodigoVerificacion(VALID_USER.correo, '333333');
    const { telefono, ...sinTelefono } = VALID_USER;

    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...sinTelefono, codigo: '333333' });

    expect(res.status).toBe(201);
    expect(res.body.user.correo).toBe(VALID_USER.correo);
  });
});

describe('POST /api/auth/register — validaciones de campos', () => {
  test('falla sin nombre → 400', async () => {
    await crearCodigoVerificacion(VALID_USER.correo, '444444');
    const { nombre, ...body } = VALID_USER;

    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...body, codigo: '444444' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('falla sin apellido → 400', async () => {
    await crearCodigoVerificacion(VALID_USER.correo, '555555');
    const { apellido, ...body } = VALID_USER;

    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...body, codigo: '555555' });

    expect(res.status).toBe(400);
  });

  test('falla con correo inválido → 400', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...VALID_USER, correo: 'no-es-correo', codigo: '000000' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/correo/i);
  });

  test('falla con contraseña sin mayúscula → 400', async () => {
    await crearCodigoVerificacion(VALID_USER.correo, '666666');

    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...VALID_USER, contrasena: 'sinmayuscula1', codigo: '666666' });

    expect(res.status).toBe(400);
  });

  test('falla con contraseña menor a 6 caracteres → 400', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...VALID_USER, contrasena: 'Ab1', codigo: '000000' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/register — código de verificación', () => {
  test('falla sin código → 400', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send(VALID_USER); // sin campo codigo

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/código/i);
  });

  test('falla con código incorrecto → 400', async () => {
    await crearCodigoVerificacion(VALID_USER.correo, '123456');

    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...VALID_USER, codigo: '999999' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/inválido|expirado/i);
  });

  test('falla con código ya usado → 400', async () => {
    await crearCodigoVerificacion(VALID_USER.correo, '123456');

    // Primer registro — exitoso
    await request(app)
      .post(`${BASE}/register`)
      .send({ ...VALID_USER, codigo: '123456' });

    // Segundo intento con el mismo código — debe fallar
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...VALID_USER, correo: 'otro@test.com', codigo: '123456' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/register — correo duplicado', () => {
  test('falla al registrar el mismo correo dos veces → 409', async () => {
    await crearCodigoVerificacion(VALID_USER.correo, '123456');
    await request(app).post(`${BASE}/register`).send({ ...VALID_USER, codigo: '123456' });

    // Intentar registrar de nuevo el mismo correo
    const res = await request(app)
      .post(`${BASE}/send-verification-code`)
      .send({ correo: VALID_USER.correo });

    expect(res.status).toBe(409);
  });
});

// ─── login ────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Crear usuario directamente para no depender del flujo de registro
    await crearUsuarioCiudadano({ correo: VALID_USER.correo });
  });

  test('login exitoso devuelve token y datos del usuario', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ correo: VALID_USER.correo, contrasena: 'Test123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toMatchObject({ correo: VALID_USER.correo });
    expect(res.body.user.contrasena).toBeUndefined();
  });

  test('falla con contraseña incorrecta → 401', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ correo: VALID_USER.correo, contrasena: 'Incorrecta99' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/credenciales/i);
  });

  test('falla con correo inexistente → 401', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ correo: 'noexiste@test.com', contrasena: 'Test123' });

    expect(res.status).toBe(401);
  });

  test('falla sin correo o contraseña → 400', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ correo: VALID_USER.correo });

    expect(res.status).toBe(400);
  });

  test('falla si el usuario está inactivo → 403', async () => {
    await crearUsuarioCiudadano({ correo: 'inactivo@test.com', activo: false });

    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ correo: 'inactivo@test.com', contrasena: 'Test123' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/inactivo/i);
  });
});

// ─── GET /me ─────────────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  test('devuelve el usuario autenticado con token válido', async () => {
    await crearUsuarioCiudadano({ correo: VALID_USER.correo });

    const loginRes = await request(app)
      .post(`${BASE}/login`)
      .send({ correo: VALID_USER.correo, contrasena: 'Test123' });

    const token = loginRes.body.token;

    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    // El middleware de auth expone el usuario; verificamos que tiene id
    expect(res.body.user.id).toBeDefined();
  });

  test('devuelve 401 sin token', async () => {
    const res = await request(app).get(`${BASE}/me`);
    expect(res.status).toBe(401);
  });

  test('devuelve 401 con token inválido', async () => {
    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', 'Bearer token.invalido.aqui');

    expect(res.status).toBe(401);
  });
});
