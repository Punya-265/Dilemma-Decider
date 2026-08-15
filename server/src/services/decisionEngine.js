import { GoogleGenAI, Type } from '@google/genai';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    coreSummary: { type: Type.STRING },
    optionA: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        pros: { type: Type.ARRAY, items: { type: Type.STRING } },
        cons: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['name', 'pros', 'cons']
    },
    optionB: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        pros: { type: Type.ARRAY, items: { type: Type.STRING } },
        cons: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['name', 'pros', 'cons']
    },
    blindSpot: { type: Type.STRING },
    objectiveRecommendation: { type: Type.STRING }
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
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${instructions}\n\nUSER DILEMMA:\n${rawDilemma}`,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema
    }
  });

  return JSON.parse(response.text);
}
