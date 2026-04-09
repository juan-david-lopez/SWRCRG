'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reportes', {
      id:                   { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      titulo:               { type: Sequelize.STRING(150), allowNull: false },
      descripcion:          { type: Sequelize.TEXT, allowNull: false },
      direccion_referencia: { type: Sequelize.STRING(255) },
      latitud:              { type: Sequelize.DECIMAL(9, 6), allowNull: false },
      longitud:             { type: Sequelize.DECIMAL(9, 6), allowNull: false },
      usuario_id:           { type: Sequelize.UUID, allowNull: false, references: { model: 'usuarios', key: 'id' }, onDelete: 'CASCADE' },
      estado_id:            { type: Sequelize.UUID, allowNull: false, references: { model: 'estados_reporte', key: 'id' } },
      categoria_id:         { type: Sequelize.UUID, allowNull: false, references: { model: 'categorias_reporte', key: 'id' } },
      fecha_reporte:        { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      fecha_actualizacion:  { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('reportes');
  },
};
