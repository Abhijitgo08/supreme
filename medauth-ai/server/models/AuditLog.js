// MedAuth AI - models/AuditLog.js - Mongoose Schema
const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  agent: { type: String, enum: ['document','clinical','policy','escalation','system'] },
  action: String,
  detail: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
