'use strict';

const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

module.exports = router;
