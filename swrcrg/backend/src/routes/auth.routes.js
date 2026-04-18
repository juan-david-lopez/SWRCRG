'use strict';

const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { registerUser, loginUser } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

const router = Router();

const validarRegistro = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),

  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo puede contener letras'),

  body('correo')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('Formato de correo inválido')
    .toLowerCase(),

  body('contrasena')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/[A-Z]/).withMessage('La contraseña debe tener al menos una mayúscula')
    .matches(/[0-9]/).withMessage('La contraseña debe tener al menos un número'),

  body('telefono')
    .optional({ checkFalsy: true })
    .matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Formato de teléfono inválido'),
];

// Registro público — siempre asigna rol ciudadano
router.post('/register', validarRegistro, registerUser);

// Registro por admin — puede especificar rol en el body
router.post('/register/admin', authMiddleware, authorize('administrador'), registerUser);

router.post('/login', loginUser);

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

router.put('/me', authMiddleware, [
  body('nombre').optional().trim().isLength({ min: 2, max: 100 }).matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
  body('apellido').optional().trim().isLength({ min: 2, max: 100 }).matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
  body('telefono').optional({ checkFalsy: true }).matches(/^[0-9+\-\s()]{7,20}$/),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  try {
    const { nombre, apellido, telefono } = req.body;
    const { Usuario } = require('../models');
    const user = await Usuario.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    await user.update({
      ...(nombre   ? { nombre }   : {}),
      ...(apellido ? { apellido } : {}),
      ...(telefono !== undefined ? { telefono } : {}),
    });
    const { contrasena: _, ...safe } = user.toJSON();
    res.json({ user: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cambiar contraseña
router.put('/me/password', authMiddleware, [
  body('contrasenaActual').notEmpty().withMessage('La contraseña actual es obligatoria'),
  body('contrasenaNueva')
    .isLength({ min: 6 }).withMessage('Mínimo 6 caracteres')
    .matches(/[A-Z]/).withMessage('Debe tener al menos una mayúscula')
    .matches(/[0-9]/).withMessage('Debe tener al menos un número'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  try {
    const bcrypt = require('bcryptjs');
    const { Usuario } = require('../models');
    const { contrasenaActual, contrasenaNueva } = req.body;
    const user = await Usuario.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    const valid = await bcrypt.compare(contrasenaActual, user.contrasena);
    if (!valid) return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    const hash = await bcrypt.hash(contrasenaNueva, 10);
    await user.update({ contrasena: hash });
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: listar usuarios
router.get('/usuarios', authMiddleware, authorize('administrador'), async (req, res) => {
  try {
    const { Usuario, Rol } = require('../models');
    const usuarios = await Usuario.findAll({
      include: [{ model: Rol, as: 'rol', attributes: ['nombre'] }],
      attributes: { exclude: ['contrasena'] },
      order: [['fecha_creacion', 'DESC']],
    });
    res.json({ usuarios });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: activar/desactivar usuario
router.patch('/usuarios/:id/activo', authMiddleware, authorize('administrador'), async (req, res) => {
  try {
    const { Usuario } = require('../models');
    const user = await Usuario.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (user.id === req.user.id) return res.status(400).json({ error: 'No puedes desactivarte a ti mismo' });
    await user.update({ activo: !user.activo });
    const { contrasena: _, ...safe } = user.toJSON();
    res.json({ user: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: cambiar rol de usuario
router.patch('/usuarios/:id/rol', authMiddleware, authorize('administrador'), [
  body('rol').isIn(['ciudadano', 'administrador']).withMessage('Rol inválido'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  try {
    const { Usuario, Rol } = require('../models');
    const user = await Usuario.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (user.id === req.user.id) return res.status(400).json({ error: 'No puedes cambiar tu propio rol' });
    const rol = await Rol.findOne({ where: { nombre: req.body.rol } });
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });
    await user.update({ rol_id: rol.id });
    const { contrasena: _, ...safe } = user.toJSON();
    res.json({ user: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
