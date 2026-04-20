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
  const incluirRechazados = req.user?.rol === 'administrador';
  const sortBy = req.query.sortBy === 'votos' ? 'votos' : 'fecha';
  const reportes = await reporteService.listar({ incluirRechazados, sortBy });
  res.json({ reportes });
});

const listarPorCategoria = handle(async (req, res) => {
  const reportes = await reporteService.listarPorCategoria(req.params.categoriaId);
  res.json({ reportes });
});

const obtener = handle(async (req, res) => {
  const reporte = await reporteService.obtenerPorId(req.params.id);
  if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });

  // Si el reporte está rechazado, solo lo puede ver el dueño o un admin
  if (reporte.estado?.nombre === 'rechazado') {
    const esAdmin  = req.user?.rol === 'administrador';
    const esDuenio = req.user?.id === reporte.usuario_id;
    if (!esAdmin && !esDuenio)
      return res.status(404).json({ error: 'Reporte no encontrado' });
  }

  res.json({ reporte });
});

const misReportes = handle(async (req, res) => {
  // El ciudadano ve todos sus reportes incluyendo rechazados
  const reportes = await reporteService.obtenerPorUsuario(req.user.id);
  res.json({ reportes });
});

const cambiarEstado = handle(async (req, res) => {
  const { estado, observacion, motivo_rechazo } = req.body;
  const reporte = await reporteService.cambiarEstado(req.params.id, estado, req.user.id, observacion, motivo_rechazo);
  res.json({ reporte });
});

const reenviarParaRevision = handle(async (req, res) => {
  const reporte = await reporteService.reenviarParaRevision(req.params.id, req.user.id);
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

const votar = handle(async (req, res) => {
  const { votos, voted } = await reporteService.votar(req.params.id, req.user.id);
  res.json({ votos, voted });
});

const cercanos = handle(async (req, res) => {
  const { lat, lng, radio = 0.5 } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat y lng son requeridos' });
  const reportes = await reporteService.buscarCercanos(parseFloat(lat), parseFloat(lng), parseFloat(radio));
  res.json({ reportes });
});

const reportarContenido = handle(async (req, res) => {
  const reporte = await reporteService.obtenerPorId(req.params.id);
  if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
  if (reporte.usuario_id === req.user.id) return res.status(400).json({ error: 'No puedes reportar tu propio contenido' });
  await reporteService.reportarContenido(req.params.id, req.user.id, req.body.motivo || '');
  res.json({ message: 'Contenido reportado. El equipo lo revisará.' });
});

const asignar = handle(async (req, res) => {
  const { funcionario_id } = req.body;
  const reporte = await reporteService.asignar(req.params.id, funcionario_id);
  res.json({ reporte });
});

const exportarCSV = handle(async (req, res) => {
  const reportes = await reporteService.listar({ incluirRechazados: true }); // admin ve todo
  const header = ['ID', 'Título', 'Descripción', 'Estado', 'Categoría', 'Dirección', 'Latitud', 'Longitud', 'Usuario', 'Fecha'];
  const rows = reportes.map((r) => [
    r.id,
    `"${(r.titulo || '').replace(/"/g, '""')}"`,
    `"${(r.descripcion || '').replace(/"/g, '""')}"`,
    r.estado?.nombre || '',
    r.categoria?.nombre || '',
    `"${(r.direccion_referencia || '').replace(/"/g, '""')}"`,
    r.latitud,
    r.longitud,
    `"${r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido}` : ''}"`,
    r.fecha_reporte ? new Date(r.fecha_reporte).toISOString().split('T')[0] : '',
  ].join(','));
  const csv = [header.join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="reportes-${Date.now()}.csv"`);
  res.send('\uFEFF' + csv); // BOM para Excel
});

module.exports = { crear, listar, listarPorCategoria, obtener, misReportes, cambiarEstado, reenviarParaRevision, subirImagen, eliminarImagen, editar, eliminar, votar, cercanos, exportarCSV, reportarContenido, asignar };
