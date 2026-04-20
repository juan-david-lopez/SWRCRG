'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/sequelize');

const env      = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  { host: dbConfig.host, port: dbConfig.port, dialect: dbConfig.dialect, logging: dbConfig.logging }
);

// ── Importar modelos ──────────────────────────────────────────────────────────
const Rol                  = require('./rol.model')(sequelize, DataTypes);
const Usuario              = require('./usuario.model')(sequelize, DataTypes);
const EstadoReporte        = require('./estadoReporte.model')(sequelize, DataTypes);
const CategoriaReporte     = require('./categoriaReporte.model')(sequelize, DataTypes);
const Reporte              = require('./reporte.model')(sequelize, DataTypes);
const ImagenReporte        = require('./imagenReporte.model')(sequelize, DataTypes);
const HistorialEstado      = require('./historialEstado.model')(sequelize, DataTypes);
const ComentarioReporte    = require('./comentarioReporte.model')(sequelize, DataTypes);
const Notificacion         = require('./notificacion.model')(sequelize, DataTypes);
const ComentarioLike       = require('./comentarioLike.model')(sequelize, DataTypes);

// ── Asociaciones ──────────────────────────────────────────────────────────────

// Rol ↔ Usuario
Rol.hasMany(Usuario,     { foreignKey: 'rol_id', as: 'usuarios' });
Usuario.belongsTo(Rol,   { foreignKey: 'rol_id', as: 'rol' });

// CategoriaReporte ↔ Reporte
CategoriaReporte.hasMany(Reporte,        { foreignKey: 'categoria_id', as: 'reportes' });
Reporte.belongsTo(CategoriaReporte,      { foreignKey: 'categoria_id', as: 'categoria' });

// EstadoReporte ↔ Reporte
EstadoReporte.hasMany(Reporte,           { foreignKey: 'estado_id', as: 'reportes' });
Reporte.belongsTo(EstadoReporte,         { foreignKey: 'estado_id', as: 'estado' });

// Usuario ↔ Reporte
Usuario.hasMany(Reporte,                 { foreignKey: 'usuario_id', as: 'reportes' });
Reporte.belongsTo(Usuario,              { foreignKey: 'usuario_id', as: 'usuario' });

// Reporte ↔ ImagenReporte
Reporte.hasMany(ImagenReporte,           { foreignKey: 'reporte_id', as: 'imagenes', onDelete: 'CASCADE' });
ImagenReporte.belongsTo(Reporte,         { foreignKey: 'reporte_id', as: 'reporte' });

// Reporte ↔ HistorialEstado
Reporte.hasMany(HistorialEstado,         { foreignKey: 'reporte_id', as: 'historial', onDelete: 'CASCADE' });
HistorialEstado.belongsTo(Reporte,       { foreignKey: 'reporte_id', as: 'reporte' });
EstadoReporte.hasMany(HistorialEstado,   { foreignKey: 'estado_id',  as: 'historial' });
HistorialEstado.belongsTo(EstadoReporte, { foreignKey: 'estado_id',  as: 'estado' });
Usuario.hasMany(HistorialEstado,         { foreignKey: 'usuario_id', as: 'historialCambios' });
HistorialEstado.belongsTo(Usuario,       { foreignKey: 'usuario_id', as: 'usuario' });

// Reporte ↔ ComentarioReporte
Reporte.hasMany(ComentarioReporte,       { foreignKey: 'reporte_id', as: 'comentarios', onDelete: 'CASCADE' });
ComentarioReporte.belongsTo(Reporte,     { foreignKey: 'reporte_id', as: 'reporte' });
Usuario.hasMany(ComentarioReporte,       { foreignKey: 'usuario_id', as: 'comentarios' });
ComentarioReporte.belongsTo(Usuario,     { foreignKey: 'usuario_id', as: 'usuario' });

// ComentarioReporte self-referential (replies)
ComentarioReporte.hasMany(ComentarioReporte, { foreignKey: 'parent_id', as: 'respuestas', onDelete: 'CASCADE' });
ComentarioReporte.belongsTo(ComentarioReporte, { foreignKey: 'parent_id', as: 'parent' });

// ComentarioReporte ↔ ComentarioLike
ComentarioReporte.hasMany(ComentarioLike, { foreignKey: 'comentario_id', as: 'likes', onDelete: 'CASCADE' });
ComentarioLike.belongsTo(ComentarioReporte, { foreignKey: 'comentario_id', as: 'comentario' });
Usuario.hasMany(ComentarioLike,           { foreignKey: 'usuario_id', as: 'comentarioLikes' });
ComentarioLike.belongsTo(Usuario,         { foreignKey: 'usuario_id', as: 'usuario' });

// Usuario ↔ Notificacion
Usuario.hasMany(Notificacion,            { foreignKey: 'usuario_id', as: 'notificaciones', onDelete: 'CASCADE' });
Notificacion.belongsTo(Usuario,          { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = {
  sequelize,
  Sequelize,
  Rol,
  Usuario,
  EstadoReporte,
  CategoriaReporte,
  Reporte,
  ImagenReporte,
  HistorialEstado,
  ComentarioReporte,
  ComentarioLike,
  Notificacion,
};
