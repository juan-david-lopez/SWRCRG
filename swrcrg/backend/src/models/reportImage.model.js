'use strict';

const pool = require('../config/db');

const createImage = async ({ reporte_id, url_imagen, nombre_archivo, tipo_archivo, tamano_archivo }) => {
  const sql = `
    INSERT INTO report_images (reporte_id, url_imagen, nombre_archivo, tipo_archivo, tamano_archivo)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const { rows } = await pool.query(sql, [reporte_id, url_imagen, nombre_archivo, tipo_archivo, tamano_archivo]);
  return rows[0];
};

const getImagesByReportId = async (reporte_id) => {
  const sql = `SELECT * FROM report_images WHERE reporte_id = $1 ORDER BY fecha_subida ASC`;
  const { rows } = await pool.query(sql, [reporte_id]);
  return rows;
};

const deleteImage = async (id) => {
  const { rows } = await pool.query('DELETE FROM report_images WHERE id = $1 RETURNING *', [id]);
  return rows[0] || null;
};

module.exports = { createImage, getImagesByReportId, deleteImage };
