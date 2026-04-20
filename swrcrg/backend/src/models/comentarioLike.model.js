'use strict';

module.exports = (sequelize, DataTypes) => {
  const ComentarioLike = sequelize.define('ComentarioLike', {
    id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    comentario_id: { type: DataTypes.UUID, allowNull: false },
    usuario_id:    { type: DataTypes.UUID, allowNull: false },
  }, {
    tableName:  'comentario_likes',
    timestamps: true,
    updatedAt:  false,
  });

  return ComentarioLike;
};
