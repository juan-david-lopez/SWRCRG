'use strict';

const { Router } = require('express');
const { registerUser, loginUser } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
