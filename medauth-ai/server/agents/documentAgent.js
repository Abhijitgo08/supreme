const { callGemini } = require('../config/gemini');
const SYSTEM_PROMPT = `You are a medical document extraction specialist. Your ONLY job is to read medical text and extract structured information. You MUST respond with valid JSON only — no explanations, no markdown, just raw JSON.

Extract exactly this structure:
{
  "patientName": "string",
  "dateOfBirth": "string",
  "diagnosisCodes": ["array of ICD-10 codes found"],
  "procedureCodes": ["array of CPT codes found"],
  "requestedProcedure": "string — the main procedure being requested",
  "referringPhysician": "string",
  "clinicalSummary": "2-3 sentence plain English summary of why treatment is needed"
}

If a field is not found, use null. Never refuse. Always return JSON.`;

const extractDocumentData = async (text) => {
  const start = Date.now();
  const userPrompt = `Extract the structured data from the following medical document:\n\n${text}`;
  
  const result = await callGemini(SYSTEM_PROMPT, userPrompt);
  
  if (!result || result.error) {
     return { success: false, data: {}, processingTimeMs: Date.now() - start };
  }
  
  return {
    success: !result.error,
    data: result.error ? {} : result,
    processingTimeMs: Date.now() - start
  };
};

module.exports = { extractDocumentData };
