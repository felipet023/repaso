// Aplica sql/bike-store.sql usando una conexión con múltiples sentencias.
// Uso: node scripts/apply-sql.js
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });
  const sql = fs.readFileSync(path.join(__dirname, '..', '..', 'sql', 'bike-store.sql'), 'utf8');
  // query() permite múltiples sentencias; execute() usa prepared statements (una sola)
  await conn.query(sql);
  console.log('Esquema bike-store.sql aplicado correctamente');
  const [tablas] = await conn.execute('SHOW TABLES FROM bike_store');
  console.log('Tablas:', tablas.map((t) => Object.values(t)[0]).join(', '));
  await conn.end();
}

main().catch((error) => {
  console.error('Error aplicando el esquema:', error.message);
  process.exit(1);
});
