const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident
} = require('../utils/filedb');

const router = express.Router();

// Get all incidents (with optional filters)
router.get('/', authMiddleware, (req, res) => {
  const { status, priority, assignedTo, category } = req.query;
  let incidents = getIncidents();

  // Apply filters
  if (status) {
    incidents = incidents.filter(i => i.status === status);
  }
  if (priority) {
    incidents = incidents.filter(i => i.priority === priority);
  }
  if (assignedTo) {
    incidents = incidents.filter(i => i.assignedTo === assignedTo);
  }
  if (category) {
    incidents = incidents.filter(i => i.category === category);
  }

  res.json(incidents);
});

// Get stats for dashboard
router.get('/stats', authMiddleware, (req, res) => {
  const incidents = getIncidents();

  const stats = {
    totalIncidents: incidents.length,
    openIncidents: incidents.filter(i => i.status === 'open').length,
    inProgressIncidents: incidents.filter(i => i.status === 'in_progress').length,
    resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
    highPriorityIncidents: incidents.filter(i => i.priority === 'HIGH').length,
    recentIncidents: incidents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    priorityCounts: {
      HIGH: incidents.filter(i => i.priority === 'HIGH').length,
      MEDIUM: incidents.filter(i => i.priority === 'MEDIUM').length,
      LOW: incidents.filter(i => i.priority === 'LOW').length,
      ZERO: incidents.filter(i => i.priority === 'ZERO').length
    },
    categoryBreakdown: [...new Set(incidents.map(i => i.category))].map(cat => ({
      category: cat,
      count: incidents.filter(i => i.category === cat).length
    }))
  };

  res.json(stats);
});

// Get single incident
router.get('/:id', authMiddleware, (req, res) => {
  const incident = getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(incident);
});

// Create incident
router.post('/', authMiddleware, (req, res) => {
  const { trackingNumber, title, description, priority, category } = req.body;

  if (!trackingNumber || !title || !description || !priority || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const incidents = getIncidents();
  const newId = `INC-${String(incidents.length + 1).padStart(3, '0')}`;

  const newIncident = {
    id: newId,
    trackingNumber,
    title,
    description,
    priority,
    category,
    status: 'open',
    assignedTo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolvedAt: null,
    notes: [],
    attachments: []
  };

  createIncident(newIncident);
  res.status(201).json(newIncident);
});

// Update incident
router.put('/:id', authMiddleware, (req, res) => {
  const incident = updateIncident(req.params.id, req.body);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(incident);
});

// Update incident status only
router.patch('/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const updates = { status };
  if (status === 'resolved') {
    updates.resolvedAt = new Date().toISOString();
  }

  const incident = updateIncident(req.params.id, updates);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(incident);
});

// Delete incident
router.delete('/:id', authMiddleware, (req, res) => {
  const success = deleteIncident(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json({ message: 'Incident deleted' });
});

module.exports = router;
