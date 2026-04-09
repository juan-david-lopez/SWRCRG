'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('imagenes_reporte', {
      id:             { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      reporte_id:     { type: Sequelize.UUID, allowNull: false, references: { model: 'reportes', key: 'id' }, onDelete: 'CASCADE' },
      url_imagen:     { type: Sequelize.STRING(500), allowNull: false },
      nombre_archivo: { type: Sequelize.STRING(255), allowNull: false },
      tipo_archivo:   { type: Sequelize.STRING(100) },
      tamano_archivo: { type: Sequelize.INTEGER },
      fecha_subida:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('imagenes_reporte');
  },
};
