'use strict';

const TIPOS_VALIDOS = ['cambio_estado', 'nuevo_comentario', 'reporte_resuelto', 'reporte_rechazado'];

module.exports = (sequelize, DataTypes) => {
  const Notificacion = sequelize.define('Notificacion', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    usuario_id:  { type: DataTypes.UUID, allowNull: false },
    titulo:      { type: DataTypes.STRING(150), allowNull: false },
    mensaje:     { type: DataTypes.TEXT, allowNull: false },
    leida:       { type: DataTypes.BOOLEAN, defaultValue: false },
    tipo:        {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { isIn: [TIPOS_VALIDOS] },
    },
  }, {
    tableName:  'notificaciones',
    timestamps: true,
    createdAt:  'fecha_envio',
    updatedAt:  false,
  });

  return Notificacion;
};
