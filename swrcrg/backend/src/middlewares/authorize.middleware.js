'use strict';

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso' });
  }
  next();
};

module.exports = authorize;
