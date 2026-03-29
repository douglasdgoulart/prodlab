import { createBrowserRouter } from 'react-router-dom';
import { Login } from '../pages/Login';
import { AuthCallback } from '../pages/AuthCallback';
import { Dashboard } from '../pages/Dashboard';
import { AdminDashboard } from '../pages/AdminDashboard';
import { Unauthorized } from '../pages/Unauthorized';
import { GroupRegistration } from '../pages/GroupRegistration';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RoleRoute } from '../components/RoleRoute';
import { GroupRoute } from '../components/GroupRoute';
import { WaitingForClassPage } from '../pages/WaitingForClassPage';

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
    path: '/waiting',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRole="student">
          <WaitingForClassPage />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRole="student">
          <GroupRegistration />
        </RoleRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRole="student">
          <GroupRoute>
            <Dashboard />
          </GroupRoute>
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
