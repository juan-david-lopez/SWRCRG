'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar motivo_rechazo al modelo de reportes
    await queryInterface.addColumn('reportes', 'motivo_rechazo', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Agregar estado_bloqueado: true cuando el admin ya hizo su cambio definitivo
    await queryInterface.addColumn('reportes', 'estado_bloqueado', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    // Insertar nuevos estados (ignorar si ya existen)
    const now = new Date();
    const { v4: uuidv4 } = require('uuid');
    await queryInterface.bulkInsert('estados_reporte', [
      { id: uuidv4(), nombre: 'verificado', descripcion: 'Reporte verificado y aceptado', fecha_creacion: now, fecha_actualizacion: now },
      { id: uuidv4(), nombre: 'rechazado',  descripcion: 'Reporte rechazado con motivo',  fecha_creacion: now, fecha_actualizacion: now },
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('reportes', 'motivo_rechazo');
    await queryInterface.removeColumn('reportes', 'estado_bloqueado');
    await queryInterface.bulkDelete('estados_reporte', {
      nombre: ['verificado', 'rechazado'],
    }, {});
  },
};
