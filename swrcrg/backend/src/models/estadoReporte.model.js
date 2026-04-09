'use strict';

module.exports = (sequelize, DataTypes) => {
  const EstadoReporte = sequelize.define('EstadoReporte', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre:      { type: DataTypes.STRING(50), allowNull: false, unique: true },
    descripcion: { type: DataTypes.TEXT },
  }, {
    tableName:  'estados_reporte',
    timestamps: true,
    createdAt:  'fecha_creacion',
    updatedAt:  'fecha_actualizacion',
  });

  return EstadoReporte;
};
