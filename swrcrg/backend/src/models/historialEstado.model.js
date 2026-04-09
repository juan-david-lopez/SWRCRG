'use strict';

module.exports = (sequelize, DataTypes) => {
  const HistorialEstado = sequelize.define('HistorialEstado', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    reporte_id:  { type: DataTypes.UUID, allowNull: false },
    estado_id:   { type: DataTypes.UUID, allowNull: false },
    usuario_id:  { type: DataTypes.UUID, allowNull: false },
    observacion: { type: DataTypes.TEXT },
  }, {
    tableName:  'historial_estados_reporte',
    timestamps: true,
    createdAt:  'fecha_cambio',
    updatedAt:  false,
  });

  return HistorialEstado;
};
