// Crea (o vuelve a crear desde cero) la base de datos con sus tablas y datos de ejemplo.
//
//   npm run bd
//
// OJO: borra la base si ya existía. Úsalo al empezar o cuando quieras datos limpios.
// Se hace desde Node (y no con el cliente mysql) para que los acentos queden bien en Windows.
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function crearBaseDeDatos(nombre = process.env.DB_NAME || 'cafeteria') {
  if (!/^[a-z0-9_]+$/i.test(nombre)) throw new Error(`Nombre de base inválido: ${nombre}`);
  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    charset: 'utf8mb4',
  });
  try {
    // Usa el MISMO archivo que se importa en Workbench. Se quitan sus líneas DROP/CREATE/USE
    // para poder crear la base con otro nombre (las pruebas usan "cafeteria_pruebas").
    const esquema = fs
      .readFileSync(path.join(__dirname, 'cafeteria.sql'), 'utf8')
      .replace(/^\s*(DROP DATABASE|CREATE DATABASE|USE)\b[^;]*;\s*$/gim, '');
    await conexion.query(`DROP DATABASE IF EXISTS \`${nombre}\``);
    await conexion.query(`CREATE DATABASE \`${nombre}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conexion.query(`USE \`${nombre}\``);
    await conexion.query(esquema);
  } finally {
    await conexion.end();
  }
  return nombre;
}

module.exports = { crearBaseDeDatos };

// Si se corre directo (npm run bd) y no desde las pruebas:
if (require.main === module) {
  crearBaseDeDatos()
    .then((nombre) => console.log(`Base de datos "${nombre}" creada con datos de ejemplo.`))
    .catch((error) => {
      console.error('No se pudo crear la base de datos:', error.message);
      console.error('Revisa que MySQL esté encendido y los datos de tu archivo .env');
      process.exit(1);
    });
}
