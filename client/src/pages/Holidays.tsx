import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { holidaysApi } from '../lib/api';
import type { Holiday } from '../lib/api';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Holidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', from: '', to: '', type: 'company', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const load = () => {
    setLoading(true);
    holidaysApi.list().then(setHolidays).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.from || !form.to) return;
    setSubmitting(true);
    try {
      await holidaysApi.create(form);
      setForm({ name: '', from: '', to: '', type: 'company', comment: '' });
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this holiday?')) return;
    try {
      await holidaysApi.delete(id);
      load();
    } catch {}
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Holiday system {new Date().getFullYear()}</h2>
      {isAdmin && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3 max-w-2xl">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Holiday name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="company">Company</option>
                <option value="employee">Employee</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={form.from}
                onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={form.to}
                onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <input
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Add New Holiday
          </button>
        </form>
      )}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="px-4 py-3 font-medium">Holiday Name</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Comment</th>
              {isAdmin && <th className="px-4 py-3 font-medium">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
            ) : (
              holidays.map((h) => (
                <tr key={h._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{h.name}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(h.from)} - {formatDate(h.to)}</td>
                  <td className="px-4 py-3">{h.type || 'company'}</td>
                  <td className="px-4 py-3 text-gray-500">{h.comment || '-'}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(h._id)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && holidays.length === 0 && (
          <p className="px-4 py-6 text-gray-500 text-center">No holidays defined.</p>
        )}
      </div>
    </div>
  );
}
