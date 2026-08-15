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

function extractText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const outputs = Array.isArray(data?.outputs) ? data.outputs : [];
  const parts = [];
  for (const output of outputs) {
    if (typeof output?.text === 'string') parts.push(output.text);
    const content = Array.isArray(output?.content) ? output.content : [];
    for (const item of content) {
      if (typeof item?.text === 'string') parts.push(item.text);
      if (typeof item?.content?.text === 'string') parts.push(item.content.text);
    }
  }
  return parts.join('').trim();
}

export async function analyzeDilemma(rawDilemma) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') throw new Error('GEMINI_API_KEY is missing from server/.env');

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      model: 'gemini-3.6-flash',
      input: `${instructions}\n\nUSER DILEMMA:\n${rawDilemma}`,
      response_format: { type: 'text', mime_type: 'application/json', schema: responseSchema }
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`Gemini API error: ${data?.error?.message || `HTTP ${response.status}`}`);

  const text = extractText(data);
  if (!text) {
    console.error('Gemini response without text:', JSON.stringify(data, null, 2));
    throw new Error('Gemini returned no text output. Please try again.');
  }

  try {
    return JSON.parse(text);
  } catch {
    console.error('Gemini returned non-JSON text:', text);
    throw new Error('Gemini returned invalid JSON. Please try again.');
  }
}
