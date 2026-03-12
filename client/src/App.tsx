import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import DashboardHR from './pages/DashboardHR';
import DashboardEmployee from './pages/DashboardEmployee';
import Leaves from './pages/Leaves';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import Holidays from './pages/Holidays';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import MySpace from './pages/MySpace';
import Announcements from './pages/Announcements';

function Dashboard() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <DashboardHR /> : <DashboardEmployee />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute adminOnly>
            <Layout><Analytics /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute adminOnly>
            <Layout><Employees /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaves"
        element={
          <ProtectedRoute adminOnly>
            <Layout><Leaves /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/holidays"
        element={
          <ProtectedRoute>
            <Layout><Holidays /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Layout><Calendar /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-space"
        element={
          <ProtectedRoute>
            <Layout><MySpace /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <Layout><Announcements /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout><Settings /></Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
