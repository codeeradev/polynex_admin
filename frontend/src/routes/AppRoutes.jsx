import { Routes, Route } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import ProtectedRoute from './ProtectedRoute';
import DashboardPage from '../pages/DashboardPage';
import Login from '../pages/Login';
import SetPassword from '../pages/SetPassword';
import AdminsPage from '../pages/AdminsPage';
import ElectionsPage from '../pages/ElectionsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - no AppShell, no auth check */}
      <Route path="/login" element={<Login />} />
      <Route path="/set-password" element={<SetPassword />} />

      {/* Protected routes - wrapped in AppShell + auth check */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* SuperAdmin-only routes */}
      <Route
        path="/admins"
        element={
          <ProtectedRoute roles={['SuperAdmin']}>
            <AppShell>
              <AdminsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/elections"
        element={
          <ProtectedRoute roles={['SuperAdmin']}>
            <AppShell>
              <ElectionsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
