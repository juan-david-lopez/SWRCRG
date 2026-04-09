'use strict';

const { Router } = require('express');
const ctrl       = require('../controllers/notificacion.controller');
const auth       = require('../middlewares/auth.middleware');

const router = Router();

router.get('/',              auth, ctrl.listar);
router.patch('/:id/leer',   auth, ctrl.marcarLeida);
router.patch('/leer-todas', auth, ctrl.marcarTodasLeidas);

module.exports = router;
