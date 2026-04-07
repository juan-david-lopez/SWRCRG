'use strict';

const { create, getAll, getById, getByUser, updateStatus, addImage, removeImage } = require('../services/report.service');
const { getAllStatuses } = require('../models/reportStatus.model');

const createReport = async (req, res) => {
  const { titulo, descripcion, direccion_referencia, latitud, longitud } = req.body;
  const usuario_id = req.user.id;

  if (!titulo || !descripcion || latitud === undefined || longitud === undefined) {
    return res.status(400).json({ error: 'titulo, descripcion, latitud y longitud son obligatorios' });
  }

  if (isNaN(Number(latitud)) || isNaN(Number(longitud))) {
    return res.status(400).json({ error: 'latitud y longitud deben ser números válidos' });
  }

  try {
    const report = await create({
      titulo, descripcion, direccion_referencia,
      latitud: Number(latitud), longitud: Number(longitud),
      usuario_id,
    });

    // Si viene imagen, la asociamos
    if (req.file) {
      await addImage({ reporte_id: report.id, file: req.file });
    }

    return res.status(201).json({ report });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const listReports = async (req, res) => {
  try {
    const reports = await getAll();
    return res.status(200).json({ reports });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getReport = async (req, res) => {
  const { id } = req.params;
  if (isNaN(Number(id))) return res.status(400).json({ error: 'id inválido' });

  try {
    const report = await getById(Number(id));
    if (!report) return res.status(404).json({ error: 'Reporte no encontrado' });
    return res.status(200).json({ report });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const listMyReports = async (req, res) => {
  try {
    const reports = await getByUser(req.user.id);
    return res.status(200).json({ reports });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const changeStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (isNaN(Number(id))) return res.status(400).json({ error: 'id inválido' });
  if (!estado) return res.status(400).json({ error: 'estado es obligatorio' });

  try {
    const report = await updateStatus(Number(id), estado);
    if (!report) return res.status(404).json({ error: 'Reporte no encontrado' });
    return res.status(200).json({ report });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

const uploadImage = async (req, res) => {
  const { id } = req.params;
  if (isNaN(Number(id))) return res.status(400).json({ error: 'id inválido' });
  if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });

  try {
    const imagen = await addImage({ reporte_id: Number(id), file: req.file });
    return res.status(201).json({ imagen });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const deleteImage = async (req, res) => {
  const { imageId } = req.params;
  if (isNaN(Number(imageId))) return res.status(400).json({ error: 'imageId inválido' });

  try {
    const imagen = await removeImage(Number(imageId));
    if (!imagen) return res.status(404).json({ error: 'Imagen no encontrada' });
    return res.status(200).json({ imagen });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const listStatuses = async (req, res) => {
  try {
    const statuses = await getAllStatuses();
    return res.status(200).json({ statuses });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { createReport, listReports, getReport, listMyReports, changeStatus, uploadImage, deleteImage, listStatuses };
