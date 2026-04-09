'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notificaciones', {
      id:          { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      usuario_id:  { type: Sequelize.UUID, allowNull: false, references: { model: 'usuarios', key: 'id' }, onDelete: 'CASCADE' },
      titulo:      { type: Sequelize.STRING(150), allowNull: false },
      mensaje:     { type: Sequelize.TEXT, allowNull: false },
      leida:       { type: Sequelize.BOOLEAN, defaultValue: false },
      tipo:        { type: Sequelize.STRING(50), allowNull: false },
      fecha_envio: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('notificaciones');
  },
};
