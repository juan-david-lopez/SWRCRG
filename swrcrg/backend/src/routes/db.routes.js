'use strict';

const { Router }    = require('express');
const { sequelize } = require('../models');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [result] = await sequelize.query('SELECT NOW() AS time');
    res.json({ status: 'ok', db_time: result[0].time });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
