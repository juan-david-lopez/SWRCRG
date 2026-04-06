'use strict';

const { create, getAll, getById, updateStatus } = require('../services/report.service');

const VALID_STATUSES = ['pendiente', 'en_proceso', 'resuelto'];

const createReport = async (req, res) => {
  const { title, description, latitude, longitude } = req.body;
  const user_id   = req.user.id;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title || !description || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'title, description, latitude y longitude son obligatorios' });
  }

  if (isNaN(Number(latitude)) || isNaN(Number(longitude))) {
    return res.status(400).json({ error: 'latitude y longitude deben ser números válidos' });
  }

  try {
    const report = await create({
      title,
      description,
      latitude:  Number(latitude),
      longitude: Number(longitude),
      image_url,
      user_id,
    });
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

  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'El id debe ser un número válido' });
  }

  try {
    const report = await getById(Number(id));
    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    return res.status(200).json({ report });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const changeStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'El id debe ser un número válido' });
  }

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status debe ser uno de: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    const report = await updateStatus(Number(id), status);
    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    return res.status(200).json({ report });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { createReport, listReports, getReport, changeStatus };
