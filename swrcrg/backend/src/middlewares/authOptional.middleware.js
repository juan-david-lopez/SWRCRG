'use strict';

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

// Igual que authMiddleware pero no falla si no hay token — solo adjunta req.user si lo hay
const authOptional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // token inválido o expirado — se ignora, req.user queda undefined
    }
  }
  next();
};

module.exports = authOptional;
