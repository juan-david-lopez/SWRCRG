'use strict';

// Uso: authorize('administrador') o authorize('administrador', 'ciudadano')
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.rol)) {
    return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso' });
  }
  next();
};

module.exports = authorize;
