const responseSchema = {
  type: 'object',
  properties: {
    coreSummary: { type: 'string' },
    optionA: { type: 'object', properties: { name: { type: 'string' }, pros: { type: 'array', items: { type: 'string' } }, cons: { type: 'array', items: { type: 'string' } } }, required: ['name', 'pros', 'cons'] },
    optionB: { type: 'object', properties: { name: { type: 'string' }, pros: { type: 'array', items: { type: 'string' } }, cons: { type: 'array', items: { type: 'string' } } }, required: ['name', 'pros', 'cons'] },
    blindSpot: { type: 'string' },
    objectiveRecommendation: { type: 'string' }
  },
  required: ['coreSummary', 'optionA', 'optionB', 'blindSpot', 'objectiveRecommendation']
};

const instructions = `You are DilemmaDecider, an objective decision-support engine.
Analyze the user's dilemma calmly and return ONLY valid JSON matching the requested schema.
Identify the two most consequential options. Extract only values and constraints implied by the user's words. Give distinct pros and cons without padding. Find at least one genuine blind spot that is not simply a pro or con. Give exactly one practical recommendation grounded in the factors present in the dilemma. Never invent facts, diagnose the user, moralize, or add commentary outside the JSON.`;

export async function analyzeDilemma(rawDilemma) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is missing from server/.env');
  }

  const url = 'https://generativelanguage.googleapis.com/v1beta/interactions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      model: 'gemini-3.6-flash',
      input: `${instructions}\n\nUSER DILEMMA:\n${rawDilemma}`,
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: responseSchema
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Gemini API error: ${data?.error?.message || `HTTP ${response.status}`}`);
  }

  // The Interactions API returns generated text in output_text.
  // Keep a fallback for SDK/API response variations.
  const text = data?.output_text
    || data?.outputs?.find((item) => item?.type === 'text')?.text
    || data?.steps?.flatMap((step) => step?.output || []).find((item) => item?.type === 'text')?.text;

  if (!text) {
    console.error('Gemini response without text:', JSON.stringify(data, null, 2));
    throw new Error('Gemini returned no text output. Check the server terminal for the raw response.');
  }

  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned);
  }
}
