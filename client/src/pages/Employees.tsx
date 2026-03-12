import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../lib/api';
import type { User } from '../lib/api';

export default function Employees() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', position: '', department: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    usersApi.list().then(setUsers).catch(() => setUsers([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await usersApi.create(form);
      setForm({ username: '', email: '', password: '', position: '', department: '' });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Employees</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Add employee
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-gray-50 rounded-xl max-w-md space-y-3">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
          <input
            placeholder="Position"
            value={form.position}
            onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
              Save
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Position</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                      {u.username?.[0]?.toUpperCase()}
                    </div>
                    {u.username}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">{u.position || '-'}</td>
                <td className="px-4 py-3">{u.department || '-'}</td>
                <td className="px-4 py-3">
                  <Link to={`/employees/${u._id}`} className="text-blue-600 text-sm hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="px-4 py-6 text-gray-500 text-center">No employees yet.</p>
        )}
      </div>
    </div>
  );
}
