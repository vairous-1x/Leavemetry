import { Router } from 'express';
import Leave from '../models/Leave.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(auth);

// List leaves: admin sees all, employee sees own
router.get('/', async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const leaves = await Leave.find(filter).populate('user', 'username email position').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Create leave request
router.post('/', async (req, res) => {
  try {
    const { type, description, from, to } = req.body;
    if (!type || !from || !to) {
      return res.status(400).json({ message: 'Type, from and to dates required' });
    }
    const leave = await Leave.create({
      user: req.user._id,
      type,
      description: description || '',
      from: new Date(from),
      to: new Date(to),
    });
    await leave.populate('user', 'username email position');
    res.status(201).json(leave);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Approve/Reject (admin only)
router.patch('/:id', adminOnly, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason: rejectionReason || '' },
      { new: true }
    ).populate('user', 'username email position');
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    res.json(leave);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
