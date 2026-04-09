'use strict';

const { Notificacion } = require('../models');

const crear = async ({ usuario_id, titulo, mensaje, tipo }) => {
  return Notificacion.create({ usuario_id, titulo, mensaje, tipo });
};

const listarPorUsuario = async (usuario_id) => {
  return Notificacion.findAll({
    where: { usuario_id },
    order: [['fecha_envio', 'DESC']],
  });
};

const marcarLeida = async (id, usuario_id) => {
  const notif = await Notificacion.findOne({ where: { id, usuario_id } });
  if (!notif) return null;
  return notif.update({ leida: true });
};

const marcarTodasLeidas = async (usuario_id) => {
  await Notificacion.update({ leida: true }, { where: { usuario_id, leida: false } });
};

module.exports = { crear, listarPorUsuario, marcarLeida, marcarTodasLeidas };
