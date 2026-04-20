'use strict';

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Envía el código de verificación al correo indicado.
 */
const enviarCodigoVerificacion = async (correo, codigo) => {
  await sgMail.send({
    to: correo,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: process.env.SENDGRID_FROM_NAME || 'SWRCRG',
    },
    subject: 'Tu código de verificación',
    text: `Tu código de verificación es: ${codigo}\n\nExpira en 10 minutos.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#1d4ed8;margin-bottom:8px">Código de verificación</h2>
        <p style="color:#374151">Usa el siguiente código para completar tu registro:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#111827;text-align:center;padding:16px 0">
          ${codigo}
        </div>
        <p style="color:#6b7280;font-size:13px">Este código expira en <strong>10 minutos</strong>. Si no solicitaste esto, ignora este mensaje.</p>
      </div>
    `,
  });
};

module.exports = { enviarCodigoVerificacion };
