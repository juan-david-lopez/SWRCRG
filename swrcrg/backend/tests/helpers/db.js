'use strict';

const { sequelize, Rol, EstadoReporte, CategoriaReporte, Usuario, CodigoVerificacion } = require('../../src/models');
const bcrypt = require('bcryptjs');

/** Limpia datos de prueba (dominio @test.com) */
const cleanTestData = async () => {
  await CodigoVerificacion.destroy({ where: {}, truncate: true, cascade: true }).catch(() => {});
  // Buscar usuarios de prueba y destruirlos (Sequelize maneja CASCADE en BD)
  const testUsers = await Usuario.findAll({
    where: sequelize.literal("correo LIKE '%@test.com'"),
  });
  // Destruir uno por uno para respetar las FK constraints (CASCADE en BD)
  for (const u of testUsers) {
    await sequelize.query(`DELETE FROM reportes WHERE usuario_id = '${u.id}'`).catch(() => {});
    await sequelize.query(`DELETE FROM notificaciones WHERE usuario_id = '${u.id}'`).catch(() => {});
    await u.destroy().catch(() => {});
  }
};

/** Obtiene el ID del rol ciudadano */
const getRolCiudadano = async () => {
  const rol = await Rol.findOne({ where: { nombre: 'ciudadano' } });
  if (!rol) throw new Error('Rol ciudadano no encontrado. Ejecuta los seeders primero.');
  return rol.id;
};

/** Obtiene el ID del rol administrador */
const getRolAdmin = async () => {
  const rol = await Rol.findOne({ where: { nombre: 'administrador' } });
  if (!rol) throw new Error('Rol administrador no encontrado. Ejecuta los seeders primero.');
  return rol.id;
};

/** Crea un usuario ciudadano de prueba y devuelve el objeto */
const crearUsuarioCiudadano = async (overrides = {}) => {
  const rol_id = await getRolCiudadano();
  const hash   = await bcrypt.hash('Test123', 10);
  return Usuario.create({
    nombre:   'Test',
    apellido: 'Ciudadano',
    correo:   'ciudadano@test.com',
    contrasena: hash,
    rol_id,
    activo: true,
    onboarding_completado: true,
    ...overrides,
  });
};

/** Crea un usuario administrador de prueba y devuelve el objeto */
const crearUsuarioAdmin = async (overrides = {}) => {
  const rol_id = await getRolAdmin();
  const hash   = await bcrypt.hash('Admin123', 10);
  return Usuario.create({
    nombre:   'Test',
    apellido: 'Admin',
    correo:   'testadmin@test.com',
    contrasena: hash,
    rol_id,
    activo: true,
    onboarding_completado: true,
    ...overrides,
  });
};

/** Obtiene el ID de la primera categoría disponible */
const getCategoria = async () => {
  const cat = await CategoriaReporte.findOne();
  if (!cat) throw new Error('No hay categorías. Ejecuta los seeders primero.');
  return cat.id;
};

/** Obtiene el ID del estado pendiente */
const getEstadoPendiente = async () => {
  const estado = await EstadoReporte.findOne({ where: { nombre: 'pendiente' } });
  if (!estado) throw new Error('Estado pendiente no encontrado. Ejecuta los seeders primero.');
  return estado.id;
};

/** Crea un código de verificación válido para un correo */
const crearCodigoVerificacion = async (correo, codigo = '123456') => {
  return CodigoVerificacion.create({
    correo:    correo.toLowerCase(),
    codigo,
    expira_en: new Date(Date.now() + 10 * 60 * 1000),
    usado:     false,
  });
};

const closeDb = async () => {
  await sequelize.close();
};

module.exports = {
  cleanTestData,
  getRolCiudadano,
  getRolAdmin,
  crearUsuarioCiudadano,
  crearUsuarioAdmin,
  getCategoria,
  getEstadoPendiente,
  crearCodigoVerificacion,
  closeDb,
};
