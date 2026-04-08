'use strict';

const pool = require('../../src/config/db');

const cleanUsers = async () => {
  // Elimina usuarios de prueba (los que usan dominio @test.com)
  await pool.query("DELETE FROM users WHERE correo LIKE '%@test.com'");
};

const closePool = async () => {
  await pool.end();
};

module.exports = { cleanUsers, closePool };
