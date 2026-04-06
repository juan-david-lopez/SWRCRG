'use strict';

const pool = require('../config/db');

const createReport = async ({ title, description, latitude, longitude, image_url = null, status = 'pendiente', user_id }) => {
  const sql = `
    INSERT INTO reports (title, description, latitude, longitude, image_url, status, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const { rows } = await pool.query(sql, [title, description, latitude, longitude, image_url, status, user_id]);
  return rows[0];
};

const getAllReports = async () => {
  const sql = `
    SELECT
      r.id, r.title, r.description, r.latitude, r.longitude,
      r.image_url, r.status, r.user_id, r.created_at, r.updated_at,
      u.name AS user_name
    FROM reports r
    JOIN users u ON u.id = r.user_id
    ORDER BY r.created_at DESC
  `;
  const { rows } = await pool.query(sql);
  return rows;
};

const getReportById = async (id) => {
  const sql = `
    SELECT
      r.id, r.title, r.description, r.latitude, r.longitude,
      r.image_url, r.status, r.user_id, r.created_at, r.updated_at,
      u.name AS user_name, u.email AS user_email
    FROM reports r
    JOIN users u ON u.id = r.user_id
    WHERE r.id = $1
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0] || null;
};

const updateReportStatus = async (id, status) => {
  const sql = `
    UPDATE reports SET status = $1
    WHERE id = $2
    RETURNING *
  `;
  const { rows } = await pool.query(sql, [status, id]);
  return rows[0] || null;
};

module.exports = { createReport, getAllReports, getReportById, updateReportStatus };
