'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('reportes', 'votos', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
    await queryInterface.addColumn('reportes', 'votantes', {
      type: Sequelize.JSONB,
      defaultValue: [],
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('reportes', 'votos');
    await queryInterface.removeColumn('reportes', 'votantes');
  },
};
