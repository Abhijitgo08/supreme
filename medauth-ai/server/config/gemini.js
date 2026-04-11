// MedAuth AI — config/gemini.js — Google Gemini API wrapper (free tier)
const fetch = require('node-fetch');

const callGemini = async (systemPrompt, userPrompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.AI_MODEL || 'gemini-2.0-flash';
  
  // Initialization print flag ensuring strict config mapping
  console.log('Gemini initialized — model:', model, '| key configured:', !!apiKey);

  if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY not set — AI agents will fail');
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [{
      parts: [{ text: userPrompt }]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json'
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      const { callGroq } = require('./groq');
      console.warn('Gemini failed entirely — trying Groq fallback');
      return await callGroq(systemPrompt, userPrompt);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('Gemini returned empty response');
      const { callGroq } = require('./groq');
      console.warn('Gemini failed entirely — trying Groq fallback');
      return await callGroq(systemPrompt, userPrompt);
    }

    const cleaned = text.replace(/```json|```/g, '').trim();
    
    try {
      return JSON.parse(cleaned);
    } catch (parseErr) {
      // Retry with stricter prompt
      console.warn('JSON parse failed, retrying with stricter prompt...');
      const retryBody = {
        ...body,
        contents: [{
          parts: [{
            text: userPrompt + '\n\nCRITICAL: Return ONLY a raw JSON object. No markdown. No code fences. No explanation. Just the JSON.'
          }]
        }]
      };

      const retryRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(retryBody),
        signal: AbortSignal.timeout(60000)
      });

      if (!retryRes.ok) {
        const { callGroq } = require('./groq');
        console.warn('Gemini failed entirely — trying Groq fallback');
        return await callGroq(systemPrompt, userPrompt);
      }
      const retryData = await retryRes.json();
      const retryText = retryData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!retryText){
        const { callGroq } = require('./groq');
        console.warn('Gemini failed entirely — trying Groq fallback');
        return await callGroq(systemPrompt, userPrompt);
      }

      try {
        return JSON.parse(retryText.replace(/```json|```/g, '').trim());
      } catch {
        console.error('Gemini JSON parse failed after retry');
        const { callGroq } = require('./groq');
        console.warn('Gemini failed entirely — trying Groq fallback');
        return await callGroq(systemPrompt, userPrompt);
      }
    }
  } catch (err) {
    if (err.name === 'TimeoutError') {
      console.error('Gemini API timeout after 60s');
    } else {
      console.error('Gemini fetch error:', err.message);
    }
    const { callGroq } = require('./groq');
    console.warn('Gemini failed entirely — trying Groq fallback');
    return await callGroq(systemPrompt, userPrompt);
  }
};

module.exports = { callGemini };
