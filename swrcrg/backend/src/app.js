'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const healthRoutes       = require('./routes/health.routes');
const dbRoutes           = require('./routes/db.routes');
const authRoutes         = require('./routes/auth.routes');
const reporteRoutes      = require('./routes/reporte.routes');
const roleRoutes         = require('./routes/role.routes');
const notificacionRoutes = require('./routes/notificacion.routes');
const categoriaRoutes    = require('./routes/categoria.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/health',         healthRoutes);
app.use('/api/db-check',       dbRoutes);
app.use('/api/auth',           authRoutes);
app.use('/api/reportes',       reporteRoutes);
app.use('/api/roles',          roleRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/categorias',     categoriaRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

module.exports = app;
