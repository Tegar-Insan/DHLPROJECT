const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getIncidents } = require('../utils/db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Get management summary report
router.get('/summary', authMiddleware, asyncHandler(async (req, res) => {
  const incidents = await getIncidents();

  const summary = {
    generatedAt: new Date().toISOString(),
    totalIncidents: incidents.length,
    incidentsTrend: {
      thisWeek: incidents.filter(i => {
        const date = new Date(i.createdAt);
        const weekAgo = new Date(new Date().setDate(new Date().getDate() - 7));
        return date >= weekAgo;
      }).length,
      lastWeek: incidents.filter(i => {
        const date = new Date(i.createdAt);
        const twoWeeksAgo = new Date(new Date().setDate(new Date().getDate() - 14));
        const weekAgo = new Date(new Date().setDate(new Date().getDate() - 7));
        return date >= twoWeeksAgo && date < weekAgo;
      }).length
    },
    statusDistribution: {
      open: incidents.filter(i => i.status === 'open').length,
      in_progress: incidents.filter(i => i.status === 'in_progress').length,
      resolved: incidents.filter(i => i.status === 'resolved').length
    },
    priorityDistribution: {
      HIGH: incidents.filter(i => i.priority === 'HIGH').length,
      MEDIUM: incidents.filter(i => i.priority === 'MEDIUM').length,
      LOW: incidents.filter(i => i.priority === 'LOW').length,
      ZERO: incidents.filter(i => i.priority === 'ZERO').length
    },
    categoryBreakdown: [...new Set(incidents.map(i => i.category))].map(cat => ({
      category: cat,
      count: incidents.filter(i => i.category === cat).length
    })),
    avgResolutionTime: calculateAvgResolutionTime(incidents)
  };

  res.json(summary);
}));

// Helper function to calculate average resolution time
const calculateAvgResolutionTime = (incidents) => {
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved' && i.resolvedAt);
  if (resolvedIncidents.length === 0) return 0;

  const totalTime = resolvedIncidents.reduce((sum, incident) => {
    const created = new Date(incident.createdAt);
    const resolved = new Date(incident.resolvedAt);
    return sum + (resolved - created);
  }, 0);

  const avgTimeMs = totalTime / resolvedIncidents.length;
  return Math.round(avgTimeMs / (1000 * 60 * 60)); // Convert to hours
};

module.exports = router;
