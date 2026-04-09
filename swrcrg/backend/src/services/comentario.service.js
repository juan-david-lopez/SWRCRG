'use strict';

const { ComentarioReporte, Usuario, Reporte } = require('../models');
const notificacionService = require('./notificacion.service');

const agregar = async ({ reporte_id, usuario_id, comentario }) => {
  const reporte = await Reporte.findByPk(reporte_id);
  if (!reporte) throw Object.assign(new Error('Reporte no encontrado'), { status: 404 });

  const nuevo = await ComentarioReporte.create({ reporte_id, usuario_id, comentario });

  // Notificar al dueño del reporte si no es el mismo que comenta
  if (reporte.usuario_id !== usuario_id) {
    await notificacionService.crear({
      usuario_id: reporte.usuario_id,
      titulo:     'Nuevo comentario en tu reporte',
      mensaje:    comentario,
      tipo:       'nuevo_comentario',
    });
  }

  return nuevo;
};

const listarPorReporte = async (reporte_id) => {
  return ComentarioReporte.findAll({
    where: { reporte_id },
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] }],
    order: [['fecha_creacion', 'ASC']],
  });
};

const eliminar = async (id, usuario_id) => {
  const comentario = await ComentarioReporte.findOne({ where: { id, usuario_id } });
  if (!comentario) return null;
  await comentario.destroy();
  return comentario;
};

module.exports = { agregar, listarPorReporte, eliminar };
