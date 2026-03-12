import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminNav = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/analytics', label: 'Analytics', icon: '📊' },
  { to: '/employees', label: 'Employees', icon: '👥' },
  { to: '/leaves', label: 'Leaves', icon: '📄' },
  { to: '/holidays', label: 'Announcements', icon: '📢' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

const employeeNav = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/my-space', label: 'My Space', icon: '⭐' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/announcements', label: 'Announcements', icon: '📢' },
  { to: '/settings', label: 'User Settings', icon: '⚙️' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const nav = user?.role === 'admin' ? adminNav : employeeNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-sidebar text-white flex flex-col shrink-0">
        <div className="p-5 font-semibold text-lg border-b border-gray-600">
          Leavemetry.
        </div>
        <nav className="flex-1 py-4">
          {nav.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm ${
                location.pathname === to
                  ? 'bg-sidebarHover border-l-4 border-white'
                  : 'hover:bg-sidebarHover'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-sidebarHover text-left"
        >
          <span>🚪</span>
          Log out
        </button>
      </aside>
      <main className="flex-1 overflow-auto p-6 bg-white rounded-l-lg shadow-sm">
        {children}
      </main>
    </div>
  );
}
