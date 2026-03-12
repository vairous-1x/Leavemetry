import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ResetCode from '../models/ResetCode.js';
import { auth } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'leavemetry-secret';

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    const u = user.toObject();
    delete u.password;
    res.json({ token, user: u });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Forgot password - send code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account with this email' });
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    await ResetCode.deleteMany({ email });
    await ResetCode.create({ email, code, expiresAt: new Date(Date.now() + 15 * 60 * 1000) });
    // In production: send email via Mailtrap/nodemailer. For demo we log it.
    console.log('Reset code for', email, ':', code);
    res.json({ message: 'Verification code sent to your email' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Verify code
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email and code required' });
    const rec = await ResetCode.findOne({ email, code });
    if (!rec) return res.status(400).json({ message: 'Invalid or expired code' });
    if (new Date() > rec.expiresAt) {
      await ResetCode.deleteOne({ _id: rec._id });
      return res.status(400).json({ message: 'Code expired' });
    }
    res.json({ message: 'Code valid', tempToken: jwt.sign({ email, code }, JWT_SECRET, { expiresIn: '10m' }) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Reset password (after code verified)
router.post('/reset-password', async (req, res) => {
  try {
    const { tempToken, newPassword } = req.body;
    if (!tempToken || !newPassword) return res.status(400).json({ message: 'Token and new password required' });
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    const rec = await ResetCode.findOne({ email: decoded.email, code: decoded.code });
    if (!rec) return res.status(400).json({ message: 'Session expired' });
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = newPassword;
    await user.save();
    await ResetCode.deleteMany({ email: decoded.email });
    res.json({ message: 'Password reset successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Me
router.get('/me', auth, (req, res) => {
  res.json(req.user);
});

export default router;
