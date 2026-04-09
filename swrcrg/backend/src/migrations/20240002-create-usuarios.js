'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id:                  { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      nombre:              { type: Sequelize.STRING(100), allowNull: false },
      apellido:            { type: Sequelize.STRING(100), allowNull: false },
      correo:              { type: Sequelize.STRING(150), allowNull: false, unique: true },
      contrasena:          { type: Sequelize.STRING(255), allowNull: false },
      telefono:            { type: Sequelize.STRING(20) },
      rol_id:              { type: Sequelize.UUID, allowNull: false, references: { model: 'roles', key: 'id' }, onDelete: 'RESTRICT' },
      activo:              { type: Sequelize.BOOLEAN, defaultValue: true },
      fecha_creacion:      { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      fecha_actualizacion: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('usuarios');
  },
};
