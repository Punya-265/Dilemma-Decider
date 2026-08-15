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

const instructions = `You are the reasoning engine behind DilemmaDecider. Analyze the user's dilemma objectively. Identify the two main options, extract only implied values and constraints, list distinct pros and cons without inventing facts, identify a genuine blind spot, and give one practical recommendation. If the dilemma is too underspecified, say so. Return only valid JSON matching the supplied schema.`;

export async function analyzeDilemma(rawDilemma) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is missing from server/.env');
  }

  // Use the official Google GenAI SDK. This avoids manually parsing the
  // Interactions REST response, which can contain different output step types.
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: `${instructions}\n\nUSER DILEMMA:\n${rawDilemma}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema,
      temperature: 0.2
    }
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error(`Gemini returned no text. Finish reason: ${JSON.stringify(response.candidates?.[0]?.finishReason || 'unknown')}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Gemini returned invalid JSON.');
  }
}
