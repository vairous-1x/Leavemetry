import { useEffect, useState } from 'react';
import { holidaysApi } from '../lib/api';
import type { Holiday } from '../lib/api';

export default function Calendar() {
  const [date, setDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    holidaysApi.list(date.year).then(setHolidays).catch(() => setHolidays([]));
  }, [date.year]);

  const firstDay = new Date(date.year, date.month, 1).getDay();
  const daysInMonth = new Date(date.year, date.month + 1, 0).getDate();
  const today = new Date();
  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === date.month && today.getFullYear() === date.year;

  const getHoliday = (day: number) => {
    const d = new Date(date.year, date.month, day);
    return holidays.find(
      (h) => d >= new Date(h.from) && d <= new Date(h.to)
    );
  };

  const monthName = new Date(date.year, date.month).toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Calendar</h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-green-200" /> Non-working (company)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-red-200" /> Company holidays
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-amber-200" /> Today
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDate((d) => (d.month === 0 ? { year: d.year - 1, month: 11 } : { ...d, month: d.month - 1 }))}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              ←
            </button>
            <span className="font-medium min-w-[140px] text-center">{monthName}</span>
            <button
              onClick={() => setDate((d) => (d.month === 11 ? { year: d.year + 1, month: 0 } : { ...d, month: d.month + 1 }))}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              →
            </button>
          </div>
        </div>
      </div>
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50">
          {weekDays.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-sm font-medium text-gray-600">
              {d}
            </div>
          ))}
          {Array.from({ length: startOffset }, (_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] p-2 border-t border-gray-200" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const h = getHoliday(day);
            const todayClass = isToday(day) ? 'bg-amber-200' : '';
            const holidayClass = h ? (h.type === 'company' ? 'bg-red-100' : 'bg-green-100') : '';
            return (
              <div
                key={day}
                className={`min-h-[80px] p-2 border-t border-l border-gray-200 ${todayClass} ${holidayClass}`}
              >
                <span className="text-sm font-medium">{day}</span>
                {h && <p className="text-xs text-gray-600 truncate" title={h.name}>{h.name}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
