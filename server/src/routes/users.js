import { Router } from 'express';
import User from '../models/User.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(auth);

// List employees (admin only)
router.get('/', adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'employee' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get one user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Create employee (admin only)
router.post('/', adminOnly, async (req, res) => {
  try {
    const { username, email, password, position, department } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already used' });
    const user = await User.create({
      username,
      email,
      password,
      role: 'employee',
      position: position || '',
      department: department || '',
    });
    const u = user.toObject();
    delete u.password;
    res.status(201).json(u);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const allowed = isAdmin
      ? ['username', 'email', 'position', 'department']
      : ['username'];
    const updates = {};
    for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    Object.assign(user, updates);
    if (req.body.password && isAdmin) user.password = req.body.password;
    await user.save();
    const updated = await User.findById(req.params.id).select('-password');
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Delete employee (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
