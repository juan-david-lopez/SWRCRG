'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('roles', [
      { id: uuidv4(), nombre: 'ciudadano',     descripcion: 'Usuario estándar',                    fecha_creacion: now, fecha_actualizacion: now },
      { id: uuidv4(), nombre: 'administrador', descripcion: 'Administrador con acceso total',       fecha_creacion: now, fecha_actualizacion: now },
    ], { ignoreDuplicates: true });

    await queryInterface.bulkInsert('estados_reporte', [
      { id: uuidv4(), nombre: 'pendiente',   descripcion: 'Reporte recibido, pendiente de revisión', fecha_creacion: now, fecha_actualizacion: now },
      { id: uuidv4(), nombre: 'verificado',  descripcion: 'Reporte verificado y aceptado',           fecha_creacion: now, fecha_actualizacion: now },
      { id: uuidv4(), nombre: 'rechazado',   descripcion: 'Reporte rechazado con motivo',            fecha_creacion: now, fecha_actualizacion: now },
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

    // ── Usuario administrador por defecto ──────────────────────────────────────
    const [[rolAdmin]] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE nombre = 'administrador' LIMIT 1`
    );

    if (rolAdmin) {
      const hash = await bcrypt.hash('Admin123', 10);
      await queryInterface.bulkInsert('usuarios', [{
        id:                    uuidv4(),
        nombre:                'Admin',
        apellido:              'SWRCRG',
        correo:                'admin@swrcrg.com',
        contrasena:            hash,
        rol_id:                rolAdmin.id,
        activo:                true,
        onboarding_completado: true,
        fecha_creacion:        now,
        fecha_actualizacion:   now,
      }], { ignoreDuplicates: true });
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('usuarios', { correo: 'admin@swrcrg.com' }, {});
    await queryInterface.bulkDelete('categorias_reporte', null, {});
    await queryInterface.bulkDelete('estados_reporte', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  },
};
