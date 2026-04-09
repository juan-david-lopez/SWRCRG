'use strict';

module.exports = (sequelize, DataTypes) => {
  const ComentarioReporte = sequelize.define('ComentarioReporte', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    reporte_id:  { type: DataTypes.UUID, allowNull: false },
    usuario_id:  { type: DataTypes.UUID, allowNull: false },
    comentario:  { type: DataTypes.TEXT, allowNull: false },
  }, {
    tableName:  'comentarios_reporte',
    timestamps: true,
    createdAt:  'fecha_creacion',
    updatedAt:  false,
  });

  return ComentarioReporte;
};
