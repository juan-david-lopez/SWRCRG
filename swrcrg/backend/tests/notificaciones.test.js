'use strict';

/**
 * Suite: Notificaciones
 * Cubre: GET    /api/notificaciones
 *        PATCH  /api/notificaciones/:id/leer
 *        PATCH  /api/notificaciones/leer-todas
 *
 * Las notificaciones se generan automáticamente al cambiar el estado de un reporte.
 */

const request = require('supertest');
const app     = require('../src/app');
const {
  cleanTestData,
  crearUsuarioCiudadano,
  crearUsuarioAdmin,
  getCategoria,
  closeDb,
} = require('./helpers/db');

const BASE_NOTIF   = '/api/notificaciones';
const BASE_REPORTE = '/api/reportes';

const loginAs = async (correo, contrasena) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ correo, contrasena });
  return res.body.token;
};

let tokenCiudadano;
let tokenAdmin;
let categoriaId;

beforeAll(async () => {
  await cleanTestData();

  await crearUsuarioCiudadano({ correo: 'ciudadano@test.com' });
  await crearUsuarioAdmin({ correo: 'testadmin@test.com' });
  categoriaId = await getCategoria();

  tokenCiudadano = await loginAs('ciudadano@test.com', 'Test123');
  tokenAdmin     = await loginAs('testadmin@test.com', 'Admin123');
});

afterAll(async () => {
  await cleanTestData();
  await closeDb();
});

// ── Helper para crear reporte y cambiar estado ────────────────────────────────

const crearYCambiarEstado = async (estado, motivo = '') => {
  const createRes = await request(app)
    .post(BASE_REPORTE)
    .set('Authorization', `Bearer ${tokenCiudadano}`)
    .field('titulo',       'Reporte para notificación')
    .field('descripcion',  'Descripción')
    .field('latitud',      '4.7110')
    .field('longitud',     '-74.0721')
    .field('categoria_id', categoriaId);

  const id = createRes.body.reporte.id;

  await request(app)
    .put(`${BASE_REPORTE}/${id}/estado`)
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ estado, ...(motivo ? { motivo_rechazo: motivo } : {}) });

  return id;
};

// ─── Listar notificaciones ────────────────────────────────────────────────────

describe('GET /api/notificaciones', () => {
  test('devuelve lista de notificaciones del usuario autenticado', async () => {
    const res = await request(app)
      .get(BASE_NOTIF)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.notificaciones)).toBe(true);
  });

  test('falla sin autenticación → 401', async () => {
    const res = await request(app).get(BASE_NOTIF);
    expect(res.status).toBe(401);
  });

  test('genera notificación al verificar un reporte', async () => {
    await crearYCambiarEstado('verificado');

    const res = await request(app)
      .get(BASE_NOTIF)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    expect(res.status).toBe(200);
    const notifs = res.body.notificaciones;
    const notifVerificado = notifs.find((n) => n.tipo === 'cambio_estado');
    expect(notifVerificado).toBeDefined();
    expect(notifVerificado.leida).toBe(false);
  });

  test('genera notificación al rechazar un reporte', async () => {
    await crearYCambiarEstado('rechazado', 'No cumple los requisitos');

    const res = await request(app)
      .get(BASE_NOTIF)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    expect(res.status).toBe(200);
    const notifRechazado = res.body.notificaciones.find((n) => n.tipo === 'reporte_rechazado');
    expect(notifRechazado).toBeDefined();
  });
});

// ─── Marcar notificación como leída ──────────────────────────────────────────

describe('PATCH /api/notificaciones/:id/leer', () => {
  let notifId;

  beforeAll(async () => {
    await crearYCambiarEstado('verificado');

    const res = await request(app)
      .get(BASE_NOTIF)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    const notif = res.body.notificaciones.find((n) => !n.leida);
    notifId = notif?.id;
  });

  test('marca una notificación como leída', async () => {
    if (!notifId) return; // skip si no hay notificaciones no leídas

    const res = await request(app)
      .patch(`${BASE_NOTIF}/${notifId}/leer`)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    expect(res.status).toBe(200);
    expect(res.body.notificacion.leida).toBe(true);
  });

  test('falla sin autenticación → 401', async () => {
    const res = await request(app)
      .patch(`${BASE_NOTIF}/00000000-0000-0000-0000-000000000000/leer`);

    expect(res.status).toBe(401);
  });
});

// ─── Marcar todas como leídas ─────────────────────────────────────────────────

describe('PATCH /api/notificaciones/leer-todas', () => {
  test('marca todas las notificaciones como leídas', async () => {
    // Generar algunas notificaciones
    await crearYCambiarEstado('verificado');
    await crearYCambiarEstado('rechazado', 'Motivo de prueba');

    const res = await request(app)
      .patch(`${BASE_NOTIF}/leer-todas`)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    expect(res.status).toBe(200);

    // Verificar que todas están leídas
    const listRes = await request(app)
      .get(BASE_NOTIF)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    const noLeidas = listRes.body.notificaciones.filter((n) => !n.leida);
    expect(noLeidas.length).toBe(0);
  });

  test('falla sin autenticación → 401', async () => {
    const res = await request(app).patch(`${BASE_NOTIF}/leer-todas`);
    expect(res.status).toBe(401);
  });
});
