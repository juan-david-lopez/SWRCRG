'use strict';

const { Router } = require('express');
const { listRoles } = require('../controllers/role.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize      = require('../middlewares/authorize.middleware');

const router = Router();

router.get('/', authMiddleware, authorize('administrador'), listRoles);

module.exports = router;
