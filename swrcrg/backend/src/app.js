'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const healthRoutes = require('./routes/health.routes');
const dbRoutes     = require('./routes/db.routes');
const authRoutes   = require('./routes/auth.routes');
const reportRoutes = require('./routes/report.routes');
const roleRoutes   = require('./routes/role.routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/health',   healthRoutes);
app.use('/api/db-check', dbRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/reports',  reportRoutes);
app.use('/api/roles',    roleRoutes);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;
