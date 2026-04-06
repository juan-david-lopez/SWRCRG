'use strict';

const { Router } = require('express');
const { registerUser, loginUser } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Ruta protegida: cualquier usuario autenticado
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Ruta protegida: solo admin
router.get('/admin-test', authMiddleware, authorize('admin'), (req, res) => {
  res.json({ message: 'Acceso admin confirmado', user: req.user });
});

// Ruta protegida: admin y citizen
router.get('/user-test', authMiddleware, authorize('admin', 'citizen'), (req, res) => {
  res.json({ message: 'Acceso de usuario confirmado', user: req.user });
});

module.exports = router;
