'use strict';

const { Router }         = require('express');
const { CategoriaReporte } = require('../models');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const categorias = await CategoriaReporte.findAll({ order: [['nombre', 'ASC']] });
    res.json({ categorias });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
