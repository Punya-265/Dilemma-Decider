import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { analyzeDilemma } from './services/decisionEngine.js';
import authRoutes from './routes/auth.js';
import decisionRoutes from './routes/decisions.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20kb' }));
app.use('/api/auth', authRoutes);
app.use('/api/decisions', decisionRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'DilemmaDecider API' }));

app.post('/api/analyze', async (req, res) => {
  const rawDilemma = typeof req.body?.raw_dilemma === 'string' ? req.body.raw_dilemma.trim() : '';
  if (!rawDilemma) return res.status(400).json({ error: 'raw_dilemma is required.' });
  if (rawDilemma.length < 20) return res.status(400).json({ error: 'Please describe the dilemma in a little more detail.' });
  if (rawDilemma.length > 10000) return res.status(400).json({ error: 'Dilemma is too long. Keep it under 10,000 characters.' });
  try {
    const decision = await analyzeDilemma(rawDilemma);
    res.json(decision);
  } catch (error) {
    console.error('AI analysis failed:', error);
    const message = error?.message || 'Unknown AI error';
    res.status(500).json({ error: `AI analysis failed: ${message}` });
  }
});

async function start() {
  if (process.env.MONGODB_URI) await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => console.log(`DilemmaDecider API running on http://localhost:${port}`));
}
start().catch(error => { console.error('Startup failed:', error); process.exit(1); });
