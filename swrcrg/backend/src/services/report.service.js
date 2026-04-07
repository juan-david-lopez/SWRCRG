'use strict';

const { createReport, getAllReports, getReportById, updateReportStatus, getReportsByUser } = require('../models/report.model');
const { createImage, getImagesByReportId, deleteImage }                                    = require('../models/reportImage.model');
const { findStatusByName, findStatusById }                                                 = require('../models/reportStatus.model');

const create = async ({ titulo, descripcion, direccion_referencia, latitud, longitud, usuario_id }) => {
  const estado = await findStatusByName('pendiente');
  if (!estado) throw new Error('Estado pendiente no encontrado');
  return createReport({ titulo, descripcion, direccion_referencia, latitud, longitud, usuario_id, estado_id: estado.id });
};

const getAll = async () => getAllReports();

const getById = async (id) => {
  const report = await getReportById(id);
  if (!report) return null;
  const imagenes = await getImagesByReportId(id);
  return { ...report, imagenes };
};

const getByUser = async (usuario_id) => getReportsByUser(usuario_id);

const updateStatus = async (id, estado_nombre) => {
  const estado = await findStatusByName(estado_nombre);
  if (!estado) {
    const err = new Error(`Estado '${estado_nombre}' no existe`);
    err.status = 400;
    throw err;
  }
  return updateReportStatus(id, estado.id);
};

const addImage = async ({ reporte_id, file }) => {
  return createImage({
    reporte_id,
    url_imagen:     `/uploads/${file.filename}`,
    nombre_archivo: file.originalname,
    tipo_archivo:   file.mimetype,
    tamano_archivo: file.size,
  });
};

const removeImage = async (id) => deleteImage(id);

module.exports = { create, getAll, getById, getByUser, updateStatus, addImage, removeImage };
