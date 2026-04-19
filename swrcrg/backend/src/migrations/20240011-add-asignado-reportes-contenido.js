'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('reportes', 'asignado_a', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await queryInterface.addColumn('reportes', 'reportes_contenido', {
      type: Sequelize.JSONB,
      defaultValue: [],
      allowNull: false,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('reportes', 'asignado_a');
    await queryInterface.removeColumn('reportes', 'reportes_contenido');
  },
};
