'use strict';

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_inseguro',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5433,
    database: process.env.DB_NAME || 'swrcrg_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2304',
  },
};
