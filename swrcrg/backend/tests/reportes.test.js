'use strict';

/**
 * Suite: Reportes ciudadanos
 * Cubre: GET  /api/reportes
 *        POST /api/reportes
 *        GET  /api/reportes/:id
 *        PUT  /api/reportes/:id
 *        DELETE /api/reportes/:id
 *        POST /api/reportes/:id/votar
 *        PUT  /api/reportes/:id/estado  (admin)
 *        POST /api/reportes/:id/reenviar
 */

const request = require('supertest');
const app     = require('../src/app');
const path    = require('path');
const {
  cleanTestData,
  crearUsuarioCiudadano,
  crearUsuarioAdmin,
  getCategoria,
  getEstadoPendiente,
  closeDb,
} = require('./helpers/db');
const { Reporte, EstadoReporte } = require('../src/models');

const BASE = '/api/reportes';

// ── Helpers ──────────────────────────────────────────────────────────────────

const loginAs = async (correo, contrasena) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ correo, contrasena });
  return res.body.token;
};

let tokenCiudadano;
let tokenAdmin;
let ciudadanoId;
let adminId;
let categoriaId;

beforeAll(async () => {
  await cleanTestData();

  const ciudadano = await crearUsuarioCiudadano({ correo: 'ciudadano@test.com' });
  const admin     = await crearUsuarioAdmin({ correo: 'testadmin@test.com' });
  ciudadanoId = ciudadano.id;
  adminId     = admin.id;
  categoriaId = await getCategoria();

  tokenCiudadano = await loginAs('ciudadano@test.com', 'Test123');
  tokenAdmin     = await loginAs('testadmin@test.com', 'Admin123');
});

afterAll(async () => {
  await cleanTestData();
  await closeDb();
});

// ── Helpers para crear reporte ────────────────────────────────────────────────

const crearReporte = async (token, overrides = {}) => {
  return request(app)
    .post(BASE)
    .set('Authorization', `Bearer ${token}`)
    .field('titulo',      overrides.titulo      ?? 'Basura en la calle')
    .field('descripcion', overrides.descripcion ?? 'Hay basura acumulada')
    .field('latitud',     overrides.latitud      ?? '4.7110')
    .field('longitud',    overrides.longitud     ?? '-74.0721')
    .field('categoria_id', overrides.categoria_id ?? categoriaId);
};

// ─── Listar reportes ──────────────────────────────────────────────────────────

describe('GET /api/reportes', () => {
  test('devuelve lista de reportes sin autenticación', async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.reportes)).toBe(true);
  });

  test('devuelve lista de reportes con autenticación', async () => {
    const res = await request(app)
      .get(BASE)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.reportes)).toBe(true);
  });
});

// ─── Crear reporte ────────────────────────────────────────────────────────────

