// RPA integration endpoints used by the UiPath bot (DHL_RPA_Scenario2/Main.xaml).
// Storage: MySQL (Laragon) through the async data layer (getIncidents / saveIncident / nextIncidentId).
// The bot authenticates with the X-Api-Key header (machine-to-machine), not with a user JWT.
//
//   GET   /api/rpa/health          -> connectivity check (also pings MySQL)
//   POST  /api/rpa/import-bundle   -> create an incident (or merge into an open one with the same tracking number)
//   PATCH /api/rpa/status          -> move an incident along the workflow and log a note
//
const express = require('express');

// Use the MySQL data layer. Change this path if your file has a different name.
const db = require('../utils/db');

const router = express.Router();

const RPA_API_KEY = process.env.RPA_API_KEY || 'dhl-rpa-dev-key';

// ---------------------------------------------------------------- auth
const rpaAuth = (req, res, next) => {
  if (req.get('X-Api-Key') !== RPA_API_KEY) {
    return res.status(401).json({ ok: false, message: 'Invalid API key.' });
  }
  next();
};

// Express 4 does not catch rejected promises: send a JSON 500 the bot can log
const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error('RPA route error:', err);
    res.status(500).json({ ok: false, message: `Server error: ${err.message}` });
  });

// ---------------------------------------------------------------- mapping helpers
// AI category (bot) -> category list used by the frontend
const CATEGORY_MAP = {
  'late delivery': 'Delivery',
  'lost parcel': 'Delivery',
  'damaged parcel': 'Damage',
  'address issue': 'Address',
  billing: 'Payment',
  'system issue': 'Other',
  'customer complaint': 'Other',
  general: 'Other'
};
const FRONTEND_CATEGORIES = ['Damage', 'Delivery', 'Payment', 'Address', 'Documentation', 'Other'];

const PRIORITY_MAP = { critical: 'HIGH', high: 'HIGH', medium: 'MEDIUM', low: 'LOW' };
const PRIORITY_RANK = { ZERO: 0, LOW: 1, MEDIUM: 2, HIGH: 3 };

// Bot / .NET-style status names -> frontend statuses
const STATUS_MAP = {
  new: 'open',
  open: 'open',
  triaged: 'open',
  assigned: 'open',
  inprogress: 'in_progress',
  in_progress: 'in_progress',
  resolved: 'resolved',
  closed: 'resolved'
};

const mapCategory = (value) => {
  if (!value) return null;
  const v = String(value).trim();
  if (FRONTEND_CATEGORIES.includes(v)) return v;
  return CATEGORY_MAP[v.toLowerCase()] || null;
};

const mapPriority = (value) => PRIORITY_MAP[String(value || '').trim().toLowerCase()] || null;

// Keyword fallback when the bot could not reach OpenAI
const ruleBasedTriage = (text) => {
  const t = text.toLowerCase();
  let category = 'Other';
  let priority = 'MEDIUM';
  if (/\b(damage|damaged|broken|crushed|dent|leak)/.test(t)) { category = 'Damage'; priority = 'HIGH'; }
  else if (/\b(lost|missing)\b/.test(t)) { category = 'Delivery'; priority = 'HIGH'; }
  else if (/\b(late|delay|delayed)\b/.test(t)) { category = 'Delivery'; priority = 'HIGH'; }
  else if (/\b(address)\b/.test(t)) { category = 'Address'; }
  else if (/\b(refund|invoice|payment|overcharge|cod)\b/.test(t)) { category = 'Payment'; }
  if (/\b(urgent|vip|immediately|social media|lawyer)\b/.test(t)) priority = 'HIGH';
  return { category, priority };
};

const tokens = (text) => new Set(
  String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2)
);
const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  a.forEach((w) => { if (b.has(w)) inter += 1; });
  return inter / (a.size + b.size - inter);
};

const cut = (value, max) => (value == null ? null : String(value).slice(0, max));

const buildAiNote = (ai) => {
  if (!ai || !ai.used) return 'AI extraction unavailable for this import - classified by backend keyword rules.';
  const lines = [
    `AI triage (${ai.provider || 'LLM'} ${ai.model || ''}, confidence ${Number(ai.confidence || 0).toFixed(2)})`,
    ai.keyProblem ? `Key problem: ${ai.keyProblem}` : null,
    `Category: ${ai.category} | Department: ${ai.department} | Priority: ${ai.priority}`,
    ai.priorityReason ? `Why: ${ai.priorityReason}` : null,
    ai.recommendedActions && ai.recommendedActions.length ? `Next steps: ${ai.recommendedActions.join('; ')}` : null,
    ai.missingInformation && ai.missingInformation.length ? `Missing info: ${ai.missingInformation.join('; ')}` : null
  ];
  return lines.filter(Boolean).join('\n');
};

// ---------------------------------------------------------------- routes
router.get('/health', asyncRoute(async (req, res) => {
  let database = 'ok';
  try {
    await db.pool.query('SELECT 1');
  } catch (err) {
    database = `error: ${err.message}`;
  }
  res.json({ ok: database === 'ok', name: 'DHL Incident Management API (RPA)', database, time: new Date().toISOString() });
}));

