'use strict';

const { validationResult } = require('express-validator');
const comentarioService    = require('../services/comentario.service');
const { HistorialEstado, EstadoReporte, Usuario } = require('../models');

const handle = (fn) => async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
  try { await fn(req, res); }
  catch (err) { res.status(err.status || 500).json({ error: err.message }); }
};

const agregar = handle(async (req, res) => {
  const comentario = await comentarioService.agregar({
    reporte_id: req.params.id,
    usuario_id: req.user.id,
    comentario: req.body.comentario,
    parent_id:  req.body.parent_id ?? null,
  });
  res.status(201).json({ comentario });
});

const listar = handle(async (req, res) => {
  const usuario_id = req.user?.id ?? null;
  const comentarios = await comentarioService.listarPorReporte(req.params.id, usuario_id);
  res.json({ comentarios });
});

const eliminar = handle(async (req, res) => {
  const comentario = await comentarioService.eliminar(req.params.comentarioId, req.user.id, req.user.rol);
  if (!comentario) return res.status(404).json({ error: 'Comentario no encontrado' });
  res.json({ comentario });
});

const like = handle(async (req, res) => {
  const result = await comentarioService.toggleLike(req.params.comentarioId, req.user.id);
  res.json(result);
});

const historial = handle(async (req, res) => {
  const historial = await HistorialEstado.findAll({
    where: { reporte_id: req.params.id },
    include: [
      { model: EstadoReporte, as: 'estado',  attributes: ['id', 'nombre'] },
      { model: Usuario,       as: 'usuario', attributes: ['id', 'nombre', 'apellido'] },
    ],
    order: [['fecha_cambio', 'ASC']],
  });
  res.json({ historial });
});

module.exports = { agregar, listar, eliminar, like, historial };
