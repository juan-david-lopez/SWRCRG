'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comentarios_reporte', {
      id:             { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      reporte_id:     { type: Sequelize.UUID, allowNull: false, references: { model: 'reportes', key: 'id' }, onDelete: 'CASCADE' },
      usuario_id:     { type: Sequelize.UUID, allowNull: false, references: { model: 'usuarios', key: 'id' } },
      comentario:     { type: Sequelize.TEXT, allowNull: false },
      fecha_creacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('comentarios_reporte');
  },
};
