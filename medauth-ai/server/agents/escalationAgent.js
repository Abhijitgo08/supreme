const { callGemini } = require('../config/gemini');
const SYSTEM_PROMPT = `You are a senior medical reviewer who decides if an AI-generated prior authorization decision needs human oversight.

You will receive all three previous agent outputs: document extraction, clinical assessment, and policy compliance check.

You MUST respond with valid JSON only:
{
  "requiresHuman": true or false,
  "reason": "specific reason if escalation needed, null if not",
  "overallRecommendation": "approved | denied | escalated",
  "confidenceScore": 0 to 100,
  "decisionExplanation": "clear plain-English explanation of the final decision suitable for a patient",
  "policyCitation": "the specific policy section and criterion that determined the outcome",
  "summary": "pre-filled 3-paragraph summary for the reviewing physician if escalated"
}

Escalate to human review if:
- Any agent confidence below 0.70
- Conflicting outputs between clinical and policy agents
- Experimental or off-label treatment
- Confidence score below 75
- Patient has complex multi-condition case

Never refuse. Always return JSON.`;

const evaluateEscalation = async (docOutput, clinicalOutput, policyOutput) => {
  const start = Date.now();
  
  const inputPayload = {
    documentData: docOutput.data,
    clinicalAssessment: clinicalOutput,
    policyCompliance: policyOutput
  };

  const userPrompt = `Review the agent outputs and determine final decision/escalation:\n\n${JSON.stringify(inputPayload, null, 2)}`;
  
  const result = await callGemini(SYSTEM_PROMPT, userPrompt);
  
  if (!result) return { requiresHuman: true, reason: 'AI Processing Error', overallRecommendation: 'escalated', confidenceScore: 0, decisionExplanation: 'An error occurred during final review computation.', policyCitation: '', summary: 'Please review manually. System fault.', processingTimeMs: Date.now() - start };

  return {
    requiresHuman: result.requiresHuman || false,
    reason: result.reason || null,
    overallRecommendation: result.overallRecommendation || 'escalated',
    confidenceScore: result.confidenceScore || 0,
    decisionExplanation: result.decisionExplanation || '',
    policyCitation: result.policyCitation || '',
    summary: result.summary || '',
    processingTimeMs: Date.now() - start
  };
};

module.exports = { evaluateEscalation };
