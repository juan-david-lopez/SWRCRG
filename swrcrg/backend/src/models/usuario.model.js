'use strict';

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre:      { type: DataTypes.STRING(100), allowNull: false },
    apellido:    { type: DataTypes.STRING(100), allowNull: false },
    correo:      { type: DataTypes.STRING(150), allowNull: false, unique: true },
    contrasena:  { type: DataTypes.STRING(255), allowNull: false },
    telefono:    { type: DataTypes.STRING(20) },
    rol_id:      { type: DataTypes.UUID, allowNull: false },
    activo:      { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName:  'usuarios',
    timestamps: true,
    createdAt:  'fecha_creacion',
    updatedAt:  'fecha_actualizacion',
  });

  return Usuario;
};
