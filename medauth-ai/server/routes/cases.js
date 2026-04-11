// MedAuth AI - routes/cases.js - Case routes block
const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const eventBus = require('../services/eventBus');
const orchestrator = require('../services/orchestrator');

router.post('/', async (req, res) => {
  const { patientId, insurerId, doctorId, uploadId, extractedText } = req.body;
  
  const newCase = await Case.create({
    patientId,
    insurerId,
    doctorId: doctorId || null,
    uploadId,
    extractedText,
    status: 'pending'
  });

  // Kick off async
  orchestrator.run(newCase._id);
  
  res.status(201).json({ success: true, caseId: newCase._id });
});

router.get('/', async (req, res) => {
  const { patientId, doctorId, limit = 50 } = req.query;
  const query = {};
  if (patientId) query.patientId = patientId;
  if (doctorId) query.doctorId = doctorId;

  const cases = await Case.find(query)
    .sort('-createdAt')
    .limit(Number(limit))
    .populate('patientId', 'name avatar role')
    .populate('insurerId', 'name code color')
    .populate('doctorId', 'name');
  
  res.json({ success: true, count: cases.length, data: cases });
});

router.get('/:id/stream', (req, res) => {
  const caseId = req.params.id;

  // Timeout 0 & nodelay for proxy compatibility/Express drops
  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(': ping\n\n');

  const onCaseUpdate = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    if (payload.agent === 'escalation' && payload.status === 'complete') {
      res.end();
      eventBus.removeListener(`case:${caseId}`, onCaseUpdate);
    }
  };

  eventBus.on(`case:${caseId}`, onCaseUpdate);

  req.on('close', () => {
    eventBus.removeListener(`case:${caseId}`, onCaseUpdate);
  });
});

router.get('/:id', async (req, res) => {
  const c = await Case.findById(req.params.id)
    .populate('patientId')
    .populate('insurerId');
  if (!c) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }
  res.json({ success: true, data: c });
});

module.exports = router;
