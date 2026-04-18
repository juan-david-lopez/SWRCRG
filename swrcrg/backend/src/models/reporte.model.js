'use strict';

module.exports = (sequelize, DataTypes) => {
  const Reporte = sequelize.define('Reporte', {
    id:                   { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    titulo:               { type: DataTypes.STRING(150), allowNull: false },
    descripcion:          { type: DataTypes.TEXT, allowNull: false },
    direccion_referencia: { type: DataTypes.STRING(255) },
    latitud:              { type: DataTypes.DECIMAL(9, 6), allowNull: false },
    longitud:             { type: DataTypes.DECIMAL(9, 6), allowNull: false },
    usuario_id:           { type: DataTypes.UUID, allowNull: false },
    estado_id:            { type: DataTypes.UUID, allowNull: false },
    categoria_id:         { type: DataTypes.UUID, allowNull: false },
    votos:                { type: DataTypes.INTEGER, defaultValue: 0 },
    votantes:             { type: DataTypes.JSONB, defaultValue: [] },
  }, {
    tableName:  'reportes',
    timestamps: true,
    createdAt:  'fecha_reporte',
    updatedAt:  'fecha_actualizacion',
  });

  return Reporte;
};
