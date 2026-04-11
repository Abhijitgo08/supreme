const { callGemini } = require('../config/gemini');
const SYSTEM_PROMPT = `You are a clinical necessity reviewer for a health insurance company. You evaluate whether a requested medical procedure is medically necessary based on standard clinical criteria.

You will receive extracted patient data including diagnosis codes, the requested procedure, and clinical summary.

You MUST respond with valid JSON only:
{
  "medicallyNecessary": true or false,
  "rationale": "2-3 sentence clinical justification",
  "indicators": ["list of clinical indicators found that support or oppose necessity"],
  "confidence": 0.0 to 1.0,
  "flags": ["any clinical concerns or missing documentation"]
}

Apply these standard criteria:
- Diagnosis codes must be appropriate for the requested procedure
- Conservative treatment should have been attempted for elective procedures
- Urgency indicators (acute conditions) can override step therapy requirements
- Experimental procedures require additional scrutiny
Never refuse. Always return JSON.`;

const assessClinicalNecessity = async (documentData) => {
  const start = Date.now();
  const userPrompt = `Assess medical necessity for the following case data:\n\n${JSON.stringify(documentData, null, 2)}`;
  
  const result = await callGemini(SYSTEM_PROMPT, userPrompt);
  
  if (!result) return { medicallyNecessary: false, rationale: 'AI Error', indicators: [], confidence: 0, flags: ['AI Processing Failed'], processingTimeMs: Date.now() - start };
  
  return {
    medicallyNecessary: result.medicallyNecessary || false,
    rationale: result.rationale || '',
    indicators: result.indicators || [],
    confidence: result.confidence || 0,
    flags: result.flags || [],
    processingTimeMs: Date.now() - start
  };
};

module.exports = { assessClinicalNecessity };
