'use strict';

const bcrypt = require('bcryptjs');
const { createUser, findUserByEmail } = require('../models/user.model');

const register = async ({ name, email, password }) => {
  // Verificar si el email ya está en uso
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error('El email ya está registrado');
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, password: hashedPassword });
  return user;
};

module.exports = { register };
