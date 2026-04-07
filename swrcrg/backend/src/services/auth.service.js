'use strict';

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/user.model');
const { findRoleByName }              = require('../models/role.model');
const { JWT_SECRET, JWT_EXPIRES_IN }  = require('../config/env');

const register = async ({ nombre, apellido, correo, contrasena, telefono }) => {
  const existing = await findUserByEmail(correo);
  if (existing) {
    const err = new Error('El correo ya está registrado');
    err.status = 409;
    throw err;
  }

  const rol = await findRoleByName('ciudadano');
  if (!rol) {
    const err = new Error('Rol ciudadano no encontrado');
    err.status = 500;
    throw err;
  }

  const hash = await bcrypt.hash(contrasena, 10);
  return createUser({ nombre, apellido, correo, contrasena: hash, telefono, rol_id: rol.id });
};

const login = async ({ correo, contrasena }) => {
  const user = await findUserByEmail(correo);
  if (!user) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  if (!user.activo) {
    const err = new Error('Usuario inactivo');
    err.status = 403;
    throw err;
  }

  const valid = await bcrypt.compare(contrasena, user.contrasena);
  if (!valid) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { id: user.id, rol: user.rol_nombre },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: { id: user.id, nombre: user.nombre, apellido: user.apellido, correo: user.correo, rol: user.rol_nombre },
  };
};

module.exports = { register, login };
