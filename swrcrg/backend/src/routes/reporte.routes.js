'use strict';

const { Router }   = require('express');
const { body, param } = require('express-validator');
const ctrl         = require('../controllers/reporte.controller');
const comentCtrl   = require('../controllers/comentario.controller');
const auth         = require('../middlewares/auth.middleware');
const authorize    = require('../middlewares/authorize.middleware');
const upload       = require('../config/upload');

const router = Router();

const validarReporte = [
  body('titulo').notEmpty().withMessage('titulo es obligatorio'),
  body('descripcion').notEmpty().withMessage('descripcion es obligatoria'),
  body('latitud').isFloat({ min: -90, max: 90 }).withMessage('latitud inválida'),
  body('longitud').isFloat({ min: -180, max: 180 }).withMessage('longitud inválida'),
  body('categoria_id').isUUID().withMessage('categoria_id debe ser UUID válido'),
];

const validarEstado = [
  body('estado').notEmpty().withMessage('estado es obligatorio'),
];

const validarComentario = [
  body('comentario').notEmpty().withMessage('comentario es obligatorio'),
];

// Públicas
router.get('/',                    ctrl.listar);
router.get('/categoria/:categoriaId', ctrl.listarPorCategoria);
router.get('/:id',                 ctrl.obtener);
router.get('/:id/historial',       comentCtrl.historial);
router.get('/:id/comentarios',     comentCtrl.listar);

// Ciudadano / Admin autenticado
router.post('/',                   auth, authorize('ciudadano', 'administrador'), upload.single('image'), validarReporte, ctrl.crear);
router.get('/me/reportes',         auth, authorize('ciudadano', 'administrador'), ctrl.misReportes);
router.post('/:id/imagenes',       auth, authorize('ciudadano', 'administrador'), upload.single('image'), ctrl.subirImagen);

// Solo admin
router.put('/:id/estado',          auth, authorize('administrador'), validarEstado, ctrl.cambiarEstado);
router.delete('/:id/imagenes/:imageId', auth, authorize('administrador'), ctrl.eliminarImagen);
router.post('/:id/comentarios',    auth, authorize('administrador'), validarComentario, comentCtrl.agregar);
router.delete('/:id/comentarios/:comentarioId', auth, authorize('administrador'), comentCtrl.eliminar);

module.exports = router;
