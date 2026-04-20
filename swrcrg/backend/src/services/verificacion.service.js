'use strict';

const { CodigoVerificacion, Usuario } = require('../models');
const { Op } = require('sequelize');

/**
 * Genera un código de 6 dígitos, lo guarda en BD y lo devuelve.
 * En producción aquí se enviaría el email; por ahora se retorna en la respuesta.
 */
const enviarCodigo = async (correo) => {
  const correoNorm = correo.trim().toLowerCase();

  // Verificar que el correo no esté ya registrado
  const existing = await Usuario.findOne({ where: { correo: correoNorm } });
  if (existing) throw Object.assign(new Error('El correo ya está registrado'), { status: 409 });

  // Invalidar códigos anteriores para este correo
  await CodigoVerificacion.update(
    { usado: true },
    { where: { correo: correoNorm, usado: false } }
  );

  const codigo = String(Math.floor(100000 + Math.random() * 900000));
  const expira_en = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  await CodigoVerificacion.create({ correo: correoNorm, codigo, expira_en });

  // TODO: en producción enviar email aquí
  // await emailService.send({ to: correoNorm, subject: 'Tu código de verificación', text: `Tu código es: ${codigo}` });

  return { codigo }; // solo para desarrollo
};

/**
 * Verifica que el código sea válido, no expirado y no usado.
 * Si es válido lo marca como usado.
 */
const verificarCodigo = async (correo, codigo) => {
  const correoNorm = correo.trim().toLowerCase();

  const registro = await CodigoVerificacion.findOne({
    where: {
      correo:    correoNorm,
      codigo,
      usado:     false,
      expira_en: { [Op.gt]: new Date() },
    },
    order: [['createdAt', 'DESC']],
  });

  if (!registro) throw Object.assign(new Error('Código inválido o expirado'), { status: 400 });

  await registro.update({ usado: true });
  return true;
};

module.exports = { enviarCodigo, verificarCodigo };