describe('POST /api/reportes', () => {
  test('ciudadano crea reporte exitosamente → 201', async () => {
    const res = await crearReporte(tokenCiudadano);

    expect(res.status).toBe(201);
    expect(res.body.reporte).toMatchObject({
      titulo:      'Basura en la calle',
      descripcion: 'Hay basura acumulada',
      usuario_id:  ciudadanoId,
    });
  });

  test('el reporte se crea con estado pendiente', async () => {
    const res = await crearReporte(tokenCiudadano, { titulo: 'Reporte pendiente' });

    expect(res.status).toBe(201);
    // Verificar en BD que el estado es pendiente
    const reporte = await Reporte.findByPk(res.body.reporte.id, {
      include: [{ model: EstadoReporte, as: 'estado' }],
    });
    expect(reporte.estado.nombre).toBe('pendiente');
  });

  test('falla sin autenticación → 401', async () => {
    const res = await request(app)
      .post(BASE)
      .field('titulo', 'Sin auth')
      .field('descripcion', 'test')
      .field('latitud', '4.7110')
      .field('longitud', '-74.0721')
      .field('categoria_id', categoriaId);

    expect(res.status).toBe(401);
  });

  test('falla sin título → 400', async () => {
    const res = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${tokenCiudadano}`)
      .field('descripcion', 'Sin título')
      .field('latitud', '4.7110')
      .field('longitud', '-74.0721')
      .field('categoria_id', categoriaId);

    expect(res.status).toBe(400);
  });

  test('falla con latitud inválida → 400', async () => {
    const res = await crearReporte(tokenCiudadano, { latitud: '999' });
    expect(res.status).toBe(400);
  });

  test('falla con categoria_id inválido → 400', async () => {
    const res = await crearReporte(tokenCiudadano, { categoria_id: 'no-es-uuid' });
    expect(res.status).toBe(400);
  });
});

// ─── Obtener reporte por ID ───────────────────────────────────────────────────

describe('GET /api/reportes/:id', () => {
  let reporteId;

  beforeAll(async () => {
    const res = await crearReporte(tokenCiudadano, { titulo: 'Reporte para obtener' });
    reporteId = res.body.reporte.id;
  });

  test('devuelve el reporte por ID', async () => {
    const res = await request(app).get(`${BASE}/${reporteId}`);

    expect(res.status).toBe(200);
    expect(res.body.reporte.id).toBe(reporteId);
    expect(res.body.reporte.titulo).toBe('Reporte para obtener');
  });

  test('devuelve 404 con ID inexistente', async () => {
    const res = await request(app).get(`${BASE}/00000000-0000-0000-0000-000000000000`);
    expect(res.status).toBe(404);
  });
});

// ─── Editar reporte ───────────────────────────────────────────────────────────

describe('PUT /api/reportes/:id', () => {
  let reporteId;

  beforeAll(async () => {
    const res = await crearReporte(tokenCiudadano, { titulo: 'Reporte a editar' });
    reporteId = res.body.reporte.id;
  });

  test('ciudadano edita su propio reporte', async () => {
    const res = await request(app)
      .put(`${BASE}/${reporteId}`)
      .set('Authorization', `Bearer ${tokenCiudadano}`)
      .send({ titulo: 'Título editado', descripcion: 'Descripción editada' });

    expect(res.status).toBe(200);
    expect(res.body.reporte.titulo).toBe('Título editado');
  });

  test('falla si otro ciudadano intenta editar → 403', async () => {
    const otro = await crearUsuarioCiudadano({ correo: 'otro@test.com' });
    const tokenOtro = await loginAs('otro@test.com', 'Test123');

    const res = await request(app)
      .put(`${BASE}/${reporteId}`)
      .set('Authorization', `Bearer ${tokenOtro}`)
      .send({ titulo: 'Intento de edición' });

    expect(res.status).toBe(403);
    await otro.destroy();
  });
});

// ─── Eliminar reporte ─────────────────────────────────────────────────────────

describe('DELETE /api/reportes/:id', () => {
  test('ciudadano elimina su propio reporte → 200', async () => {
    const createRes = await crearReporte(tokenCiudadano, { titulo: 'Reporte a eliminar' });
    const id = createRes.body.reporte.id;

    const res = await request(app)
      .delete(`${BASE}/${id}`)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminado/i);
  });

  test('falla sin autenticación → 401', async () => {
    const createRes = await crearReporte(tokenCiudadano, { titulo: 'No eliminar sin auth' });
    const id = createRes.body.reporte.id;

    const res = await request(app).delete(`${BASE}/${id}`);
    expect(res.status).toBe(401);
  });
});

// ─── Votar reporte ────────────────────────────────────────────────────────────

describe('POST /api/reportes/:id/votar', () => {
  let reporteIdVotar;

  beforeEach(async () => {
    // Reporte fresco por test para evitar estado compartido de votos
    const res = await crearReporte(tokenAdmin, { titulo: 'Reporte para votar' });
    reporteIdVotar = res.body.reporte.id;
  });

  test('ciudadano vota un reporte → votos incrementa', async () => {
    const res = await request(app)
      .post(`${BASE}/${reporteIdVotar}/votar`)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    expect(res.status).toBe(200);
    expect(res.body.votos).toBe(1);
    expect(res.body.voted).toBe(true);
  });

  test('votar dos veces quita el voto (toggle)', async () => {
    // Primer voto
    await request(app)
      .post(`${BASE}/${reporteIdVotar}/votar`)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    // Segundo voto — quita el voto
    const res = await request(app)
      .post(`${BASE}/${reporteIdVotar}/votar`)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    expect(res.status).toBe(200);
    expect(res.body.voted).toBe(false);
    expect(res.body.votos).toBe(0);
  });

  test('falla sin autenticación → 401', async () => {
    const res = await request(app).post(`${BASE}/${reporteIdVotar}/votar`);
    expect(res.status).toBe(401);
  });
});

// ─── Cambiar estado (admin) ───────────────────────────────────────────────────

describe('PUT /api/reportes/:id/estado', () => {
  let reporteId;

  beforeEach(async () => {
    const res = await crearReporte(tokenCiudadano, { titulo: 'Reporte para estado' });
    reporteId = res.body.reporte.id;
  });

  test('admin verifica un reporte pendiente → estado verificado', async () => {
    const res = await request(app)
      .put(`${BASE}/${reporteId}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ estado: 'verificado' });

    expect(res.status).toBe(200);
    expect(res.body.reporte.estado.nombre).toBe('verificado');
  });

  test('admin rechaza un reporte con motivo', async () => {
    const res = await request(app)
      .put(`${BASE}/${reporteId}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ estado: 'rechazado', motivo_rechazo: 'Imagen no corresponde al lugar' });

    expect(res.status).toBe(200);
    expect(res.body.reporte.estado.nombre).toBe('rechazado');
  });

  test('falla al rechazar sin motivo → 400', async () => {
    const res = await request(app)
      .put(`${BASE}/${reporteId}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ estado: 'rechazado' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/motivo/i);
  });

  test('ciudadano no puede cambiar estado → 403', async () => {
    const res = await request(app)
      .put(`${BASE}/${reporteId}/estado`)
      .set('Authorization', `Bearer ${tokenCiudadano}`)
      .send({ estado: 'verificado' });

    expect(res.status).toBe(403);
  });

  test('falla sin autenticación → 401', async () => {
    const res = await request(app)
      .put(`${BASE}/${reporteId}/estado`)
      .send({ estado: 'verificado' });

    expect(res.status).toBe(401);
  });
});

