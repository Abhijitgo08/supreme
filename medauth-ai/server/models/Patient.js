// MedAuth AI - models/Patient.js - Mongoose Schema
const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: String,
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  dateOfBirth: String,
  insurerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Insurer' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
  patientIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
  caseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Case' }],
  avatar: String 
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);
