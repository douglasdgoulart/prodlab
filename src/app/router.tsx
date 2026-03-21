import { createBrowserRouter } from 'react-router-dom';
import { Login } from '../pages/Login';
import { AuthCallback } from '../pages/AuthCallback';
import { Dashboard } from '../pages/Dashboard';
import { AdminDashboard } from '../pages/AdminDashboard';
import { Unauthorized } from '../pages/Unauthorized';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RoleRoute } from '../components/RoleRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRole="student">
          <Dashboard />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRole="teacher">
          <AdminDashboard />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
]);
