import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

function tokenFor(user) {
  return jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      return res.status(400).json({ error: 'Name, email and a password of at least 8 characters are required.' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email, passwordHash });
    res.status(201).json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Could not create account.' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    res.json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Could not sign in.' }); }
});

export default router;
