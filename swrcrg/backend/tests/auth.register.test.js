'use strict';

/**
 * Suite: Autenticación — Registro e inicio de sesión
 * Cubre: POST /api/auth/register
 *        POST /api/auth/login
 *        GET  /api/auth/me
 */

const request = require('supertest');
const app     = require('../src/app');
const {
  cleanTestData,
  crearUsuarioCiudadano,
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

// ─── register ────────────────────────────────────────────────────────────────

describe('POST /api/auth/register — casos exitosos', () => {
  test('registra un usuario y devuelve 201', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send(VALID_USER);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      nombre:   VALID_USER.nombre,
      apellido: VALID_USER.apellido,
      correo:   VALID_USER.correo,
    });
  });

  test('no devuelve la contraseña en la respuesta', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send(VALID_USER);

    expect(res.status).toBe(201);
    expect(res.body.user.contrasena).toBeUndefined();
  });

  test('asigna el rol ciudadano por defecto', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send(VALID_USER);

    expect(res.status).toBe(201);
    expect(res.body.user.rol_id).toBeDefined();
  });

  test('registra usuario sin teléfono (campo opcional)', async () => {
    const { telefono, ...sinTelefono } = VALID_USER;

    const res = await request(app)
      .post(`${BASE}/register`)
      .send(sinTelefono);

    expect(res.status).toBe(201);
    expect(res.body.user.correo).toBe(VALID_USER.correo);
  });
});

describe('POST /api/auth/register — validaciones de campos', () => {
  test('falla sin nombre → 400', async () => {
    const { nombre, ...body } = VALID_USER;

    const res = await request(app)
      .post(`${BASE}/register`)
      .send(body);

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('falla sin apellido → 400', async () => {
    const { apellido, ...body } = VALID_USER;

    const res = await request(app)
      .post(`${BASE}/register`)
      .send(body);

    expect(res.status).toBe(400);
  });

  test('falla con correo inválido → 400', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...VALID_USER, correo: 'no-es-correo' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/correo/i);
  });

  test('falla con contraseña sin mayúscula → 400', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...VALID_USER, contrasena: 'sinmayuscula1' });

    expect(res.status).toBe(400);
  });

  test('falla con contraseña menor a 6 caracteres → 400', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...VALID_USER, contrasena: 'Ab1' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/register — correo duplicado', () => {
  test('falla al registrar el mismo correo dos veces → 409', async () => {
    await request(app).post(`${BASE}/register`).send(VALID_USER);

    const res = await request(app)
      .post(`${BASE}/register`)
      .send(VALID_USER);

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/registrado/i);
  });
});

// ─── login ────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
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
