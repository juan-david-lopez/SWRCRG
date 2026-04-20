'use strict';

// Este archivo se ejecuta antes de cada suite de tests.
// Fuerza NODE_ENV=test para que el rate limiter use skip=true.
process.env.NODE_ENV = 'test';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
