// MedAuth AI - models/Insurer.js - Mongoose Schema
const mongoose = require('mongoose');

const InsurerSchema = new mongoose.Schema({
  name: String,
  code: String,
  logo: String,
  color: String,
  rules: [{
    procedureCode: String,
    procedureName: String,
    covered: Boolean,
    requiresPriorAuth: Boolean,
    policySection: String,
    criteria: [String],
    stepTherapyRequired: Boolean,
    visitLimit: Number,
    notes: String
  }]
});

module.exports = mongoose.model('Insurer', InsurerSchema);
