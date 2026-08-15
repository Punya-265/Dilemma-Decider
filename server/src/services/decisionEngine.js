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

  const url = 'https://generativelanguage.googleapis.com/v1beta/interactions';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
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
  if (!response.ok) throw new Error(`Gemini API error: ${data?.error?.message || `HTTP ${response.status}`}`);
  const text = data?.output_text || data?.outputs?.find((x) => x?.type === 'text')?.text;
  if (!text) throw new Error('Gemini returned an empty response.');
  return JSON.parse(text);
}
