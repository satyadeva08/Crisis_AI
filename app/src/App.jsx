import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IncidentProvider } from './context/IncidentContext';

// User pages
import Landing from './pages/user/Landing';
import ReportEmergency from './pages/user/ReportEmergency';
import Processing from './pages/user/Processing';
import Success from './pages/user/Success';
import TrackStatus from './pages/user/TrackStatus';

// Authority pages
import Login from './pages/authority/Login';
import Dashboard from './pages/authority/Dashboard';
import IncidentDetails from './pages/authority/IncidentDetails';
import LiveMap from './pages/authority/LiveMap';
import Analytics from './pages/authority/Analytics';

/**
 * Route guard for authority pages.
 * Redirects to login if the user is not authenticated.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/authority/login" replace />;
  }

  return children;
}

/**
 * Root application component.
 * Sets up routing for both user and authority sides.
 */
function AppRoutes() {
  return (
    <Routes>
      {/* ── User Side ── */}
      <Route path="/" element={<Landing />} />
      <Route path="/report" element={<ReportEmergency />} />
      <Route path="/report/processing" element={<Processing />} />
      <Route path="/report/success" element={<Success />} />
      <Route path="/report/track" element={<TrackStatus />} />

      {/* ── Authority Side ── */}
      <Route path="/authority/login" element={<Login />} />
      <Route
        path="/authority/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authority/incidents/:id"
        element={
          <ProtectedRoute>
            <IncidentDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authority/map"
        element={
          <ProtectedRoute>
            <LiveMap />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authority/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* Fallback — redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <IncidentProvider>
          <AppRoutes />
        </IncidentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
