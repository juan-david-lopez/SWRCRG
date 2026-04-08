'use strict';

const request = require('supertest');
const app     = require('../src/app');
const { cleanUsers, closePool } = require('./helpers/db');

const BASE = '/api/auth';

const validUser = {
  nombre:    'Juan',
  apellido:  'Pérez',
  correo:    'juan.perez@test.com',
  contrasena: 'segura123',
  telefono:  '3001234567',
};

beforeEach(async () => {
  await cleanUsers();
});

afterAll(async () => {
  await cleanUsers();
  await closePool();
});

// ─── Casos exitosos ───────────────────────────────────────────────────────────

describe('POST /api/auth/register — casos exitosos', () => {
  test('registra un usuario con todos los campos y devuelve 201', async () => {
    const res = await request(app).post(`${BASE}/register`).send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      nombre:   validUser.nombre,
      apellido: validUser.apellido,
      correo:   validUser.correo,
    });
  });

  test('no devuelve la contraseña en la respuesta', async () => {
    const res = await request(app).post(`${BASE}/register`).send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user.contrasena).toBeUndefined();
  });

  test('asigna el rol ciudadano por defecto', async () => {
    const res = await request(app).post(`${BASE}/register`).send(validUser);

    expect(res.status).toBe(201);
    // rol_id debe existir (ciudadano = id 1 por seed)
    expect(res.body.user.rol_id).toBeDefined();
  });

  test('registra usuario sin teléfono (campo opcional)', async () => {
    const { telefono, ...sinTelefono } = validUser;
    const res = await request(app).post(`${BASE}/register`).send(sinTelefono);

    expect(res.status).toBe(201);
    expect(res.body.user.correo).toBe(validUser.correo);
  });
});

// ─── Validaciones de campos obligatorios ─────────────────────────────────────

describe('POST /api/auth/register — campos obligatorios', () => {
  test('falla sin nombre → 400', async () => {
    const { nombre, ...body } = validUser;
    const res = await request(app).post(`${BASE}/register`).send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('falla sin apellido → 400', async () => {
    const { apellido, ...body } = validUser;
    const res = await request(app).post(`${BASE}/register`).send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('falla sin correo → 400', async () => {
    const { correo, ...body } = validUser;
    const res = await request(app).post(`${BASE}/register`).send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('falla sin contraseña → 400', async () => {
    const { contrasena, ...body } = validUser;
    const res = await request(app).post(`${BASE}/register`).send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

// ─── Validaciones de formato ──────────────────────────────────────────────────

describe('POST /api/auth/register — validaciones de formato', () => {
  test('falla con correo inválido → 400', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...validUser, correo: 'no-es-un-correo' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/correo/i);
  });

  test('falla con contraseña menor a 6 caracteres → 400', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...validUser, contrasena: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

// ─── Duplicados ───────────────────────────────────────────────────────────────

describe('POST /api/auth/register — correo duplicado', () => {
  test('falla al registrar el mismo correo dos veces → 409', async () => {
    await request(app).post(`${BASE}/register`).send(validUser);

    const res = await request(app).post(`${BASE}/register`).send(validUser);
    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
  });
});
