const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  getIncidents,
  getIncidentById,
  saveIncident,
  updateIncident,
  deleteIncident,
  nextIncidentId
} = require('../utils/db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Get all incidents (with optional filters)
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { status, priority, assignedTo, category } = req.query;
  let incidents = await getIncidents();

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
}));

// Get stats for dashboard
router.get('/stats', authMiddleware, asyncHandler(async (req, res) => {
  const incidents = await getIncidents();

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
}));

// Get single incident
router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const incident = await getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(incident);
}));

// Check if a hash was already processed in the last 14 days (RPA dedup)
router.get('/check-duplicate/:hash', authMiddleware, asyncHandler(async (req, res) => {
  const { hash } = req.params;
  const incidents = await getIncidents();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const match = incidents.find(i =>
    i.aiMetadata?.hash === hash && new Date(i.createdAt) >= fourteenDaysAgo
  );

  res.json({ isDuplicate: !!match, existingIncidentId: match ? match.id : null });
}));

// Create incident
router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const {
    trackingNumber, title, description, priority, category,
    department, confidenceLevel, classificationReason, requiresHitl,
    source, hash, attachments
  } = req.body;

  if (!trackingNumber || !title || !description || !priority || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newId = nextIncidentId(await getIncidents());

  const newIncident = {
    id: newId,
    trackingNumber,
    title,
    description,
    priority,
    category,
    department: department || null,
    status: requiresHitl ? 'pending_review' : 'open',
    assignedTo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolvedAt: null,
    notes: [],
    attachments: attachments || [],
    aiMetadata: {
      confidenceLevel: confidenceLevel != null ? confidenceLevel : null,
      classificationReason: classificationReason || null,
      requiresHitl: requiresHitl || false,
      source: source || 'manual',
      hash: hash || null
    }
  };

  await saveIncident(newIncident);
  res.status(201).json(newIncident);
}));

// Update incident
router.put('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const incident = await updateIncident(req.params.id, req.body);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(incident);
}));

// Update incident status only
router.patch('/:id/status', authMiddleware, asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const updates = { status };
  if (status === 'resolved') {
    updates.resolvedAt = new Date().toISOString();
  }

  const incident = await updateIncident(req.params.id, updates);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(incident);
}));

// Delete incident
router.delete('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const success = await deleteIncident(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json({ message: 'Incident deleted' });
}));

module.exports = router;