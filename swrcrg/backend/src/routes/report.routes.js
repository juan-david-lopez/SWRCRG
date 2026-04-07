'use strict';

const { Router } = require('express');
const {
  createReport, listReports, getReport, listMyReports,
  changeStatus, uploadImage, deleteImage, listStatuses,
} = require('../controllers/report.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize      = require('../middlewares/authorize.middleware');
const upload         = require('../config/upload');

const router = Router();

// Públicas
router.get('/',         listReports);
router.get('/statuses', listStatuses);
router.get('/:id',      getReport);

// Ciudadano autenticado
router.post('/',           authMiddleware, authorize('ciudadano', 'administrador'), upload.single('image'), createReport);
router.get('/me/reports',  authMiddleware, authorize('ciudadano', 'administrador'), listMyReports);

// Imágenes
router.post('/:id/images',        authMiddleware, authorize('ciudadano', 'administrador'), upload.single('image'), uploadImage);
router.delete('/:id/images/:imageId', authMiddleware, authorize('administrador'), deleteImage);

// Solo admin
router.put('/:id/status', authMiddleware, authorize('administrador'), changeStatus);

module.exports = router;
