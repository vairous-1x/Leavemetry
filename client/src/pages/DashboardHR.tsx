import { useEffect, useState } from 'react';
import { statsApi } from '../lib/api';
import type { DashboardStats, Leave } from '../lib/api';

const statusLabels: Record<string, string> = {
  pending: 'Waiting for HR approval',
  approved: 'Approved',
  rejected: 'Rejected',
};
const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
};
const typeColors: Record<string, string> = {
  Sick: 'bg-pink-500',
  Vacation: 'bg-orange-500',
  Personal: 'bg-blue-500',
  Urgent: 'bg-orange-500',
  'Annual Leave': 'bg-green-500',
  'Maternity Leave': 'bg-purple-500',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function DashboardHR() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.dashboard().then((r) => {
      setData(r as DashboardStats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const cards = [
    { label: 'Employee in Vacation', value: data.employeeInVacation, icon: '👤', bg: 'bg-orange-100', iconBg: 'bg-orange-500' },
    { label: 'Employee in Office', value: data.employeeInOffice, icon: '⚡', bg: 'bg-purple-100', iconBg: 'bg-purple-500' },
    { label: 'Total Leave Requested', value: data.totalLeaveRequested, icon: '📅', bg: 'bg-blue-100', iconBg: 'bg-blue-500' },
    { label: 'Pending leaves', value: data.pendingLeaves, sub: 'Waiting for HR approval', icon: '🔔', bg: 'bg-amber-100', iconBg: 'bg-amber-500' },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">This month Analytics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`${c.bg} rounded-xl p-4 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-full ${c.iconBg} flex items-center justify-center text-white text-lg`}>
              {c.icon}
            </div>
            <div>
              <p className="text-gray-600 text-sm">{c.label}</p>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              {c.sub && <p className="text-xs text-gray-500">{c.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Last Leaves Request</h2>
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(data.lastLeaves || []).map((leave: Leave) => (
              <tr key={leave._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                      {typeof leave.user !== 'string' && leave.user?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    {typeof leave.user !== 'string' && leave.user?.username}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block w-2 h-2 rounded-full ${typeColors[leave.type] || 'bg-gray-400'} mr-2`} />
                  {leave.type}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(leave.from)} - {formatDate(leave.to)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[leave.status]}`}>
                    {statusLabels[leave.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!data.lastLeaves || data.lastLeaves.length === 0) && (
          <p className="px-4 py-6 text-gray-500 text-center">No leave requests yet.</p>
        )}
      </div>
    </div>
  );
}
