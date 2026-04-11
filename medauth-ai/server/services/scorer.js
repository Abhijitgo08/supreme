// MedAuth AI - services/scorer.js - Confidence scoring logic
const calculateConfidence = (agentOutputs) => {
  // Simple heuristic based on agent outputs if we want to augment the escalation agent score
  let score = 100;
  
  if (agentOutputs.clinical && agentOutputs.clinical.confidence) {
    score -= (1 - agentOutputs.clinical.confidence) * 20;
  }
  
  if (agentOutputs.policy && agentOutputs.policy.confidence) {
    score -= (1 - agentOutputs.policy.confidence) * 20;
  }

  // Not heavily used since escalation agent computes its own score, but explicitly requested.
  return Math.max(0, Math.min(100, Math.round(score)));
};

module.exports = { calculateConfidence };
