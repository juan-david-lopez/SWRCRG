'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('roles', [
      { id: uuidv4(), nombre: 'ciudadano',     descripcion: 'Usuario estándar',                    fecha_creacion: now, fecha_actualizacion: now },
      { id: uuidv4(), nombre: 'administrador', descripcion: 'Administrador con acceso total',       fecha_creacion: now, fecha_actualizacion: now },
    ], { ignoreDuplicates: true });

    await queryInterface.bulkInsert('estados_reporte', [
      { id: uuidv4(), nombre: 'pendiente',   descripcion: 'Reporte recibido, pendiente de revisión', fecha_creacion: now, fecha_actualizacion: now },
      { id: uuidv4(), nombre: 'en_proceso',  descripcion: 'Reporte en proceso de atención',          fecha_creacion: now, fecha_actualizacion: now },
      { id: uuidv4(), nombre: 'resuelto',    descripcion: 'Reporte atendido y resuelto',             fecha_creacion: now, fecha_actualizacion: now },
    ], { ignoreDuplicates: true });

    await queryInterface.bulkInsert('categorias_reporte', [
      { id: uuidv4(), nombre: 'basura_domestica',   descripcion: 'Residuos domésticos',          fecha_creacion: now, fecha_actualizacion: now },
      { id: uuidv4(), nombre: 'escombros',          descripcion: 'Escombros y materiales',       fecha_creacion: now, fecha_actualizacion: now },
      { id: uuidv4(), nombre: 'reciclaje',          descripcion: 'Materiales reciclables',       fecha_creacion: now, fecha_actualizacion: now },
      { id: uuidv4(), nombre: 'poda',               descripcion: 'Residuos de poda',             fecha_creacion: now, fecha_actualizacion: now },
      { id: uuidv4(), nombre: 'residuos_peligrosos',descripcion: 'Residuos peligrosos',          fecha_creacion: now, fecha_actualizacion: now },
      { id: uuidv4(), nombre: 'animales_muertos',   descripcion: 'Animales muertos en vía pública', fecha_creacion: now, fecha_actualizacion: now },
      { id: uuidv4(), nombre: 'otro',               descripcion: 'Otra categoría',               fecha_creacion: now, fecha_actualizacion: now },
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categorias_reporte', null, {});
    await queryInterface.bulkDelete('estados_reporte', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  },
};
