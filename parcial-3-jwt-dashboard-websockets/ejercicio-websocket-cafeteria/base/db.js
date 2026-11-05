// Conexión a MySQL. Todos los modelos usan este mismo "pool" de conexiones.
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cafeteria',
  charset: 'utf8mb4',
  dateStrings: true, // las fechas llegan como texto "2026-11-09 10:15:00"
  connectionLimit: 10,
});

module.exports = pool;
