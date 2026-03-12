import React, { useEffect, useState } from 'react';
import { statsApi, leavesApi } from '../lib/api';
import type { EmployeeBalance } from '../lib/api';

const LEAVE_TYPES = ['Sick', 'Vacation', 'Personal', 'Urgent', 'Annual Leave'];

export default function DashboardEmployee() {
  const [balance, setBalance] = useState<EmployeeBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ type: '', description: '', from: '', to: '' });

  useEffect(() => {
    statsApi.dashboard().then((r) => {
      setBalance(r as EmployeeBalance);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const daysBetween = () => {
    if (!form.from || !form.to) return 0;
    const a = new Date(form.from);
    const b = new Date(form.to);
    return Math.ceil((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.type || !form.from || !form.to) {
      setError('Please fill type and dates');
      return;
    }
    setSubmitting(true);
    try {
      await leavesApi.create({
        type: form.type,
        description: form.description,
        from: form.from,
        to: form.to,
      });
      setSuccess('Leave request submitted successfully.');
      setForm({ type: '', description: '', from: '', to: '' });
      const b = await statsApi.dashboard() as EmployeeBalance;
      setBalance(b);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !balance) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const cards = [
    { label: 'Sick Leave', value: `${balance.sickLeave.used}/${balance.sickLeave.total} Days`, icon: '🩺', bg: 'bg-red-100', iconBg: 'bg-red-500' },
    { label: 'Vacation Leave', value: `${balance.vacationLeave.used}/${balance.vacationLeave.total} Days`, icon: '☀️', bg: 'bg-orange-100', iconBg: 'bg-orange-500' },
    { label: 'Personal Leave', value: `${balance.personalLeave.used}/${balance.personalLeave.total} Days`, icon: '👤', bg: 'bg-purple-100', iconBg: 'bg-purple-500' },
  ];

  const days = daysBetween();

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">My Leave Balance</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`${c.bg} rounded-xl p-4 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-full ${c.iconBg} flex items-center justify-center text-white text-lg`}>
              {c.icon}
            </div>
            <div>
              <p className="text-gray-600 text-sm">{c.label}</p>
              <p className="text-xl font-bold text-gray-900">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Ask for Leave</h2>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4 bg-gray-50 rounded-xl p-6">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type of leave</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
            <option value="">Select the leave type</option>
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            rows={3}
            placeholder="Add comments about your leave"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={form.from}
              onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={form.to}
              onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {days > 0 ? `Apply For ${days} Days Leave` : 'Apply For Leave'}
        </button>
      </form>
    </div>
  );
}
