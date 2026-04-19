'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios', 'avatar_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('usuarios', 'onboarding_completado', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('usuarios', 'avatar_url');
    await queryInterface.removeColumn('usuarios', 'onboarding_completado');
  },
};
