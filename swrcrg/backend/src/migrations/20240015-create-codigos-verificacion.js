'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('codigos_verificacion', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
      },
      correo: {
        type:      Sequelize.STRING(150),
        allowNull: false,
      },
      codigo: {
        type:      Sequelize.STRING(6),
        allowNull: false,
      },
      expira_en: {
        type:      Sequelize.DATE,
        allowNull: false,
      },
      usado: {
        type:         Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type:         Sequelize.DATE,
        allowNull:    false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('codigos_verificacion', ['correo']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('codigos_verificacion');
  },
};
