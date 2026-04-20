'use strict';

/**
 * Suite: Comentarios en reportes
 * Cubre: GET  /api/reportes/:id/comentarios
 *        POST /api/reportes/:id/comentarios
 *        DELETE /api/reportes/:id/comentarios/:comentarioId
 *        POST /api/reportes/:id/comentarios/:comentarioId/like
 *        GET  /api/reportes/:id/historial
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

const BASE = '/api/reportes';

const loginAs = async (correo, contrasena) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ correo, contrasena });
  return res.body.token;
};

let tokenCiudadano;
let tokenAdmin;
let ciudadanoId;
let reporteId;
let categoriaId;

beforeAll(async () => {
  await cleanTestData();

  const ciudadano = await crearUsuarioCiudadano({ correo: 'ciudadano@test.com' });
  await crearUsuarioAdmin({ correo: 'testadmin@test.com' });
  ciudadanoId = ciudadano.id;
  categoriaId = await getCategoria();

  tokenCiudadano = await loginAs('ciudadano@test.com', 'Test123');
  tokenAdmin     = await loginAs('testadmin@test.com', 'Admin123');

  // Crear un reporte base para los tests
  const res = await request(app)
    .post(BASE)
    .set('Authorization', `Bearer ${tokenCiudadano}`)
    .field('titulo',       'Reporte para comentarios')
    .field('descripcion',  'Descripción del reporte')
    .field('latitud',      '4.7110')
    .field('longitud',     '-74.0721')
    .field('categoria_id', categoriaId);

  reporteId = res.body.reporte.id;
});

afterAll(async () => {
  await cleanTestData();
  await closeDb();
});

// ─── Listar comentarios ───────────────────────────────────────────────────────

describe('GET /api/reportes/:id/comentarios', () => {
  test('devuelve lista de comentarios sin autenticación', async () => {
    const res = await request(app).get(`${BASE}/${reporteId}/comentarios`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.comentarios)).toBe(true);
  });
});

// ─── Agregar comentario ───────────────────────────────────────────────────────

describe('POST /api/reportes/:id/comentarios', () => {
  test('ciudadano agrega comentario → 201', async () => {
    const res = await request(app)
      .post(`${BASE}/${reporteId}/comentarios`)
      .set('Authorization', `Bearer ${tokenCiudadano}`)
      .send({ comentario: 'Este es un comentario de prueba' });

    expect(res.status).toBe(201);
    expect(res.body.comentario).toMatchObject({
      comentario: 'Este es un comentario de prueba',
      usuario_id: ciudadanoId,
      reporte_id: reporteId,
    });
  });

  test('admin agrega comentario → 201', async () => {
    const res = await request(app)
      .post(`${BASE}/${reporteId}/comentarios`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ comentario: 'Comentario del administrador' });

    expect(res.status).toBe(201);
    expect(res.body.comentario.comentario).toBe('Comentario del administrador');
  });

  test('falla sin autenticación → 401', async () => {
    const res = await request(app)
      .post(`${BASE}/${reporteId}/comentarios`)
      .send({ comentario: 'Sin auth' });

    expect(res.status).toBe(401);
  });

  test('falla con comentario vacío → 400', async () => {
    const res = await request(app)
      .post(`${BASE}/${reporteId}/comentarios`)
      .set('Authorization', `Bearer ${tokenCiudadano}`)
      .send({ comentario: '' });

    expect(res.status).toBe(400);
  });

  test('ciudadano agrega respuesta (reply) a un comentario', async () => {
    // Crear comentario padre
    const parentRes = await request(app)
      .post(`${BASE}/${reporteId}/comentarios`)
      .set('Authorization', `Bearer ${tokenCiudadano}`)
      .send({ comentario: 'Comentario padre' });

    const parentId = parentRes.body.comentario.id;

    // Responder al comentario padre
    const res = await request(app)
      .post(`${BASE}/${reporteId}/comentarios`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ comentario: 'Respuesta al comentario', parent_id: parentId });

    expect(res.status).toBe(201);
    expect(res.body.comentario.parent_id).toBe(parentId);
  });
});

// ─── Like en comentario ───────────────────────────────────────────────────────

describe('POST /api/reportes/:id/comentarios/:comentarioId/like', () => {
  let comentarioId;

  beforeEach(async () => {
    // Comentario fresco por test para evitar estado compartido de likes
    const res = await request(app)
      .post(`${BASE}/${reporteId}/comentarios`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ comentario: 'Comentario para likear' });

    comentarioId = res.body.comentario.id;
  });

  test('ciudadano da like a un comentario', async () => {
    const res = await request(app)
      .post(`${BASE}/${reporteId}/comentarios/${comentarioId}/like`)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(true);
    expect(res.body.total_likes).toBe(1);
  });

  test('dar like dos veces quita el like (toggle)', async () => {
    // Primer like
    await request(app)
      .post(`${BASE}/${reporteId}/comentarios/${comentarioId}/like`)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    // Segundo like — quita
    const res = await request(app)
      .post(`${BASE}/${reporteId}/comentarios/${comentarioId}/like`)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(false);
    expect(res.body.total_likes).toBe(0);
  });

  test('falla sin autenticación → 401', async () => {
    const res = await request(app)
      .post(`${BASE}/${reporteId}/comentarios/${comentarioId}/like`);

    expect(res.status).toBe(401);
  });
});

// ─── Eliminar comentario ──────────────────────────────────────────────────────

describe('DELETE /api/reportes/:id/comentarios/:comentarioId', () => {
  test('ciudadano elimina su propio comentario → 200', async () => {
    const createRes = await request(app)
      .post(`${BASE}/${reporteId}/comentarios`)
      .set('Authorization', `Bearer ${tokenCiudadano}`)
      .send({ comentario: 'Comentario a eliminar' });

    const comentarioId = createRes.body.comentario.id;

    const res = await request(app)
      .delete(`${BASE}/${reporteId}/comentarios/${comentarioId}`)
      .set('Authorization', `Bearer ${tokenCiudadano}`);

    expect(res.status).toBe(200);
  });

  test('admin elimina cualquier comentario → 200', async () => {
    const createRes = await request(app)
      .post(`${BASE}/${reporteId}/comentarios`)
      .set('Authorization', `Bearer ${tokenCiudadano}`)
      .send({ comentario: 'Comentario que borra el admin' });

    const comentarioId = createRes.body.comentario.id;

    const res = await request(app)
      .delete(`${BASE}/${reporteId}/comentarios/${comentarioId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
  });

  test('falla sin autenticación → 401', async () => {
    const createRes = await request(app)
      .post(`${BASE}/${reporteId}/comentarios`)
      .set('Authorization', `Bearer ${tokenCiudadano}`)
      .send({ comentario: 'Comentario sin auth' });

    const comentarioId = createRes.body.comentario.id;

    const res = await request(app)
      .delete(`${BASE}/${reporteId}/comentarios/${comentarioId}`);

    expect(res.status).toBe(401);
  });
});

// ─── Historial de estados ─────────────────────────────────────────────────────

describe('GET /api/reportes/:id/historial', () => {
  test('devuelve historial vacío para reporte nuevo', async () => {
    const res = await request(app).get(`${BASE}/${reporteId}/historial`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.historial)).toBe(true);
  });

  test('historial registra cambio de estado', async () => {
    // Crear reporte y cambiar estado
    const createRes = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${tokenCiudadano}`)
      .field('titulo',       'Reporte con historial')
      .field('descripcion',  'Para probar historial')
      .field('latitud',      '4.7110')
      .field('longitud',     '-74.0721')
      .field('categoria_id', categoriaId);

    const id = createRes.body.reporte.id;

    await request(app)
      .put(`${BASE}/${id}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ estado: 'verificado' });

    const res = await request(app).get(`${BASE}/${id}/historial`);

    expect(res.status).toBe(200);
    expect(res.body.historial.length).toBeGreaterThan(0);
    expect(res.body.historial[0].estado.nombre).toBe('verificado');
  });
});
