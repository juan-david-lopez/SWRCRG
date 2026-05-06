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
  const {
    sortBy    = 'fecha',
    page      = 1,
    limit     = 10,
    search    = '',
    estado    = '',
    categoria = '',
    fechaDesde = '',
    fechaHasta = '',
  } = req.query;

  const result = await reporteService.listar({
    incluirRechazados,
    sortBy,
    page:      Number(page),
    limit:     Math.min(Number(limit) || 10, 50), // máx 50 por página
    search,
    estado,
    categoria,
    fechaDesde,
    fechaHasta,
  });
  res.json(result);
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
  const reportes = await reporteService.listarTodos({ incluirRechazados: true });
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
  res.send('\uFEFF' + csv);
});

const exportarPDF = handle(async (req, res) => {
  const PDFDocument = require('pdfkit');
  const reportes = await reporteService.listarTodos({ incluirRechazados: true });

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="reportes-${Date.now()}.pdf"`);
  doc.pipe(res);

  // ── Encabezado ──
  doc.fontSize(20).font('Helvetica-Bold').text('SWRCRG — Reporte de Ciudadanos', { align: 'center' });
  doc.fontSize(10).font('Helvetica').fillColor('#666')
    .text(`Generado el ${new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}`, { align: 'center' });
  doc.moveDown(0.5);

  // ── Resumen estadístico ──
  const total      = reportes.length;
  const pendientes = reportes.filter((r) => r.estado?.nombre === 'pendiente').length;
  const verificados = reportes.filter((r) => r.estado?.nombre === 'verificado').length;
  const enProceso  = reportes.filter((r) => r.estado?.nombre === 'en_proceso').length;
  const resueltos  = reportes.filter((r) => r.estado?.nombre === 'resuelto').length;
  const rechazados = reportes.filter((r) => r.estado?.nombre === 'rechazado').length;

  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#e5e7eb').stroke();
  doc.moveDown(0.5);
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#111').text('Resumen');
  doc.moveDown(0.3);

  const stats = [
    ['Total de reportes', total],
    ['Pendientes', pendientes],
    ['Verificados', verificados],
    ['En proceso', enProceso],
    ['Resueltos', resueltos],
    ['Rechazados', rechazados],
    ['Tasa de resolución', total > 0 ? `${Math.round((resueltos / total) * 100)}%` : '0%'],
  ];

  stats.forEach(([label, value]) => {
    doc.fontSize(10).font('Helvetica').fillColor('#374151')
      .text(`${label}:`, { continued: true, width: 200 })
      .font('Helvetica-Bold').fillColor('#111').text(` ${value}`);
  });

  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#e5e7eb').stroke();
  doc.moveDown(0.5);

  // ── Tabla de reportes ──
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#111').text('Listado de reportes');
  doc.moveDown(0.5);

  const colWidths = [180, 70, 80, 100, 80]; // Título, Estado, Categoría, Usuario, Fecha
  const headers   = ['Título', 'Estado', 'Categoría', 'Usuario', 'Fecha'];
  const startX    = 40;

  // Cabecera de tabla
  doc.rect(startX, doc.y, colWidths.reduce((a, b) => a + b, 0), 18).fill('#2563eb');
  let x = startX;
  headers.forEach((h, i) => {
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff')
      .text(h, x + 4, doc.y - 14, { width: colWidths[i] - 8, lineBreak: false });
    x += colWidths[i];
  });
  doc.moveDown(0.2);

  // Filas
  const STATUS_ES = { pendiente: 'Pendiente', verificado: 'Verificado', en_proceso: 'En proceso', resuelto: 'Resuelto', rechazado: 'Rechazado' };
  reportes.forEach((r, idx) => {
    if (doc.y > 750) { doc.addPage(); }

    const rowY  = doc.y;
    const rowH  = 16;
    const fill  = idx % 2 === 0 ? '#f9fafb' : '#ffffff';
    doc.rect(startX, rowY, colWidths.reduce((a, b) => a + b, 0), rowH).fill(fill);

    const cells = [
      (r.titulo || '').slice(0, 28),
      STATUS_ES[r.estado?.nombre] || r.estado?.nombre || '',
      (r.categoria?.nombre || '').replace(/_/g, ' ').slice(0, 14),
      r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido}`.slice(0, 18) : '',
      r.fecha_reporte ? new Date(r.fecha_reporte).toLocaleDateString('es-CO') : '',
    ];

    x = startX;
    cells.forEach((cell, i) => {
      doc.fontSize(8).font('Helvetica').fillColor('#374151')
        .text(cell, x + 4, rowY + 4, { width: colWidths[i] - 8, lineBreak: false });
      x += colWidths[i];
    });
    doc.y = rowY + rowH;
  });

  doc.end();
});

const estadisticas = handle(async (req, res) => {
  const reportes = await reporteService.listarTodos({ incluirRechazados: true });

  const total      = reportes.length;
  const porEstado  = {};
  const porCategoria = {};
  const porMes    = {};

  reportes.forEach((r) => {
    // Por estado
    const est = r.estado?.nombre || 'desconocido';
    porEstado[est] = (porEstado[est] || 0) + 1;

    // Por categoría
    const cat = r.categoria?.nombre?.replace(/_/g, ' ') || 'Sin categoría';
    porCategoria[cat] = (porCategoria[cat] || 0) + 1;

    // Por mes (últimos 12 meses)
    const fecha = new Date(r.fecha_reporte);
    const key   = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    porMes[key] = (porMes[key] || 0) + 1;
  });

  // Generar los últimos 12 meses aunque no tengan datos
  const meses = [];
  const now   = new Date();
  for (let i = 11; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    meses.push({
      mes:   key,
      label: d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }),
      count: porMes[key] || 0,
    });
  }

  const resueltos  = porEstado['resuelto']  || 0;
  const pendientes = porEstado['pendiente'] || 0;

  res.json({
    total,
    porEstado,
    porCategoria: Object.entries(porCategoria)
      .sort((a, b) => b[1] - a[1])
      .map(([nombre, count]) => ({ nombre, count })),
    tendenciaMensual: meses,
    tasaResolucion:   total > 0 ? Math.round((resueltos / total) * 100) : 0,
    tiempoPromedioResolucion: null, // requeriría timestamps adicionales
    topCategorias: Object.entries(porCategoria)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, count]) => ({ nombre, count })),
  });
});

module.exports = { crear, listar, listarPorCategoria, obtener, misReportes, cambiarEstado, reenviarParaRevision, subirImagen, eliminarImagen, editar, eliminar, votar, cercanos, exportarCSV, exportarPDF, estadisticas, reportarContenido, asignar };
