'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Columna parent_id para respuestas anidadas
    await queryInterface.addColumn('comentarios_reporte', 'parent_id', {
      type:       Sequelize.UUID,
      allowNull:  true,
      defaultValue: null,
      references: { model: 'comentarios_reporte', key: 'id' },
      onDelete:   'CASCADE',
    });

    // Tabla de likes de comentarios
    await queryInterface.createTable('comentario_likes', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey:   true,
      },
      comentario_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'comentarios_reporte', key: 'id' },
        onDelete:   'CASCADE',
      },
      usuario_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'usuarios', key: 'id' },
        onDelete:   'CASCADE',
      },
      createdAt: {
        type:         Sequelize.DATE,
        allowNull:    false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addConstraint('comentario_likes', {
      fields:  ['comentario_id', 'usuario_id'],
      type:    'unique',
      name:    'unique_comentario_like',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('comentario_likes');
    await queryInterface.removeColumn('comentarios_reporte', 'parent_id');
  },
};
