// Creates the database + tables (schema.sql) and imports data/*.json into empty tables.
// Usage: npm run db:setup   (Laragon MySQL must be running)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const readJSON = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, '../data', name), 'utf-8'));

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  let schema = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf-8');
  const dbName = process.env.DB_NAME || 'dhl_incident';
  schema = schema.replace(/dhl_incident/g, dbName);
  await conn.query(schema);
  console.log(`✓ Schema ready in database "${dbName}"`);

  const [[{ n: userCount }]] = await conn.query('SELECT COUNT(*) AS n FROM users');
  if (userCount === 0) {
    const users = readJSON('users.json');
    for (const u of users) {
      await conn.query(
        'INSERT INTO users (id, username, password, role, name, email) VALUES (?, ?, ?, ?, ?, ?)',
        [u.id, u.username, u.password, u.role, u.name, u.email]
      );
    }
    console.log(`✓ Imported ${users.length} users`);
  }

  const { saveIncident, pool } = require('../utils/db');
  const [[{ n: incidentCount }]] = await conn.query('SELECT COUNT(*) AS n FROM incidents');
  if (incidentCount === 0) {
    const seen = new Set();
    let max = 0;
    const incidents = readJSON('incidents.json');
    incidents.forEach((i) => { max = Math.max(max, parseInt(i.id.replace(/\D/g, ''), 10) || 0); });
    for (const i of incidents) {
      // incidents.json contains a duplicated id (INC-003); give later copies a fresh one
      if (seen.has(i.id)) {
        const newId = `INC-${String(++max).padStart(3, '0')}`;
        console.log(`! Duplicate id ${i.id} (${i.trackingNumber}) renumbered to ${newId}`);
        i.id = newId;
      }
      seen.add(i.id);
      await saveIncident(i);
    }
    console.log(`✓ Imported ${incidents.length} incidents`);
  }

  await conn.end();
  await pool.end();
})().catch((err) => {
  console.error('✗ Setup failed:', err.message);
  process.exit(1);
});
