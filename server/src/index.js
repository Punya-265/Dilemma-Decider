import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { analyzeDilemma } from './services/decisionEngine.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'DilemmaDecider API' });
});

app.post('/api/analyze', async (req, res) => {
  const rawDilemma = typeof req.body?.raw_dilemma === 'string'
    ? req.body.raw_dilemma.trim()
    : '';

  if (!rawDilemma) {
    return res.status(400).json({ error: 'raw_dilemma is required.' });
  }

  if (rawDilemma.length < 20) {
    return res.status(400).json({ error: 'Please describe the dilemma in a little more detail.' });
  }

  if (rawDilemma.length > 10000) {
    return res.status(400).json({ error: 'Dilemma is too long. Keep it under 10,000 characters.' });
  }

  try {
    const decision = await analyzeDilemma(rawDilemma);
    res.json(decision);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to analyze the dilemma right now.' });
  }
});

app.listen(port, () => {
  console.log(`DilemmaDecider API running on http://localhost:${port}`);
});
