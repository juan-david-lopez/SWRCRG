'use strict';

const { Router } = require('express');
const { Rol }    = require('../models');
const auth       = require('../middlewares/auth.middleware');
const authorize  = require('../middlewares/authorize.middleware');

const router = Router();

router.get('/', auth, authorize('administrador'), async (req, res) => {
  try {
    const roles = await Rol.findAll({ order: [['fecha_creacion', 'ASC']] });
    res.json({ roles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
