'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('historial_estados_reporte', {
      id:          { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      reporte_id:  { type: Sequelize.UUID, allowNull: false, references: { model: 'reportes', key: 'id' }, onDelete: 'CASCADE' },
      estado_id:   { type: Sequelize.UUID, allowNull: false, references: { model: 'estados_reporte', key: 'id' } },
      usuario_id:  { type: Sequelize.UUID, allowNull: false, references: { model: 'usuarios', key: 'id' } },
      observacion: { type: Sequelize.TEXT },
      fecha_cambio: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('historial_estados_reporte');
  },
};
