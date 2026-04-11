// MedAuth AI - routes/auditlogs.js
const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

router.get('/', async (req, res) => {
  const { limit = 100, sort = '-timestamp', agent } = req.query;
  
  const query = {};
  if (agent) query.agent = agent;

  try {
    const logs = await AuditLog.find(query)
      .sort(sort)
      .limit(Number(limit));
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
