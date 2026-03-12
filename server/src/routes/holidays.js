import { Router } from 'express';
import Holiday from '../models/Holiday.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(auth);

// List holidays
router.get('/', async (req, res) => {
  try {
    const { year } = req.query;
    const filter = year ? { from: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } : {};
    const holidays = await Holiday.find(filter).sort({ from: 1 });
    res.json(holidays);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Create (admin only)
router.post('/', adminOnly, async (req, res) => {
  try {
    const { name, from, to, type, comment } = req.body;
    if (!name || !from || !to) return res.status(400).json({ message: 'Name, from and to required' });
    const holiday = await Holiday.create({
      name,
      from: new Date(from),
      to: new Date(to),
      type: type || 'company',
      comment: comment || '',
    });
    res.status(201).json(holiday);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Update (admin only)
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!holiday) return res.status(404).json({ message: 'Holiday not found' });
    res.json(holiday);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Delete (admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) return res.status(404).json({ message: 'Holiday not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
