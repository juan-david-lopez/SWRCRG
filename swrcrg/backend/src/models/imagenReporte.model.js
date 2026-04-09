'use strict';

module.exports = (sequelize, DataTypes) => {
  const ImagenReporte = sequelize.define('ImagenReporte', {
    id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    reporte_id:      { type: DataTypes.UUID, allowNull: false },
    url_imagen:      { type: DataTypes.STRING(500), allowNull: false },
    nombre_archivo:  { type: DataTypes.STRING(255), allowNull: false },
    tipo_archivo:    { type: DataTypes.STRING(100) },
    tamano_archivo:  { type: DataTypes.INTEGER },
  }, {
    tableName:  'imagenes_reporte',
    timestamps: true,
    createdAt:  'fecha_subida',
    updatedAt:  false,
  });

  return ImagenReporte;
};
