// MedAuth AI - routes/patients.js
const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

router.get('/', async (req, res) => {
  const { doctorId } = req.query;
  const query = {};
  if (doctorId) query.doctorId = doctorId;
  
  const patients = await Patient.find(query).populate('insurerId', 'name code color');
  res.json({ success: true, count: patients.length, data: patients });
});

router.put('/:id', async (req, res) => {
  const { name, dateOfBirth } = req.body;
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { name, dateOfBirth },
    { new: true }
  );
  res.json({ success: true, data: patient });
});

router.post('/', async (req, res) => {
  const p = await Patient.create(req.body);
  res.json({ success: true, data: p });
});

module.exports = router;
