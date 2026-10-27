require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const incidentsRoutes = require('./routes/incidents');
const processRoutes = require('./routes/process');
const reportsRoutes = require('./routes/reports');
const rpaRoutes = require('./routes/rpa');                 // with the other route imports

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));                   // replaces app.use(express.json());// RPA bundles carry full email/chat text

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/process', processRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/rpa', rpaRoutes);   // UiPath bot (X-Api-Key auth)

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`✓ DHL Incident Management Backend running on http://localhost:${PORT}`);
});
