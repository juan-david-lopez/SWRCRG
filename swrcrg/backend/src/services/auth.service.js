'use strict';

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { Usuario, Rol } = require('../models');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

const register = async ({ nombre, apellido, correo, contrasena, telefono, rol: rolSolicitado }, callerRol) => {
  const existing = await Usuario.findOne({ where: { correo } });
  if (existing) throw Object.assign(new Error('El correo ya está registrado'), { status: 409 });

  if (rolSolicitado === 'administrador' && callerRol !== 'administrador') {
    throw Object.assign(new Error('Solo un administrador puede crear otro administrador'), { status: 403 });
  }

  const rolNombre = (callerRol === 'administrador' && rolSolicitado) ? rolSolicitado : 'ciudadano';
  const rol = await Rol.findOne({ where: { nombre: rolNombre } });
  if (!rol) throw Object.assign(new Error(`Rol '${rolNombre}' no encontrado`), { status: 500 });

  const hash = await bcrypt.hash(contrasena, 10);
  const user = await Usuario.create({ nombre, apellido, correo, contrasena: hash, telefono, rol_id: rol.id });

  const { contrasena: _, ...safe } = user.toJSON();
  return safe;
};

const login = async ({ correo, contrasena }) => {
  const user = await Usuario.findOne({ where: { correo }, include: [{ model: Rol, as: 'rol' }] });
  if (!user) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  if (!user.activo) throw Object.assign(new Error('Usuario inactivo'), { status: 403 });

  const valid = await bcrypt.compare(contrasena, user.contrasena);
  if (!valid) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });

  const token = jwt.sign(
    { id: user.id, rol: user.rol.nombre },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: { id: user.id, nombre: user.nombre, apellido: user.apellido, correo: user.correo, rol: user.rol.nombre },
  };
};

module.exports = { register, login };
