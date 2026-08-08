const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const router = express.Router();

console.log('Initializing GoogleGenAI with API key:', process.env.GEMINI_API_KEY ? '✓ Set' : '✗ NOT SET');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const extractGeminiText = (payload) => {
  console.log('[extractGeminiText] Raw response:', JSON.stringify(payload).substring(0, 500));
  if (!payload) return '';
  if (typeof payload.text === 'string') return payload.text;
  if (payload.candidates?.[0]?.content?.parts) {
    return payload.candidates[0].content.parts
      .map((part) => part.text || '')
      .join('');
  }
  return '';
};

router.post('/ai', async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log('[AI Route] Incoming request - Prompt:', prompt);
    
    if (!prompt) {
      console.log('[AI Route] Error: No prompt provided');
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('[AI Route] Calling Gemini API...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    console.log('[AI Route] Gemini raw response:', JSON.stringify(response).substring(0, 500));
    const reply = extractGeminiText(response);
    
    console.log('[AI Route] Extracted reply:', reply);
    
    if (!reply) {
      console.log('[AI Route] Error: No reply from Gemini');
      return res.status(502).json({ error: 'No response from Gemini' });
    }

    console.log('[AI Route] Returning response to frontend');
    res.json({ reply });
  } catch (error) {
    console.error('[AI Route] ERROR:', error.message);
    console.error('[AI Route] Full error:', error);
    res.status(500).json({ error: error.message || 'AI route failed' });
  }
});

module.exports = { router, extractGeminiText };
