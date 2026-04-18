'use strict';

const { validationResult } = require('express-validator');
const reporteService       = require('../services/reporte.service');

const handle = (fn) => async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
  try { await fn(req, res); }
  catch (err) { res.status(err.status || 500).json({ error: err.message }); }
};

const crear = handle(async (req, res) => {
  const { titulo, descripcion, direccion_referencia, latitud, longitud, categoria_id } = req.body;
  const reporte = await reporteService.crear({
    titulo, descripcion, direccion_referencia,
    latitud: Number(latitud), longitud: Number(longitud),
    usuario_id: req.user.id, categoria_id,
  });
  if (req.file) await reporteService.agregarImagen({ reporte_id: reporte.id, file: req.file });
  res.status(201).json({ reporte });
});

const listar = handle(async (req, res) => {
  const reportes = await reporteService.listar();
  res.json({ reportes });
});

const listarPorCategoria = handle(async (req, res) => {
  const reportes = await reporteService.listarPorCategoria(req.params.categoriaId);
  res.json({ reportes });
});

const obtener = handle(async (req, res) => {
  const reporte = await reporteService.obtenerPorId(req.params.id);
  if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
  res.json({ reporte });
});

const misReportes = handle(async (req, res) => {
  const reportes = await reporteService.obtenerPorUsuario(req.user.id);
  res.json({ reportes });
});

const cambiarEstado = handle(async (req, res) => {
  const { estado, observacion } = req.body;
  const reporte = await reporteService.cambiarEstado(req.params.id, estado, req.user.id, observacion);
  res.json({ reporte });
});

const subirImagen = handle(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });
  const imagen = await reporteService.agregarImagen({ reporte_id: req.params.id, file: req.file });
  res.status(201).json({ imagen });
});

const eliminarImagen = handle(async (req, res) => {
  const imagen = await reporteService.eliminarImagen(req.params.imageId);
  if (!imagen) return res.status(404).json({ error: 'Imagen no encontrada' });
  res.json({ imagen });
});

const editar = handle(async (req, res) => {
  const reporte = await reporteService.obtenerPorId(req.params.id);
  if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
  if (reporte.usuario_id !== req.user.id && req.user.rol !== 'administrador')
    return res.status(403).json({ error: 'No tienes permiso para editar este reporte' });
  const { titulo, descripcion, direccion_referencia } = req.body;
  const updated = await reporteService.editar(req.params.id, { titulo, descripcion, direccion_referencia });
  res.json({ reporte: updated });
});

const eliminar = handle(async (req, res) => {
  const reporte = await reporteService.obtenerPorId(req.params.id);
  if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
  if (reporte.usuario_id !== req.user.id && req.user.rol !== 'administrador')
    return res.status(403).json({ error: 'No tienes permiso para eliminar este reporte' });
  await reporteService.eliminar(req.params.id);
  res.json({ message: 'Reporte eliminado' });
});

module.exports = { crear, listar, listarPorCategoria, obtener, misReportes, cambiarEstado, subirImagen, eliminarImagen, editar, eliminar };
