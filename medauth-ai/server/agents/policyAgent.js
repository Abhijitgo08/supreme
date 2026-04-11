const { callGemini } = require('../config/gemini');
const SYSTEM_PROMPT = `You are an insurance policy compliance agent. You will receive:
1. The requested procedure (CPT code and name)
2. The insurance company's coverage rules for that procedure (as JSON)
3. The patient's clinical data

Your job is to check whether the procedure meets the insurer's specific policy criteria.

You MUST respond with valid JSON only:
{
  "covered": true or false,
  "requiresPriorAuth": true or false,
  "policySection": "section number from the rules",
  "citedRule": "exact rule or criterion that applies",
  "requirementsMet": true or false,
  "unmetRequirements": ["list of criteria not yet satisfied"],
  "confidence": 0.0 to 1.0,
  "recommendation": "approved | denied | needs_more_info"
}

Be precise about which policy section applies. Never refuse. Always return JSON.`;

const checkPolicyCompliance = async (documentData, insurerRule) => {
  const start = Date.now();
  
  const inputPayload = {
    requestedProcedure: documentData.requestedProcedure || 'Unknown',
    procedureCodes: documentData.procedureCodes || [],
    clinicalSummary: documentData.clinicalSummary || '',
    insurerRule: insurerRule || { notes: "No specific rule found" }
  };

  const userPrompt = `Evaluate policy compliance for this case:\n\n${JSON.stringify(inputPayload, null, 2)}`;
  
  const result = await callGemini(SYSTEM_PROMPT, userPrompt);
  
  if (!result) return { covered: false, requiresPriorAuth: true, policySection: '', citedRule: 'AI Error', requirementsMet: false, unmetRequirements: ['AI Processing Failed'], confidence: 0, recommendation: 'needs_more_info', processingTimeMs: Date.now() - start };

  return {
    covered: result.covered || false,
    requiresPriorAuth: result.requiresPriorAuth !== undefined ? result.requiresPriorAuth : true,
    policySection: result.policySection || '',
    citedRule: result.citedRule || '',
    requirementsMet: result.requirementsMet || false,
    unmetRequirements: result.unmetRequirements || [],
    confidence: result.confidence || 0,
    recommendation: result.recommendation || 'needs_more_info',
    processingTimeMs: Date.now() - start
  };
};

module.exports = { checkPolicyCompliance };
