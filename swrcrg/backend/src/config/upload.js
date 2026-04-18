'use strict';

const multer = require('multer');
const path   = require('path');

const ALLOWED_TYPES = /jpeg|jpg|png|webp/;
const MAX_SIZE_MB   = 5;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});

const fileFilter = (req, file, cb) => {
  const extOk  = ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = ALLOWED_TYPES.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(Object.assign(new Error('Solo se permiten imágenes JPEG, PNG o WebP'), { status: 400 }));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

// Middleware wrapper que convierte errores de multer en respuestas JSON
const uploadWithErrorHandling = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ error: `La imagen no puede superar ${MAX_SIZE_MB} MB` });
    return res.status(400).json({ error: err.message || 'Error al subir archivo' });
  });
};

module.exports = upload;
module.exports.withErrorHandling = uploadWithErrorHandling;
