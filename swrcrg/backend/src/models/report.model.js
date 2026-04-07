'use strict';

const pool = require('../config/db');

const createReport = async ({ titulo, descripcion, direccion_referencia, latitud, longitud, usuario_id, estado_id }) => {
  const sql = `
    INSERT INTO reports (titulo, descripcion, direccion_referencia, latitud, longitud, usuario_id, estado_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const { rows } = await pool.query(sql, [titulo, descripcion, direccion_referencia, latitud, longitud, usuario_id, estado_id]);
  return rows[0];
};

const getAllReports = async () => {
  const sql = `
    SELECT
      r.id, r.titulo, r.descripcion, r.direccion_referencia,
      r.latitud, r.longitud, r.usuario_id, r.estado_id,
      r.fecha_reporte, r.fecha_actualizacion,
      u.nombre AS usuario_nombre, u.apellido AS usuario_apellido,
      e.nombre AS estado_nombre
    FROM reports r
    JOIN users u ON u.id = r.usuario_id
    JOIN estados_reporte e ON e.id = r.estado_id
    ORDER BY r.fecha_reporte DESC
  `;
  const { rows } = await pool.query(sql);
  return rows;
};

const getReportById = async (id) => {
  const sql = `
    SELECT
      r.id, r.titulo, r.descripcion, r.direccion_referencia,
      r.latitud, r.longitud, r.usuario_id, r.estado_id,
      r.fecha_reporte, r.fecha_actualizacion,
      u.nombre AS usuario_nombre, u.apellido AS usuario_apellido, u.correo AS usuario_correo,
      e.nombre AS estado_nombre
    FROM reports r
    JOIN users u ON u.id = r.usuario_id
    JOIN estados_reporte e ON e.id = r.estado_id
    WHERE r.id = $1
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0] || null;
};

const updateReportStatus = async (id, estado_id) => {
  const sql = `
    UPDATE reports SET estado_id = $1 WHERE id = $2
    RETURNING *
  `;
  const { rows } = await pool.query(sql, [estado_id, id]);
  return rows[0] || null;
};

const getReportsByUser = async (usuario_id) => {
  const sql = `
    SELECT
      r.id, r.titulo, r.descripcion, r.direccion_referencia,
      r.latitud, r.longitud, r.estado_id,
      r.fecha_reporte, r.fecha_actualizacion,
      e.nombre AS estado_nombre
    FROM reports r
    JOIN estados_reporte e ON e.id = r.estado_id
    WHERE r.usuario_id = $1
    ORDER BY r.fecha_reporte DESC
  `;
  const { rows } = await pool.query(sql, [usuario_id]);
  return rows;
};

module.exports = { createReport, getAllReports, getReportById, updateReportStatus, getReportsByUser };
