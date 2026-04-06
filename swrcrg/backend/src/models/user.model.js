'use strict';

const pool = require('../config/db');

/**
 * Inserta un nuevo usuario y devuelve los datos básicos (sin password).
 */
const createUser = async ({ name, email, password, role = 'citizen' }) => {
  const sql = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
  `;
  const { rows } = await pool.query(sql, [name, email, password, role]);
  return rows[0];
};

/**
 * Busca un usuario por email. Incluye password para uso en autenticación.
 */
const findUserByEmail = async (email) => {
  const sql = `
    SELECT id, name, email, password, role, created_at
    FROM users
    WHERE email = $1
  `;
  const { rows } = await pool.query(sql, [email]);
  return rows[0] || null;
};

/**
 * Busca un usuario por id. No expone el password.
 */
const findUserById = async (id) => {
  const sql = `
    SELECT id, name, email, role, created_at
    FROM users
    WHERE id = $1
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0] || null;
};

module.exports = { createUser, findUserByEmail, findUserById };
