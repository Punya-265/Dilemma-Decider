const responseSchema = {
  type: 'OBJECT',
  properties: {
    coreSummary: { type: 'STRING' },
    optionA: { type: 'OBJECT', properties: { name: { type: 'STRING' }, pros: { type: 'ARRAY', items: { type: 'STRING' } }, cons: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['name', 'pros', 'cons'] },
    optionB: { type: 'OBJECT', properties: { name: { type: 'STRING' }, pros: { type: 'ARRAY', items: { type: 'STRING' } }, cons: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['name', 'pros', 'cons'] },
    blindSpot: { type: 'STRING' },
    objectiveRecommendation: { type: 'STRING' }
  },
  required: ['coreSummary', 'optionA', 'optionB', 'blindSpot', 'objectiveRecommendation']
};

const instructions = `You are the reasoning engine behind DilemmaDecider, a decision-support tool.
Convert a messy, emotional description into a calm, objective, structured comparison.
Rules:
1. Identify the two, or rarely three, core options actually being weighed. If more than two, keep the two most consequential.
2. Extract values and constraints only when implied. Never invent facts.
3. List distinct pros and cons. Do not pad lists.
4. Surface a genuine blind spot: hidden cost, reversibility question, second-order consequence, or unsupported assumption.
5. Give exactly one recommendation grounded in one or two extracted factors. If genuinely too balanced or underspecified, say so plainly.
6. Use plain language. Never moralize, diagnose, or assume missing facts.
7. Return only the requested JSON object.`;

export async function analyzeDilemma(rawDilemma) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') throw new Error('GEMINI_API_KEY is missing from server/.env');

  // Use Gemini's current REST endpoint with a currently supported Flash model.
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${instructions}\n\nUSER DILEMMA:\n${rawDilemma}` }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json', responseSchema }
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`Gemini API error: ${data?.error?.message || `HTTP ${response.status}`}`);
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned an empty response.');
  return JSON.parse(text);
}
