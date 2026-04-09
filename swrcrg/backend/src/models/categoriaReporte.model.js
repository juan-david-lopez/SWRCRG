'use strict';

const CATEGORIAS_VALIDAS = [
  'basura_domestica', 'escombros', 'reciclaje', 'poda',
  'residuos_peligrosos', 'animales_muertos', 'otro',
];

module.exports = (sequelize, DataTypes) => {
  const CategoriaReporte = sequelize.define('CategoriaReporte', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre:      {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: { isIn: [CATEGORIAS_VALIDAS] },
    },
    descripcion: { type: DataTypes.TEXT },
  }, {
    tableName:  'categorias_reporte',
    timestamps: true,
    createdAt:  'fecha_creacion',
    updatedAt:  'fecha_actualizacion',
  });

  return CategoriaReporte;
};
