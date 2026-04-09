'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id:                  { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      nombre:              { type: Sequelize.STRING(50), allowNull: false, unique: true },
      descripcion:         { type: Sequelize.TEXT },
      fecha_creacion:      { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      fecha_actualizacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('roles');
  },
};
