import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGate from './components/RoleGate';

// Eager imports (avoid Suspense getting stuck)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import Employees from './pages/Employees';
import Lots from './pages/Lots';
import Production from './pages/Production';
import Salary from './pages/Salary';
import Users from './pages/Users';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';


// Small router that picks the right dashboard by role
import { useAuth } from './context/AuthContext';
function DashboardRouter() {
  const { user } = useAuth() || {};
  // If auth context hasn't loaded yet, render a tiny inline loader (not Suspense)
  if (!user) {
    return (
      <div className="min-h-dvh grid place-items-center px-4">
        <div className="w-full max-w-sm rounded-2xl border bg-white p-4 shadow-sm">
          <div className="h-4 w-24 rounded bg-gray-200 mb-3" />
          <div className="space-y-2">
            <div className="h-3 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-2/3 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }
  if (user.role === 'worker') return <WorkerDashboard />;
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard auto-switches by role */}
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* Admin only */}
          <Route
            path="/users"
            element={
              <RoleGate roles={['admin']}>
                <Users />
              </RoleGate>
            }
          />

          {/* Admin + Incharge */}
          <Route
            path="/employees"
            element={
              <RoleGate roles={['admin', 'incharge']}>
                <Employees />
              </RoleGate>
            }
          />
          <Route
            path="/salary"
            element={
              <RoleGate roles={['admin', 'incharge']}>
                <Salary />
              </RoleGate>
            }
          />

          {/* Admin + Supervisor + Incharge */}
          <Route
            path="/lots"
            element={
              <RoleGate roles={['admin', 'supervisor', 'incharge']}>
                <Lots />
              </RoleGate>
            }
          />
          <Route
            path="/production"
            element={
              <RoleGate roles={['admin', 'supervisor', 'incharge']}>
                <Production />
              </RoleGate>
            }
          />

<Route path="/profile" element={<Profile />} />


        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
