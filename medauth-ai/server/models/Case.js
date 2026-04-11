// MedAuth AI - models/Case.js - Mongoose Schema
const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  insurerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Insurer' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  status: { type: String, enum: ['pending','processing','approved','denied','escalated'], default: 'pending' },
  uploadedFiles: [{ filename: String, originalName: String, mimetype: String, size: Number }],
  extractedText: String,
  uploadId: String,
  extractedData: {
    patientName: String,
    dateOfBirth: String,
    diagnosisCodes: [String],
    procedureCodes: [String],
    requestedProcedure: String,
    referringPhysician: String,
    clinicalSummary: String
  },
  agentOutputs: {
    document: { success: Boolean, data: mongoose.Schema.Types.Mixed, processingTimeMs: Number },
    clinical: { medicallyNecessary: Boolean, rationale: String, indicators: [String], processingTimeMs: Number },
    policy: { covered: Boolean, policySection: String, citedRule: String, requirementsMet: Boolean, processingTimeMs: Number },
    escalation: { requiresHuman: Boolean, reason: String, summary: String, processingTimeMs: Number }
  },
  confidenceScore: Number,
  finalDecision: { type: String, enum: ['approved','denied','escalated'] },
  decisionExplanation: String,
  policyCitation: String,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
  processingTimeMs: Number
});

module.exports = mongoose.model('Case', CaseSchema);
