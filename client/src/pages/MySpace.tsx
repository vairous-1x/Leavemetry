import { useEffect, useState } from 'react';
import { leavesApi } from '../lib/api';
import type { Leave } from '../lib/api';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function MySpace() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leavesApi.list().then(setLeaves).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">My Leave History</h2>
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">From - To</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaves.map((l) => (
              <tr key={l._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{l.type}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(l.from)} - {formatDate(l.to)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[l.status]}`}>
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leaves.length === 0 && (
          <p className="px-4 py-6 text-gray-500 text-center">No leave requests yet.</p>
        )}
      </div>
    </div>
  );
}
