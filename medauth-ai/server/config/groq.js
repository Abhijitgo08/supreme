// MedAuth AI — config/groq.js — Groq API fallback (free tier)
const fetch = require('node-fetch');

const callGroq = async (systemPrompt, userPrompt) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const body = {
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1,
    max_tokens: 1024,
    response_format: { type: 'json_object' }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) return null;
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;
    return JSON.parse(text);
  } catch (err) {
    console.error('Groq fallback error:', err.message);
    return null;
  }
};

module.exports = { callGroq };
