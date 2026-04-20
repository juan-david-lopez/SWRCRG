'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const rateLimit = require('express-rate-limit');

const healthRoutes       = require('./routes/health.routes');
const dbRoutes           = require('./routes/db.routes');
const authRoutes         = require('./routes/auth.routes');
const reporteRoutes      = require('./routes/reporte.routes');
const roleRoutes         = require('./routes/role.routes');
const notificacionRoutes = require('./routes/notificacion.routes');
const categoriaRoutes    = require('./routes/categoria.routes');

const app = express();

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta más tarde' },
  skip: () => process.env.NODE_ENV === 'test',
});

// Rate limiting estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos de autenticación, intenta en 15 minutos' },
  skip: () => process.env.NODE_ENV === 'test',
});

app.use(cors());
app.use(express.json());
app.use(globalLimiter);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/health',         healthRoutes);
app.use('/api/db-check',       dbRoutes);
app.use('/api/auth',           authLimiter, authRoutes);
app.use('/api/reportes',       reporteRoutes);
app.use('/api/roles',          roleRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/categorias',     categoriaRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

module.exports = app;
