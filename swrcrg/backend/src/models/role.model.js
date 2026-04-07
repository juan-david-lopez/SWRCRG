'use strict';

const pool = require('../config/db');

const getAllRoles = async () => {
  const { rows } = await pool.query('SELECT id, nombre, descripcion FROM roles ORDER BY id');
  return rows;
};

const findRoleByName = async (nombre) => {
  const { rows } = await pool.query('SELECT id, nombre, descripcion FROM roles WHERE nombre = $1', [nombre]);
  return rows[0] || null;
};

const findRoleById = async (id) => {
  const { rows } = await pool.query('SELECT id, nombre, descripcion FROM roles WHERE id = $1', [id]);
  return rows[0] || null;
};

module.exports = { getAllRoles, findRoleByName, findRoleById };
