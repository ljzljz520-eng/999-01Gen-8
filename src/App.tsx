import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import Layout from './components/Layout.js';
import Login from './pages/Login.js';
import ParentHome from './pages/ParentHome.js';
import ParentOrders from './pages/ParentOrders.js';
import PickupCode from './pages/PickupCode.js';
import ScanPage from './pages/ScanPage.js';
import ExceptionPage from './pages/ExceptionPage.js';
import TeacherHome from './pages/TeacherHome.js';
import FinanceHome from './pages/FinanceHome.js';
import type { UserRole } from '../shared/types.js';

function ProtectedRoute({ children, requiredRoles }: { children: React.ReactNode; requiredRoles?: UserRole[] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function RoleRedirect() {
  const { user } = useAuthStore();
  
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'parent':
      return <Navigate to="/parent" replace />;
    case 'distributor':
      return <Navigate to="/scan" replace />;
    case 'teacher':
      return <Navigate to="/teacher" replace />;
    case 'finance':
      return <Navigate to="/finance" replace />;
    case 'admin':
      return <Navigate to="/scan" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleRedirect />
              </ProtectedRoute>
            }
          />

          <Route
            path="/parent"
            element={
              <ProtectedRoute requiredRoles={['parent']}>
                <ParentHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/parent/orders"
            element={
              <ProtectedRoute requiredRoles={['parent']}>
                <ParentOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pickup/:orderId"
            element={
              <ProtectedRoute requiredRoles={['parent', 'admin']}>
                <PickupCode />
              </ProtectedRoute>
            }
          />

          <Route
            path="/scan"
            element={
              <ProtectedRoute requiredRoles={['distributor', 'admin']}>
                <ScanPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exception"
            element={
              <ProtectedRoute requiredRoles={['distributor', 'admin']}>
                <ExceptionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher"
            element={
              <ProtectedRoute requiredRoles={['teacher', 'admin']}>
                <TeacherHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/finance"
            element={
              <ProtectedRoute requiredRoles={['finance', 'admin']}>
                <FinanceHome />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
