'use strict';

const pool = require('../config/db');

const getAllStatuses = async () => {
  const { rows } = await pool.query('SELECT id, nombre, descripcion FROM estados_reporte ORDER BY id');
  return rows;
};

const findStatusByName = async (nombre) => {
  const { rows } = await pool.query('SELECT id, nombre, descripcion FROM estados_reporte WHERE nombre = $1', [nombre]);
  return rows[0] || null;
};

const findStatusById = async (id) => {
  const { rows } = await pool.query('SELECT id, nombre, descripcion FROM estados_reporte WHERE id = $1', [id]);
  return rows[0] || null;
};

module.exports = { getAllStatuses, findStatusByName, findStatusById };
