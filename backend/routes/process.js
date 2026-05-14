const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// LLM classification endpoint
// This endpoint receives raw incident text and uses Claude API to classify it
router.post('/classify', authMiddleware, async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text input required' });
  }

  try {
    // Note: Claude API call would go here
    // For now, we'll return a mock classification
    const classification = {
      title: 'Classified Incident',
      description: text,
      priority: 'MEDIUM',
      category: 'General',
      classified_by: 'claude-api',
      confidence: 0.85,
      suggestions: []
    };

    res.json(classification);
  } catch (err) {
    res.status(500).json({ error: 'Classification failed', message: err.message });
  }
});

module.exports = router;
