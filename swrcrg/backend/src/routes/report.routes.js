'use strict';

const { Router } = require('express');
const { createReport, listReports, getReport, changeStatus } = require('../controllers/report.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

const router = Router();

router.get('/', listReports);
router.get('/:id', getReport);
router.post('/', authMiddleware, createReport);
router.put('/:id/status', authMiddleware, authorize('admin'), changeStatus);

module.exports = router;
