'use strict';

module.exports = (sequelize, DataTypes) => {
  const CodigoVerificacion = sequelize.define('CodigoVerificacion', {
    id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    correo:    { type: DataTypes.STRING(150), allowNull: false },
    codigo:    { type: DataTypes.STRING(6),   allowNull: false },
    expira_en: { type: DataTypes.DATE,        allowNull: false },
    usado:     { type: DataTypes.BOOLEAN,     defaultValue: false },
  }, {
    tableName:  'codigos_verificacion',
    timestamps: true,
    updatedAt:  false,
  });

  return CodigoVerificacion;
};
