// MedAuth AI - services/orchestrator.js - Runs all 4 agents in sequence
const Case = require('../models/Case');
const Insurer = require('../models/Insurer');
const AuditLog = require('../models/AuditLog');
const { extractDocumentData } = require('../agents/documentAgent');
const { assessClinicalNecessity } = require('../agents/clinicalAgent');
const { checkPolicyCompliance } = require('../agents/policyAgent');
const { evaluateEscalation } = require('../agents/escalationAgent');
const eventBus = require('./eventBus');

const logAudit = async (caseId, agent, action, detail) => {
  await AuditLog.create({ caseId, agent, action, detail });
};

const run = async (caseId) => {
  try {
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      console.error(`Case ${caseId} not found`);
      return;
    }
    
    // Give the frontend time to redirect and establish the EventSource connection
    await new Promise(r => setTimeout(r, 2000));
    
    // Emits SSE events keying on caseId
    const emit = (agent, status, data = null) => {
      eventBus.emit(`case:${caseId}`, { agent, status, data });
    };

    caseDoc.status = 'processing';
    await caseDoc.save();

    const insurer = await Insurer.findById(caseDoc.insurerId);
    
    // 1. Document Agent
    emit('document', 'started');
    await logAudit(caseId, 'document', 'started', 'Parsing uploaded medical records...');
    const docStart = Date.now();
    const docOutput = await extractDocumentData(caseDoc.extractedText || '');
    caseDoc.agentOutputs.document = docOutput;
    caseDoc.extractedData = docOutput.data;
    await caseDoc.save();
    emit('document', 'complete', docOutput);
    await logAudit(caseId, 'document', 'complete', `Extracted procedure: ${docOutput.data?.requestedProcedure}`);

    // Match rule
    const requestedCode = docOutput.data?.procedureCodes?.[0];
    let targetRule = null;
    if (insurer && requestedCode) {
      targetRule = insurer.rules.find(r => r.procedureCode === requestedCode);
    }
    
    // 2. Clinical Agent
    emit('clinical', 'started');
    await logAudit(caseId, 'clinical', 'started', 'Assessing medical necessity...');
    const clinicalOutput = await assessClinicalNecessity(docOutput.data);
    caseDoc.agentOutputs.clinical = clinicalOutput;
    await caseDoc.save();
    emit('clinical', 'complete', clinicalOutput);
    await logAudit(caseId, 'clinical', 'complete', `Clinical rationale: ${clinicalOutput.rationale}`);

    // 3. Policy Agent
    emit('policy', 'started');
    await logAudit(caseId, 'policy', 'started', 'Checking coverage rules...');
    const policyOutput = await checkPolicyCompliance(docOutput.data, targetRule);
    caseDoc.agentOutputs.policy = policyOutput;
    await caseDoc.save();
    emit('policy', 'complete', policyOutput);
    await logAudit(caseId, 'policy', 'complete', `Policy section cited: ${policyOutput.policySection}`);

    // 4. Escalation Agent
    emit('escalation', 'started');
    await logAudit(caseId, 'escalation', 'started', 'Evaluating final decision...');
    const escalationOutput = await evaluateEscalation(docOutput, clinicalOutput, policyOutput);
    caseDoc.agentOutputs.escalation = escalationOutput;
    
    caseDoc.confidenceScore = escalationOutput.confidenceScore;
    caseDoc.decisionExplanation = escalationOutput.decisionExplanation;
    caseDoc.policyCitation = escalationOutput.policyCitation;
    caseDoc.finalDecision = escalationOutput.overallRecommendation;
    
    caseDoc.processingTimeMs = Date.now() - docStart;
    caseDoc.status = escalationOutput.overallRecommendation;
    caseDoc.completedAt = new Date();
    
    await caseDoc.save();
    
    emit('escalation', 'complete', escalationOutput);
    await logAudit(caseId, 'escalation', 'complete', `Final decision: ${caseDoc.finalDecision}`);
    
  } catch (error) {
    console.error(`Orchestrator error on case ${caseId}:`, error);
    eventBus.emit(`case:${caseId}`, { agent: 'system', status: 'error', data: error.message });
    await logAudit(caseId, 'system', 'error', error.message);
  }
};

module.exports = { run };
