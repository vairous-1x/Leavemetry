import { useEffect, useState } from 'react';
import { statsApi } from '../lib/api';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Analytics() {
  const [data, setData] = useState<{ year: number; byMonth: { month: number; approved: number; rejected: number; pending: number }[] } | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    statsApi.byMonth(year).then(setData).catch(() => setData(null));
  }, [year]);

  if (!data) return <div className="text-gray-500">Loading...</div>;

  const maxVal = Math.max(
    ...data.byMonth.flatMap((m) => [m.approved, m.rejected, m.pending]),
    1
  );

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Number of Leave Requests by Month</h2>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-6">
          <span className="flex items-center gap-2 text-sm">
            <span className="w-4 h-0.5 bg-green-500" /> Approved
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="w-4 h-0.5 bg-red-500" /> Rejected
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="w-4 h-0.5 bg-amber-500" /> Waiting for Approval
          </span>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
        >
          {[year - 2, year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
        <div className="flex items-end gap-2 h-64">
          {data.byMonth.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 justify-center items-end h-48">
                <div
                  className="flex-1 bg-green-500 rounded-t min-h-[2px]"
                  style={{ height: `${(m.approved / maxVal) * 100}%` }}
                  title={`Approved: ${m.approved}`}
                />
                <div
                  className="flex-1 bg-red-500 rounded-t min-h-[2px]"
                  style={{ height: `${(m.rejected / maxVal) * 100}%` }}
                  title={`Rejected: ${m.rejected}`}
                />
                <div
                  className="flex-1 bg-amber-500 rounded-t min-h-[2px]"
                  style={{ height: `${(m.pending / maxVal) * 100}%` }}
                  title={`Pending: ${m.pending}`}
                />
              </div>
              <span className="text-xs text-gray-500">{MONTHS[m.month - 1]?.slice(0, 3)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>0</span>
          <span>{maxVal}</span>
        </div>
      </div>
    </div>
  );
}
