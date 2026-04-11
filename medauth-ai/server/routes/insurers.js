// MedAuth AI - routes/insurers.js
const express = require('express');
const router = express.Router();
const Insurer = require('../models/Insurer');

router.get('/', async (req, res) => {
  const insurers = await Insurer.find().select('name code color logo rules');
  const summary = insurers.map(i => {
    const doc = i.toObject();
    return {
      ...doc,
      rulesSummary: doc.rules || []
    };
  });
  res.json({ success: true, data: summary });
});

router.put('/:id/rules/:ruleIndex', async (req, res) => {
  const ruleIndex = parseInt(req.params.ruleIndex, 10);
  if (isNaN(ruleIndex) || ruleIndex < 0) {
    return res.status(400).json({ success: false, message: 'Invalid rule index' });
  }
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ success: false, message: 'Request body cannot be empty' });
  }

  try {
    await Insurer.updateOne(
      { _id: req.params.id },
      { $set: { [`rules.${ruleIndex}`]: req.body } }
    );
    res.json({ success: true, message: 'Rule updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
