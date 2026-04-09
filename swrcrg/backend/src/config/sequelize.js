'use strict';

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME     || 'swrcrg_db',
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 5433,
    dialect:  'postgres',
    logging:  false,
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || 'swrcrg_test',
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT) || 5433,
    dialect:  'postgres',
    logging:  false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT) || 5432,
    dialect:  'postgres',
    logging:  false,
  },
};
