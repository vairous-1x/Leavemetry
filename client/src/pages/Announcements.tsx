import { useEffect, useState } from 'react';
import { holidaysApi } from '../lib/api';
import type { Holiday } from '../lib/api';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Announcements() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  useEffect(() => {
    holidaysApi.list().then(setHolidays).catch(() => setHolidays([]));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Announcements & Holidays</h2>
      <div className="space-y-3">
        {holidays.length === 0 && (
          <p className="text-gray-500">No announcements or holidays at the moment.</p>
        )}
        {holidays.map((h) => (
          <div key={h._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="font-medium text-gray-900">{h.name}</p>
            <p className="text-sm text-gray-500">{formatDate(h.from)} - {formatDate(h.to)} · {h.type || 'company'}</p>
            {h.comment && <p className="text-sm text-gray-600 mt-1">{h.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
