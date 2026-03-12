import { useEffect, useState } from 'react';
import { leavesApi } from '../lib/api';
import type { Leave } from '../lib/api';

const TABS = [
  { id: 'pending', label: 'Waiting for HR approval', color: 'bg-amber-500' },
  { id: 'approved', label: 'Approved', color: 'bg-green-500' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-500' },
] as const;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Leaves() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    leavesApi.list().then(setLeaves).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = leaves.filter((l) => l.status === tab);

  const handleApprove = async (id: string) => {
    setActioning(id);
    try {
      await leavesApi.updateStatus(id, 'approved');
      load();
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Rejection reason (optional):');
    if (reason === null) return;
    setActioning(id);
    try {
      await leavesApi.updateStatus(id, 'rejected', reason);
      load();
    } finally {
      setActioning(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Leave Requests</h2>
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === t.id ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">From - To</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
            ) : (
              filtered.map((leave) => (
                <tr key={leave._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                        {typeof leave.user !== 'string' && leave.user?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{typeof leave.user !== 'string' && leave.user?.username}</p>
                        <p className="text-xs text-gray-500">{typeof leave.user !== 'string' && leave.user?.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(leave.from)} - {formatDate(leave.to)}
                  </td>
                  <td className="px-4 py-3">{leave.type}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5`}>
                      <span className={`w-2 h-2 rounded-full ${
                        leave.status === 'approved' ? 'bg-green-500' :
                        leave.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                      }`} />
                      {leave.status === 'pending' && 'Waiting for HR approval'}
                      {leave.status === 'approved' && 'Approved'}
                      {leave.status === 'rejected' && 'Rejected'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {leave.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(leave._id)}
                          disabled={actioning === leave._id}
                          className="text-green-600 text-sm font-medium hover:underline disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(leave._id)}
                          disabled={actioning === leave._id}
                          className="text-red-600 text-sm font-medium hover:underline disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {leave.status === 'rejected' && leave.rejectionReason && (
                      <span className="text-xs text-gray-500">{leave.rejectionReason}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <p className="px-4 py-6 text-gray-500 text-center">No requests in this category.</p>
        )}
      </div>
    </div>
  );
}
