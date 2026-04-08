'use strict';

const { register, login } = require('../services/auth.service');

const registerUser = async (req, res) => {
  const { nombre, apellido, correo, contrasena, telefono, rol } = req.body;

  if (!nombre || !apellido || !correo || !contrasena) {
    return res.status(400).json({ error: 'nombre, apellido, correo y contrasena son obligatorios' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).json({ error: 'Formato de correo inválido' });
  }

  if (contrasena.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  // req.user existe solo si el middleware de auth se ejecutó (ruta protegida)
  const callerRol = req.user?.rol;

  try {
    const user = await register({ nombre, apellido, correo, contrasena, telefono, rol }, callerRol);
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
    const result = await login({ correo, contrasena });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser };
