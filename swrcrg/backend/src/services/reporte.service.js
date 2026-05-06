'use strict';

const { Reporte, Usuario, EstadoReporte, CategoriaReporte, ImagenReporte, HistorialEstado, ComentarioReporte, Sequelize } = require('../models');
const { Op } = Sequelize;
const notificacionService = require('./notificacion.service');

const INCLUDE_BASE = (extra = []) => [
  { model: Usuario,          as: 'usuario',   attributes: ['id', 'nombre', 'apellido'] },
  { model: EstadoReporte,    as: 'estado',    attributes: ['id', 'nombre'] },
  { model: CategoriaReporte, as: 'categoria', attributes: ['id', 'nombre'] },
  { model: ImagenReporte,    as: 'imagenes',  attributes: ['id', 'url_imagen'], limit: 1 },
  ...extra,
];

const crear = async ({ titulo, descripcion, direccion_referencia, latitud, longitud, usuario_id, categoria_id }) => {
  const estado = await EstadoReporte.findOne({ where: { nombre: 'pendiente' } });
  if (!estado) throw Object.assign(new Error('Estado pendiente no encontrado'), { status: 500 });

  return Reporte.create({ titulo, descripcion, direccion_referencia, latitud, longitud, usuario_id, estado_id: estado.id, categoria_id });
};

const listar = async ({
  incluirRechazados = false,
  sortBy     = 'fecha',
  page       = 1,
  limit      = 10,
  search     = '',
  estado     = '',
  categoria  = '',
  fechaDesde = '',
  fechaHasta = '',
} = {}) => {
  const where = {};

  // Excluir rechazados si no es admin
  if (!incluirRechazados) {
    const rechazado = await EstadoReporte.findOne({ where: { nombre: 'rechazado' } });
    if (rechazado) where.estado_id = { [Op.ne]: rechazado.id };
  }

  // Filtro por estado
  if (estado) {
    const estadoObj = await EstadoReporte.findOne({ where: { nombre: estado } });
    if (estadoObj) where.estado_id = estadoObj.id;
  }

  // Filtro por categoría
  if (categoria) where.categoria_id = categoria;

  // Filtro por texto (título o descripción)
  if (search) {
    where[Op.or] = [
      { titulo:      { [Op.iLike]: `%${search}%` } },
      { descripcion: { [Op.iLike]: `%${search}%` } },
      { direccion_referencia: { [Op.iLike]: `%${search}%` } },
    ];
  }

  // Filtro por rango de fechas
  if (fechaDesde || fechaHasta) {
    where.fecha_reporte = {};
    if (fechaDesde) where.fecha_reporte[Op.gte] = new Date(fechaDesde + 'T00:00:00');
    if (fechaHasta) where.fecha_reporte[Op.lte] = new Date(fechaHasta + 'T23:59:59');
  }

  const order = sortBy === 'votos'
    ? [['votos', 'DESC'], ['fecha_reporte', 'DESC']]
    : [['fecha_reporte', 'DESC']];

  const offset = (Math.max(1, page) - 1) * limit;

  const { count, rows } = await Reporte.findAndCountAll({
    where,
    include: INCLUDE_BASE(),
    order,
    limit,
    offset,
    distinct: true,
  });

  return {
    reportes: rows,
    total:    count,
    page:     Number(page),
    totalPages: Math.ceil(count / limit),
  };
};

// Versión sin paginación para uso interno (exportar, estadísticas, etc.)
const listarTodos = async ({ incluirRechazados = false } = {}) => {
  const where = {};
  if (!incluirRechazados) {
    const rechazado = await EstadoReporte.findOne({ where: { nombre: 'rechazado' } });
    if (rechazado) where.estado_id = { [Op.ne]: rechazado.id };
  }
  return Reporte.findAll({
    where,
    include: INCLUDE_BASE(),
    order: [['fecha_reporte', 'DESC']],
  });
};

const listarPorCategoria = async (categoria_id) => {
  const rechazado = await EstadoReporte.findOne({ where: { nombre: 'rechazado' } });
  const whereEstado = rechazado ? { estado_id: { [Op.ne]: rechazado.id } } : {};

  return Reporte.findAll({
    where: { categoria_id, ...whereEstado },
    include: [
      { model: Usuario,          as: 'usuario',   attributes: ['id', 'nombre', 'apellido'] },
      { model: EstadoReporte,    as: 'estado',    attributes: ['id', 'nombre'] },
      { model: CategoriaReporte, as: 'categoria', attributes: ['id', 'nombre'] },
      { model: ImagenReporte,    as: 'imagenes',  attributes: ['id', 'url_imagen'], limit: 1 },
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
      { model: ImagenReporte,    as: 'imagenes',  attributes: ['id', 'url_imagen'], limit: 1 },
    ],
    order: [['fecha_reporte', 'DESC']],
  });
};

