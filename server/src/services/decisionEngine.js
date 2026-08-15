const responseSchema = {
  type: 'OBJECT',
  properties: {
    coreSummary: { type: 'STRING' },
    optionA: {
      type: 'OBJECT',
      properties: {
        name: { type: 'STRING' },
        pros: { type: 'ARRAY', items: { type: 'STRING' } },
        cons: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['name', 'pros', 'cons']
    },
    optionB: {
      type: 'OBJECT',
      properties: {
        name: { type: 'STRING' },
        pros: { type: 'ARRAY', items: { type: 'STRING' } },
        cons: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['name', 'pros', 'cons']
    },
    blindSpot: { type: 'STRING' },
    objectiveRecommendation: { type: 'STRING' }
  },
  required: ['coreSummary', 'optionA', 'optionB', 'blindSpot', 'objectiveRecommendation']
};

const instructions = `You are the reasoning engine behind DilemmaDecider, a decision-support tool.

Convert a messy, emotional description into a calm, objective, structured comparison.

Rules:
1. Identify the two, or rarely three, core options actually being weighed. If more than two, keep the two most consequential and ignore the rest for scoring.
2. Extract underlying values and constraints such as money, time, risk, relationships, growth, autonomy, health, and reputation only when the user's wording implies them. Never invent facts.
3. For each option, list distinct pros and cons. Do not pad lists to equal lengths.
4. Surface at least one genuine blind spot: a hidden cost, reversibility question, second-order consequence, or assumption treated as fact. Do not simply restate a pro or con.
5. Give exactly one recommendation. Ground it explicitly in one or two extracted factors. If the dilemma is genuinely too balanced or underspecified, say so plainly rather than forcing a choice.
6. Use plain language that a stressed person can scan quickly.
7. Never moralize, diagnose, or assume missing facts.
8. Return only the requested JSON object.`;

export async function analyzeDilemma(rawDilemma) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is missing from server/.env');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${instructions}\n\nUSER DILEMMA:\n${rawDilemma}` }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message || `Gemini API returned HTTP ${response.status}`;
    throw new Error(`Gemini API error: ${message}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned an empty response.');

  return JSON.parse(text);
}
