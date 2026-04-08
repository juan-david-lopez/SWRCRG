'use strict';

const { Router } = require('express');
const { registerUser, loginUser } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

const router = Router();

// Registro público — siempre asigna rol ciudadano
router.post('/register', registerUser);

// Registro por admin — puede especificar rol en el body
router.post('/register/admin', authMiddleware, authorize('administrador'), registerUser);

router.post('/login', loginUser);

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
