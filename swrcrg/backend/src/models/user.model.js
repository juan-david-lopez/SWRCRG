'use strict';

const pool = require('../config/db');

const createUser = async ({ nombre, apellido, correo, contrasena, telefono, rol_id }) => {
  const sql = `
    INSERT INTO users (nombre, apellido, correo, contrasena, telefono, rol_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, nombre, apellido, correo, telefono, rol_id, activo, fecha_creacion
  `;
  const { rows } = await pool.query(sql, [nombre, apellido, correo, contrasena, telefono, rol_id]);
  return rows[0];
};

const findUserByEmail = async (correo) => {
  const sql = `
    SELECT u.id, u.nombre, u.apellido, u.correo, u.contrasena, u.telefono,
           u.rol_id, u.activo, u.fecha_creacion,
           r.nombre AS rol_nombre
    FROM users u
    JOIN roles r ON r.id = u.rol_id
    WHERE u.correo = $1
  `;
  const { rows } = await pool.query(sql, [correo]);
  return rows[0] || null;
};

const findUserById = async (id) => {
  const sql = `
    SELECT u.id, u.nombre, u.apellido, u.correo, u.telefono,
           u.rol_id, u.activo, u.fecha_creacion,
           r.nombre AS rol_nombre
    FROM users u
    JOIN roles r ON r.id = u.rol_id
    WHERE u.id = $1
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0] || null;
};

const getAllUsers = async () => {
  const sql = `
    SELECT u.id, u.nombre, u.apellido, u.correo, u.telefono,
           u.rol_id, u.activo, u.fecha_creacion,
           r.nombre AS rol_nombre
    FROM users u
    JOIN roles r ON r.id = u.rol_id
    ORDER BY u.fecha_creacion DESC
  `;
  const { rows } = await pool.query(sql);
  return rows;
};

const updateUserStatus = async (id, activo) => {
  const sql = `
    UPDATE users SET activo = $1 WHERE id = $2
    RETURNING id, nombre, apellido, correo, telefono, rol_id, activo, fecha_creacion
  `;
  const { rows } = await pool.query(sql, [activo, id]);
  return rows[0] || null;
};

module.exports = { createUser, findUserByEmail, findUserById, getAllUsers, updateUserStatus };
