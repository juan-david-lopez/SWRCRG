'use strict';

const { validationResult } = require('express-validator');
const { register, login }  = require('../services/auth.service');
const { enviarCodigo }     = require('../services/verificacion.service');

const sendVerificationCode = async (req, res) => {
  const { correo } = req.body;
  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
    return res.status(400).json({ error: 'Correo inválido' });
  }
  try {
    const result = await enviarCodigo(correo);
    return res.status(200).json({
      message: 'Código enviado',
      // Solo en desarrollo se devuelve el código; en producción se enviaría por email
      ...(process.env.NODE_ENV !== 'production' && { codigo: result.codigo }),
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Devuelve solo el primer mensaje para que el frontend lo muestre limpio
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { nombre, apellido, correo, contrasena, telefono, rol } = req.body;
  const callerRol = req.user?.rol;

  try {
    const user = await register({ nombre, apellido, correo, contrasena, telefono, rol, codigo: req.body.codigo }, callerRol);
    return res.status(201).json({ user });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'correo y contrasena son obligatorios' });
  }

  try {
    const result = await login({ correo: correo.trim().toLowerCase(), contrasena });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser, sendVerificationCode };
