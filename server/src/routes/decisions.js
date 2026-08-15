import { Router } from 'express';
import Decision from '../models/Decision.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const decisions = await Decision.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json(decisions);
  } catch { res.status(500).json({ error: 'Could not load decision history.' }); }
});

router.post('/', async (req, res) => {
  try {
    const { rawDilemma, result } = req.body;
    if (!rawDilemma || !result) return res.status(400).json({ error: 'rawDilemma and result are required.' });
    const decision = await Decision.create({ user: req.user.id, rawDilemma, result });
    res.status(201).json(decision);
  } catch { res.status(500).json({ error: 'Could not save decision.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Decision.deleteOne({ _id: req.params.id, user: req.user.id });
    res.status(204).end();
  } catch { res.status(500).json({ error: 'Could not delete decision.' }); }
});

export default router;