router.post('/import-bundle', rpaAuth, asyncRoute(async (req, res) => {
  const body = req.body || {};
  const sources = Array.isArray(body.sources) ? body.sources.filter((s) => s && s.body) : [];
  if (sources.length === 0) {
    return res.status(400).json({ ok: false, message: 'At least one source with a body is required.' });
  }

  const ai = body.ai && typeof body.ai === 'object' ? body.ai : null;
  const allText = sources.map((s) => s.body).join('\n\n');
  const trackingNumber = cut((body.shipmentId || '').trim().toUpperCase(), 40) || 'UNKNOWN';
  const now = new Date().toISOString();

  // Classification: AI first, keyword rules as fallback
  const fallback = ruleBasedTriage(allText);
  const category = (ai && ai.used && mapCategory(ai.category)) || fallback.category;
  const priority = (ai && ai.used && mapPriority(ai.priority)) || fallback.priority;
  const description = cut((ai && ai.used && ai.cleanSummary) || sources[0].body, 2000);
  const channels = [...new Set(sources.map((s) => s.channel || 'Unknown'))];
  const attachments = sources.filter((s) => s.attachmentName).map((s) => s.attachmentName);
  const sourceRecords = sources.map((s) => ({
    channel: cut(s.channel || 'Unknown', 60),
    subject: cut(s.subject, 250),
    body: s.body,
    fromName: cut(s.fromName, 150),
    fromContact: cut(s.fromContact, 180),
    sourceTimestamp: s.sourceTimestamp || null,
    attachmentName: cut(s.attachmentName, 255),
    externalReference: cut(s.externalReference, 180),
    importedAt: now
  }));

  const incidents = await db.getIncidents();

  // Merge: same tracking number and still open -> add the new evidence instead of creating a duplicate
  let target = null;
  if (trackingNumber !== 'UNKNOWN') {
    target = incidents
      .filter((i) => i.trackingNumber === trackingNumber && i.status !== 'resolved')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
  }

  if (target) {
    target.sources = [...(target.sources || []), ...sourceRecords];
    target.attachments = [...new Set([...(target.attachments || []), ...attachments])];
    target.channels = [...new Set([...(target.channels || []), ...channels])];
    if (PRIORITY_RANK[priority] > (PRIORITY_RANK[target.priority] || 0)) target.priority = priority;
    if (ai && ai.used) {
      target.ai = ai;
      target.category = category;
      target.department = ai.department || target.department;
      target.description = description;
    }
    target.notes = [...(target.notes || []), {
      author: 'UiPath Bot',
      content: `Merged ${sourceRecords.length} new source(s) from ${channels.join(' + ')}.\n${buildAiNote(ai)}`,
      createdAt: now
    }];
    target.updatedAt = now;
    await db.saveIncident(target);
    return res.json({
      ok: true, merged: true, incidentId: target.id, incidentCode: target.id, shipmentId: target.trackingNumber,
      category: target.category, priority: target.priority, department: target.department || null,
      sourceCount: target.sources.length, addedSources: sourceRecords.length, duplicateOf: target.possibleDuplicateOf || null
    });
  }

  // Duplicate hint: similar wording to another incident (different or missing tracking number)
  const myTokens = tokens(`${body.title} ${description}`);
  let best = null;
  let bestScore = 0;
  incidents.forEach((i) => {
    const score = jaccard(myTokens, tokens(`${i.title} ${i.description}`));
    if (score > bestScore) { bestScore = score; best = i; }
  });
  const possibleDuplicateOf = bestScore >= 0.45 && best ? best.id : null;

  const incident = {
    id: db.nextIncidentId(incidents),
    trackingNumber,
    title: cut(body.title || (ai && ai.keyProblem) || `Incident ${trackingNumber}`, 180),
    description,
    priority,
    category,
    status: 'open',
    assignedTo: null,
    department: (ai && ai.used && ai.department) || null,
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
    source: 'rpa',
    channels,
    reporterName: cut(body.reporterName, 120),
    reporterEmail: cut(body.reporterEmail, 180),
    externalReference: cut(body.externalReference, 180),
    possibleDuplicateOf,
    ai: ai || { used: false },
    sources: sourceRecords,
    notes: [{
      author: 'UiPath Bot',
      content: `Imported from ${channels.join(' + ')} via UiPath RPA.\n${buildAiNote(ai)}` +
        (possibleDuplicateOf ? `\nPossible duplicate of ${possibleDuplicateOf} (similarity ${bestScore.toFixed(2)}).` : ''),
      createdAt: now
    }],
    attachments
  };

  await db.saveIncident(incident);

  return res.status(201).json({
    ok: true, merged: false, incidentId: incident.id, incidentCode: incident.id, shipmentId: incident.trackingNumber,
    category: incident.category, priority: incident.priority, department: incident.department,
    sourceCount: sourceRecords.length, addedSources: sourceRecords.length, duplicateOf: possibleDuplicateOf
  });
}));

router.patch('/status', rpaAuth, asyncRoute(async (req, res) => {
  const { incidentCode, newStatus, note } = req.body || {};
  if (!incidentCode || !newStatus) {
    return res.status(400).json({ ok: false, message: 'incidentCode and newStatus are required.' });
  }
  const mapped = STATUS_MAP[String(newStatus).trim().toLowerCase().replace(/\s+/g, '')];
  if (!mapped) {
    return res.status(400).json({ ok: false, message: `Unknown status '${newStatus}'.` });
  }

  const incident = await db.getIncidentById(incidentCode);
  if (!incident) {
    return res.status(404).json({ ok: false, message: `Incident ${incidentCode} not found.` });
  }

  const now = new Date().toISOString();
  const oldStatus = incident.status;
  incident.status = mapped;
  if (mapped === 'resolved' && !incident.resolvedAt) incident.resolvedAt = now;
  if (String(newStatus).toLowerCase() === 'triaged') incident.triagedAt = now;
  incident.notes = [...(incident.notes || []), {
    author: 'UiPath Bot',
    content: `Status ${oldStatus} -> ${mapped} (${newStatus}). ${note || ''}`.trim(),
    createdAt: now
  }];
  incident.updatedAt = now;
  await db.saveIncident(incident);

  return res.json({ ok: true, incidentCode, status: mapped, changed: oldStatus !== mapped });
}));

module.exports = router;