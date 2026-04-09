'use strict';

const notificacionService = require('../services/notificacion.service');

const listar = async (req, res) => {
  try {
    const notificaciones = await notificacionService.listarPorUsuario(req.user.id);
    res.json({ notificaciones });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const marcarLeida = async (req, res) => {
  try {
    const notif = await notificacionService.marcarLeida(req.params.id, req.user.id);
    if (!notif) return res.status(404).json({ error: 'Notificación no encontrada' });
    res.json({ notificacion: notif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const marcarTodasLeidas = async (req, res) => {
  try {
    await notificacionService.marcarTodasLeidas(req.user.id);
    res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listar, marcarLeida, marcarTodasLeidas };
