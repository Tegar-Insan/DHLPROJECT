const mysql = require('mysql2/promise');

// Laragon defaults: 127.0.0.1:3306, root, empty password
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dhl_incident',
  timezone: 'Z', // DATETIME columns hold UTC
  connectionLimit: 10
});

// MySQL returns JSON columns parsed; MariaDB (also bundled with Laragon) returns text.
const parseData = (value) => (typeof value === 'string' ? JSON.parse(value) : value);
const toIncident = (row) => parseData(row.data);

const toRow = (i) => [
  i.id, i.trackingNumber, i.status, i.priority, i.category,
  i.assignedTo || null, new Date(i.createdAt), JSON.stringify(i)
];

// ---- users
const getUserByUsername = async (username) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0];
};

// ---- incidents
const getIncidents = async () => {
  const [rows] = await pool.query('SELECT data FROM incidents ORDER BY created_at, id');
  return rows.map(toIncident);
};

const getIncidentById = async (id) => {
  const [rows] = await pool.query('SELECT data FROM incidents WHERE id = ?', [id]);
  return rows[0] ? toIncident(rows[0]) : undefined;
};

// Insert, or overwrite when the id already exists
const saveIncident = async (incident) => {
  await pool.query(
    `INSERT INTO incidents (id, tracking_number, status, priority, category, assigned_to, created_at, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE tracking_number = VALUES(tracking_number), status = VALUES(status),
       priority = VALUES(priority), category = VALUES(category), assigned_to = VALUES(assigned_to),
       created_at = VALUES(created_at), data = VALUES(data)`,
    toRow(incident)
  );
  return incident;
};

const updateIncident = async (id, updates) => {
  const existing = await getIncidentById(id);
  if (!existing) return null;
  return saveIncident({ ...existing, ...updates, id, updatedAt: new Date().toISOString() });
};

const deleteIncident = async (id) => {
  const [result] = await pool.query('DELETE FROM incidents WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// Next INC-### from the highest existing number (length + 1 collides after a delete)
const nextIncidentId = (incidents) => {
  const max = incidents.reduce((m, i) => {
    const n = parseInt(String(i.id || '').replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `INC-${String(max + 1).padStart(3, '0')}`;
};

module.exports = {
  pool,
  getUserByUsername,
  getIncidents,
  getIncidentById,
  saveIncident,
  updateIncident,
  deleteIncident,
  nextIncidentId
};
