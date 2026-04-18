'use strict';

const { Reporte, Usuario, EstadoReporte, CategoriaReporte, ImagenReporte, HistorialEstado, ComentarioReporte } = require('../models');
const notificacionService = require('./notificacion.service');

const crear = async ({ titulo, descripcion, direccion_referencia, latitud, longitud, usuario_id, categoria_id }) => {
  const estado = await EstadoReporte.findOne({ where: { nombre: 'pendiente' } });
  if (!estado) throw Object.assign(new Error('Estado pendiente no encontrado'), { status: 500 });

  return Reporte.create({ titulo, descripcion, direccion_referencia, latitud, longitud, usuario_id, estado_id: estado.id, categoria_id });
};

const listar = async () => {
  return Reporte.findAll({
    include: [
      { model: Usuario,          as: 'usuario',   attributes: ['id', 'nombre', 'apellido'] },
      { model: EstadoReporte,    as: 'estado',    attributes: ['id', 'nombre'] },
      { model: CategoriaReporte, as: 'categoria', attributes: ['id', 'nombre'] },
    ],
    order: [['fecha_reporte', 'DESC']],
  });
};

const listarPorCategoria = async (categoria_id) => {
  return Reporte.findAll({
    where: { categoria_id },
    include: [
      { model: Usuario,          as: 'usuario',   attributes: ['id', 'nombre', 'apellido'] },
      { model: EstadoReporte,    as: 'estado',    attributes: ['id', 'nombre'] },
      { model: CategoriaReporte, as: 'categoria', attributes: ['id', 'nombre'] },
    ],
    order: [['fecha_reporte', 'DESC']],
  });
};

const obtenerPorId = async (id) => {
  return Reporte.findByPk(id, {
    include: [
      { model: Usuario,          as: 'usuario',   attributes: ['id', 'nombre', 'apellido', 'correo'] },
      { model: EstadoReporte,    as: 'estado',    attributes: ['id', 'nombre'] },
      { model: CategoriaReporte, as: 'categoria', attributes: ['id', 'nombre'] },
      { model: ImagenReporte,    as: 'imagenes' },
    ],
  });
};

const obtenerPorUsuario = async (usuario_id) => {
  return Reporte.findAll({
    where: { usuario_id },
    include: [
      { model: EstadoReporte,    as: 'estado',    attributes: ['id', 'nombre'] },
      { model: CategoriaReporte, as: 'categoria', attributes: ['id', 'nombre'] },
    ],
    order: [['fecha_reporte', 'DESC']],
  });
};

const cambiarEstado = async (id, estado_nombre, admin_id, observacion) => {
  const reporte = await Reporte.findByPk(id, {
    include: [{ model: Usuario, as: 'usuario', attributes: ['id'] }],
  });
  if (!reporte) throw Object.assign(new Error('Reporte no encontrado'), { status: 404 });

  const estado = await EstadoReporte.findOne({ where: { nombre: estado_nombre } });
  if (!estado) throw Object.assign(new Error(`Estado '${estado_nombre}' no existe`), { status: 400 });

  await reporte.update({ estado_id: estado.id });

  // Registrar historial
  await HistorialEstado.create({ reporte_id: id, estado_id: estado.id, usuario_id: admin_id, observacion });

  // Notificar al ciudadano
  const tipo = estado_nombre === 'resuelto' ? 'reporte_resuelto' : 'cambio_estado';
  await notificacionService.crear({
    usuario_id: reporte.usuario_id,
    titulo:     `Tu reporte cambió a: ${estado_nombre}`,
    mensaje:    observacion || `El estado de tu reporte fue actualizado a "${estado_nombre}".`,
    tipo,
  });

  return reporte.reload({ include: [{ model: EstadoReporte, as: 'estado' }] });
};

const agregarImagen = async ({ reporte_id, file }) => {
  return ImagenReporte.create({
    reporte_id,
    url_imagen:     `/uploads/${file.filename}`,
    nombre_archivo: file.originalname,
    tipo_archivo:   file.mimetype,
    tamano_archivo: file.size,
  });
};

const eliminarImagen = async (id) => {
  const img = await ImagenReporte.findByPk(id);
  if (!img) return null;
  await img.destroy();
  return img;
};

const editar = async (id, { titulo, descripcion, direccion_referencia }) => {
  const reporte = await Reporte.findByPk(id);
  if (!reporte) throw Object.assign(new Error('Reporte no encontrado'), { status: 404 });
  await reporte.update({
    ...(titulo               !== undefined ? { titulo }               : {}),
    ...(descripcion          !== undefined ? { descripcion }          : {}),
    ...(direccion_referencia !== undefined ? { direccion_referencia } : {}),
  });
  return reporte.reload({
    include: [
      { model: EstadoReporte,    as: 'estado',    attributes: ['id', 'nombre'] },
      { model: CategoriaReporte, as: 'categoria', attributes: ['id', 'nombre'] },
      { model: ImagenReporte,    as: 'imagenes' },
    ],
  });
};

const eliminar = async (id) => {
  const reporte = await Reporte.findByPk(id);
  if (!reporte) throw Object.assign(new Error('Reporte no encontrado'), { status: 404 });
  await reporte.destroy();
};

module.exports = { crear, listar, listarPorCategoria, obtenerPorId, obtenerPorUsuario, cambiarEstado, agregarImagen, eliminarImagen, editar, eliminar };