const cambiarEstado = async (id, estado_nombre, admin_id, observacion, motivo_rechazo) => {
  const reporte = await Reporte.findByPk(id, {
    include: [{ model: Usuario, as: 'usuario', attributes: ['id'] }],
  });
  if (!reporte) throw Object.assign(new Error('Reporte no encontrado'), { status: 404 });

  // El admin solo puede cambiar el estado si el reporte está en 'pendiente'
  // (primera revisión) o si fue reenviado (estado_bloqueado = false y estado = 'pendiente')
  const estadoActual = await EstadoReporte.findByPk(reporte.estado_id);
  if (estadoActual?.nombre !== 'pendiente') {
    throw Object.assign(new Error('Solo puedes cambiar el estado de reportes en revisión (pendiente)'), { status: 400 });
  }

  // Validar que si rechaza, debe dar motivo
  if (estado_nombre === 'rechazado' && !motivo_rechazo?.trim()) {
    throw Object.assign(new Error('Debes proporcionar un motivo de rechazo'), { status: 400 });
  }

  // Solo se permiten los estados verificado y rechazado desde pendiente
  if (!['verificado', 'rechazado'].includes(estado_nombre)) {
    throw Object.assign(new Error(`Estado '${estado_nombre}' no es válido. Solo se permite 'verificado' o 'rechazado'`), { status: 400 });
  }

  const estado = await EstadoReporte.findOne({ where: { nombre: estado_nombre } });
  if (!estado) throw Object.assign(new Error(`Estado '${estado_nombre}' no existe`), { status: 400 });

  await reporte.update({
    estado_id:       estado.id,
    estado_bloqueado: true,
    motivo_rechazo:  estado_nombre === 'rechazado' ? motivo_rechazo.trim() : null,
  });

  // Registrar historial
  await HistorialEstado.create({
    reporte_id:  id,
    estado_id:   estado.id,
    usuario_id:  admin_id,
    observacion: estado_nombre === 'rechazado' ? motivo_rechazo : (observacion || ''),
  });

  // Notificar al ciudadano
  const titulo  = estado_nombre === 'verificado'
    ? '✅ Tu reporte fue verificado'
    : '❌ Tu reporte fue rechazado';
  const mensaje = estado_nombre === 'verificado'
    ? 'Tu reporte ha sido revisado y verificado por el equipo.'
    : `Tu reporte fue rechazado. Motivo: ${motivo_rechazo}. Puedes corregirlo y reenviarlo para una nueva revisión.`;

  await notificacionService.crear({
    usuario_id: reporte.usuario_id,
    titulo,
    mensaje,
    tipo: estado_nombre === 'verificado' ? 'cambio_estado' : 'reporte_rechazado',
  });

  return reporte.reload({ include: [{ model: EstadoReporte, as: 'estado' }] });
};

// Ciudadano reenvía un reporte rechazado para nueva revisión
const reenviarParaRevision = async (id, usuario_id) => {
  const reporte = await Reporte.findByPk(id, {
    include: [{ model: EstadoReporte, as: 'estado' }],
  });
  if (!reporte) throw Object.assign(new Error('Reporte no encontrado'), { status: 404 });
  if (reporte.usuario_id !== usuario_id)
    throw Object.assign(new Error('No tienes permiso para reenviar este reporte'), { status: 403 });
  if (reporte.estado?.nombre !== 'rechazado')
    throw Object.assign(new Error('Solo puedes reenviar reportes rechazados'), { status: 400 });

  const estadoPendiente = await EstadoReporte.findOne({ where: { nombre: 'pendiente' } });
  await reporte.update({
    estado_id:        estadoPendiente.id,
    estado_bloqueado: false,
    motivo_rechazo:   null,
  });

  await HistorialEstado.create({
    reporte_id:  id,
    estado_id:   estadoPendiente.id,
    usuario_id,
    observacion: 'Ciudadano reenvió el reporte para nueva revisión',
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

const votar = async (reporte_id, usuario_id) => {
  const reporte = await Reporte.findByPk(reporte_id);
  if (!reporte) throw Object.assign(new Error('Reporte no encontrado'), { status: 404 });
  const votantes = reporte.votantes || [];
  const yaVoto = votantes.includes(usuario_id);
  const nuevosVotantes = yaVoto
    ? votantes.filter((v) => v !== usuario_id)
    : [...votantes, usuario_id];
  await reporte.update({ votos: nuevosVotantes.length, votantes: nuevosVotantes });
  return { votos: nuevosVotantes.length, voted: !yaVoto };
};

// Buscar reportes cercanos (radio en km, fórmula Haversine aproximada)
const buscarCercanos = async (lat, lng, radioKm = 0.5) => {
  const todos = await listar({ incluirRechazados: false }); // no mostrar rechazados en el mapa
  return todos.filter((r) => {
    const dLat = (parseFloat(r.latitud)  - lat) * (Math.PI / 180);
    const dLng = (parseFloat(r.longitud) - lng) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat * Math.PI / 180) * Math.cos(parseFloat(r.latitud) * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    const distKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return distKm <= radioKm;
  });
};

const reportarContenido = async (reporte_id, usuario_id, motivo) => {
  const reporte = await Reporte.findByPk(reporte_id);
  if (!reporte) throw Object.assign(new Error('Reporte no encontrado'), { status: 404 });
  const reportes = reporte.reportes_contenido || [];
  if (reportes.find((r) => r.usuario_id === usuario_id))
    throw Object.assign(new Error('Ya reportaste este contenido'), { status: 400 });
  await reporte.update({ reportes_contenido: [...reportes, { usuario_id, motivo, fecha: new Date() }] });
};

const asignar = async (reporte_id, funcionario_id) => {
  const reporte = await Reporte.findByPk(reporte_id);
  if (!reporte) throw Object.assign(new Error('Reporte no encontrado'), { status: 404 });
  await reporte.update({ asignado_a: funcionario_id || null });
  return reporte.reload({
    include: [
      { model: EstadoReporte,    as: 'estado',    attributes: ['id', 'nombre'] },
      { model: CategoriaReporte, as: 'categoria', attributes: ['id', 'nombre'] },
    ],
  });
};

module.exports = { crear, listar, listarTodos, listarPorCategoria, obtenerPorId, obtenerPorUsuario, cambiarEstado, reenviarParaRevision, agregarImagen, eliminarImagen, editar, eliminar, votar, buscarCercanos, reportarContenido, asignar };
