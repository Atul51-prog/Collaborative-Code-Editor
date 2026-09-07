const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const router = express.Router();

const extractGeminiText = (payload) => {
  if (!payload) return '';
  if (typeof payload.output_text === 'string') return payload.output_text;
  if (typeof payload.outputText === 'string') return payload.outputText;
  if (typeof payload.text === 'string') return payload.text;
  if (typeof payload.text === 'function') return payload.text();

  if (Array.isArray(payload.steps)) {
    return payload.steps
      .flatMap((step) => step.content || [])
      .filter((part) => part.type === 'text' && part.text)
      .map((part) => part.text)
      .join('');
  }

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

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in server config' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Active Gemini models (gemini-3.6-flash is primary)
    const configuredModel = (process.env.GEMINI_MODEL || 'gemini-3.6-flash').trim();
    const candidateModels = [
      configuredModel,
      'gemini-3.6-flash',
      'gemini-1.5-flash',
    ].filter((m, i, arr) => m && arr.indexOf(m) === i && m !== 'gemini-2.5-flash' && m !== 'gemini-2.0-flash');

    const maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS || '450', 10);

    const systemInstruction = 
      'You are a concise programming assistant in the SynCode collaborative code editor.\n' +
      'Rules to save tokens and provide fast, helpful answers:\n' +
      '1. Be brief, direct, and to the point.\n' +
      '2. If the user asks for code, output only the requested code and at most 1-2 brief bullet points or sentences of explanation.\n' +
      '3. Do NOT generate lengthy tutorials, unsolicited multi-part examples, full cheat sheets, or conversational filler unless explicitly requested.\n' +
      '4. Focus strictly on answering the specific question asked.';

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let reply = '';
    let lastError = null;

    for (const modelName of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt.trim(),
            config: {
              systemInstruction,
              maxOutputTokens: maxTokens,
              temperature: 0.3,
            },
          });
          reply = extractGeminiText(response);
          if (reply) {
            console.log(`[AI Route] Successfully generated response with model: ${modelName}`);
            break;
          }
        } catch (err) {
          lastError = err;
          const isNetworkGlitch =
            err.message?.includes('fetch failed') ||
            err.cause?.code === 'ECONNRESET' ||
            err.cause?.code === 'ETIMEDOUT' ||
            err.code === 'ECONNRESET';

          if (isNetworkGlitch && attempt === 1) {
            console.warn(`[AI Route] Network glitch on ${modelName} (attempt 1). Retrying in 1.2s...`);
            await wait(1200);
            continue;
          }

          console.warn(`[AI Route] Model ${modelName} failed:`, err.message);
          break;
        }
      }
      if (reply) break;
    }

    if (!reply) {
      return res.status(502).json({ 
        error: lastError?.message || 'No response from AI assistant. Check Gemini API key and model availability.' 
      });
    }

    res.json({ reply });
  } catch (error) {
    console.error('[AI Route] ERROR:', error.message);
    res.status(500).json({ error: error.message || 'AI route failed' });
  }
});

module.exports = { router, extractGeminiText };
