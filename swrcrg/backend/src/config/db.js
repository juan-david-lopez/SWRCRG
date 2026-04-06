'use strict';

const { Pool } = require('pg');
const { DB } = require('./env');

const pool = new Pool(DB);

// Prueba de conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error al conectar con PostgreSQL:', err.message);
    return;
  }
  console.log('Conexión a PostgreSQL establecida');
  release();
});

module.exports = pool;
