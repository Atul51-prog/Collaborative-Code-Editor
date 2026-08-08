const test = require('node:test');
const assert = require('node:assert/strict');
const { extractGeminiText } = require('./ai');

test('extractGeminiText returns text from Gemini response payloads', () => {
  const response = {
    candidates: [
      {
        content: {
          parts: [{ text: 'Hello from Gemini' }]
        }
      }
    ]
  };

  assert.equal(extractGeminiText(response), 'Hello from Gemini');
});

test('extractGeminiText falls back to response.text', () => {
  const response = { text: 'Fallback reply' };
  assert.equal(extractGeminiText(response), 'Fallback reply');
});
