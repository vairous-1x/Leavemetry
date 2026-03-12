import { Router } from 'express';
import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(auth);

// Dashboard stats (admin: company-wide; employee: own balance placeholder)
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    if (req.user.role === 'admin') {
      const [inVacation, totalEmployees, totalRequested, pending] = await Promise.all([
        Leave.countDocuments({ status: 'approved', from: { $lte: endOfMonth }, to: { $gte: startOfMonth } }),
        User.countDocuments({ role: 'employee' }),
        Leave.countDocuments({ from: { $gte: startOfMonth }, to: { $lte: endOfMonth } }),
        Leave.countDocuments({ status: 'pending' }),
      ]);
      const inOffice = Math.max(0, totalEmployees - inVacation);
      const lastLeaves = await Leave.find({}).populate('user', 'username').sort({ createdAt: -1 }).limit(5);
      return res.json({
        employeeInVacation: inVacation,
        employeeInOffice: Math.max(0, inOffice),
        totalLeaveRequested: totalRequested,
        pendingLeaves: pending,
        lastLeaves: lastLeaves,
      });
    }

    // Employee: leave balance (simplified: 30 days per type, minus used)
    const sickUsed = await Leave.countDocuments({ user: req.user._id, type: 'Sick', status: 'approved' });
    const vacationUsed = await Leave.countDocuments({ user: req.user._id, type: { $in: ['Vacation', 'Annual Leave'] }, status: 'approved' });
    const personalUsed = await Leave.countDocuments({ user: req.user._id, type: 'Personal', status: 'approved' });
    const totalDays = (arr) => arr.reduce((s, l) => s + Math.ceil((new Date(l.to) - new Date(l.from)) / (24 * 60 * 60 * 1000)) + 1, 0);
    const leaves = await Leave.find({ user: req.user._id, status: 'approved' });
    const sickDays = totalDays(leaves.filter(l => l.type === 'Sick'));
    const vacationDays = totalDays(leaves.filter(l => ['Vacation', 'Annual Leave'].includes(l.type)));
    const personalDays = totalDays(leaves.filter(l => l.type === 'Personal'));
    res.json({
      sickLeave: { used: sickDays, total: 30 },
      vacationLeave: { used: vacationDays, total: 30 },
      personalLeave: { used: personalDays, total: 30 },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Monthly stats for chart (admin only)
router.get('/by-month', adminOnly, async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const result = await Leave.aggregate([
      { $match: { from: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
      { $group: { _id: { month: { $month: '$from' }, status: '$status' }, count: { $sum: 1 } } },
    ]);
    const byMonth = {};
    for (let m = 1; m <= 12; m++) byMonth[m] = { approved: 0, rejected: 0, pending: 0 };
    result.forEach(r => {
      if (byMonth[r._id.month]) byMonth[r._id.month][r._id.status] = r.count;
    });
    res.json({ year, byMonth: Object.keys(byMonth).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)).map(m => ({ month: parseInt(m, 10), ...byMonth[m] })) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