// ─── Reenviar para revisión ───────────────────────────────────────────────────

describe('POST /api/reportes/:id/reenviar', () => {
  test('ciudadano reenvía un reporte rechazado → estado pendiente', async () => {
    // Crear y rechazar
    const createRes = await crearReporte(tokenCiudadano, { titulo: 'Reporte a reenviar' });
    const id = createRes.body.reporte.id;

    await request(app)
      .put(`${BASE}/${id}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ estado: 'rechazado', motivo_rechazo: 'Falta información' });

    // Reenviar
    const res = await request(app)
      .post(`${BASE}/${id}/reenviar`)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    expect(res.status).toBe(200);
    expect(res.body.reporte.estado.nombre).toBe('pendiente');
  });

  test('falla si el reporte no está rechazado → 400', async () => {
    const createRes = await crearReporte(tokenCiudadano, { titulo: 'Reporte pendiente' });
    const id = createRes.body.reporte.id;

    const res = await request(app)
      .post(`${BASE}/${id}/reenviar`)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/rechazado/i);
  });
});

// ─── Mis reportes ─────────────────────────────────────────────────────────────

describe('GET /api/reportes/me/reportes', () => {
  test('ciudadano obtiene solo sus reportes', async () => {
    await crearReporte(tokenCiudadano, { titulo: 'Mi reporte 1' });
    await crearReporte(tokenCiudadano, { titulo: 'Mi reporte 2' });

    const res = await request(app)
      .get(`${BASE}/me/reportes`)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.reportes)).toBe(true);
    res.body.reportes.forEach((r) => {
      expect(r.usuario_id).toBe(ciudadanoId);
    });
  });

  test('falla sin autenticación → 401', async () => {
    const res = await request(app).get(`${BASE}/me/reportes`);
    expect(res.status).toBe(401);
  });
});
