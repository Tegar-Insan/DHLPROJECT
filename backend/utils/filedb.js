const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');
const incidentsPath = path.join(__dirname, '../data/incidents.json');

// Read JSON file
const readJSON = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading file:', filePath, err);
    return [];
  }
};

// Write JSON file
const writeJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing file:', filePath, err);
    return false;
  }
};

// Get all users
const getUsers = () => readJSON(usersPath);

// Get user by username
const getUserByUsername = (username) => {
  const users = getUsers();
  return users.find(u => u.username === username);
};

// Get all incidents
const getIncidents = () => readJSON(incidentsPath);

// Save incidents
const saveIncidents = (incidents) => writeJSON(incidentsPath, incidents);

// Get incident by ID
const getIncidentById = (id) => {
  const incidents = getIncidents();
  return incidents.find(i => i.id === id);
};

// Create new incident
const createIncident = (incident) => {
  const incidents = getIncidents();
  incidents.push(incident);
  saveIncidents(incidents);
  return incident;
};

// Update incident
const updateIncident = (id, updates) => {
  const incidents = getIncidents();
  const index = incidents.findIndex(i => i.id === id);
  if (index !== -1) {
    incidents[index] = { ...incidents[index], ...updates, updatedAt: new Date().toISOString() };
    saveIncidents(incidents);
    return incidents[index];
  }
  return null;
};

// Delete incident
const deleteIncident = (id) => {
  const incidents = getIncidents();
  const filtered = incidents.filter(i => i.id !== id);
  if (filtered.length < incidents.length) {
    saveIncidents(filtered);
    return true;
  }
  return false;
};

module.exports = {
  getUsers,
  getUserByUsername,
  getIncidents,
  saveIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident
};
