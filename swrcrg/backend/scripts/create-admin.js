'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Usuario, Rol } = require('../src/models');

(async () => {
  try {
    await sequelize.authenticate();

    const rol = await Rol.findOne({ where: { nombre: 'administrador' } });
    if (!rol) { console.error('❌ Rol administrador no encontrado. Corre el seeder primero.'); process.exit(1); }

    const existing = await Usuario.findOne({ where: { correo: 'admin@swrcrg.com' } });
    if (existing) { console.log('ℹ️  El admin ya existe. Credenciales: admin@swrcrg.com / Admin123'); process.exit(0); }

    const hash = await bcrypt.hash('Admin123', 10);
    await Usuario.create({
      nombre:   'Admin',
      apellido: 'SWRCRG',
      correo:   'admin@swrcrg.com',
      contrasena: hash,
      rol_id:   rol.id,
      activo:   true,
      onboarding_completado: true,
    });

    console.log('✅ Admin creado correctamente');
    console.log('   Correo:     admin@swrcrg.com');
    console.log('   Contraseña: Admin123');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sequelize.close();
  }
})();
