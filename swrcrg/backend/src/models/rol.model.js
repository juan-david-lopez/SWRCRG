'use strict';

module.exports = (sequelize, DataTypes) => {
  const Rol = sequelize.define('Rol', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre:      { type: DataTypes.STRING(50), allowNull: false, unique: true },
    descripcion: { type: DataTypes.TEXT },
  }, {
    tableName:  'roles',
    timestamps: true,
    createdAt:  'fecha_creacion',
    updatedAt:  'fecha_actualizacion',
  });

  return Rol;
};
