'use strict';

const { ComentarioReporte, ComentarioLike, Usuario, Reporte } = require('../models');
const notificacionService = require('./notificacion.service');

const USUARIO_ATTRS = ['id', 'nombre', 'apellido'];

const agregar = async ({ reporte_id, usuario_id, comentario, parent_id = null }) => {
  const reporte = await Reporte.findByPk(reporte_id);
  if (!reporte) throw Object.assign(new Error('Reporte no encontrado'), { status: 404 });

  if (parent_id) {
    const parent = await ComentarioReporte.findOne({ where: { id: parent_id, reporte_id } });
    if (!parent) throw Object.assign(new Error('Comentario padre no encontrado'), { status: 404 });
  }

  const nuevo = await ComentarioReporte.create({ reporte_id, usuario_id, comentario, parent_id });

  // Notificar al dueño del reporte si no es el mismo que comenta
  if (reporte.usuario_id !== usuario_id) {
    await notificacionService.crear({
      usuario_id: reporte.usuario_id,
      titulo:     parent_id ? 'Nueva respuesta en tu reporte' : 'Nuevo comentario en tu reporte',
      mensaje:    comentario,
      tipo:       'nuevo_comentario',
    });
  }

  return nuevo.reload({
    include: [{ model: Usuario, as: 'usuario', attributes: USUARIO_ATTRS }],
  });
};

const listarPorReporte = async (reporte_id, usuario_id = null) => {
  // Solo comentarios raíz (sin parent)
  const comentarios = await ComentarioReporte.findAll({
    where:   { reporte_id, parent_id: null },
    include: [
      { model: Usuario, as: 'usuario', attributes: USUARIO_ATTRS },
      { model: ComentarioLike, as: 'likes', attributes: ['usuario_id'] },
      {
        model:   ComentarioReporte,
        as:      'respuestas',
        include: [
          { model: Usuario, as: 'usuario', attributes: USUARIO_ATTRS },
          { model: ComentarioLike, as: 'likes', attributes: ['usuario_id'] },
        ],
        order: [['fecha_creacion', 'ASC']],
      },
    ],
    order: [['fecha_creacion', 'ASC']],
  });

  return comentarios.map((c) => serializarComentario(c, usuario_id));
};

const serializarComentario = (c, usuario_id) => {
  const plain = c.toJSON();
  plain.total_likes = plain.likes?.length ?? 0;
  plain.liked       = usuario_id ? plain.likes?.some((l) => l.usuario_id === usuario_id) : false;
  plain.respuestas  = (plain.respuestas ?? [])
    .map((r) => {
      r.total_likes = r.likes?.length ?? 0;
      r.liked       = usuario_id ? r.likes?.some((l) => l.usuario_id === usuario_id) : false;
      delete r.likes;
      return r;
    })
    .sort((a, b) => b.total_likes - a.total_likes); // más relevantes primero
  delete plain.likes;
  return plain;
};

const toggleLike = async (comentario_id, usuario_id) => {
  const comentario = await ComentarioReporte.findByPk(comentario_id);
  if (!comentario) throw Object.assign(new Error('Comentario no encontrado'), { status: 404 });

  const existing = await ComentarioLike.findOne({ where: { comentario_id, usuario_id } });
  if (existing) {
    await existing.destroy();
  } else {
    await ComentarioLike.create({ comentario_id, usuario_id });
  }

  const total_likes = await ComentarioLike.count({ where: { comentario_id } });
  return { liked: !existing, total_likes };
};

const eliminar = async (id, usuario_id, rol) => {
  const where = rol === 'administrador' ? { id } : { id, usuario_id };
  const comentario = await ComentarioReporte.findOne({ where });
  if (!comentario) return null;
  await comentario.destroy();
  return comentario;
};

module.exports = { agregar, listarPorReporte, toggleLike, eliminar };
