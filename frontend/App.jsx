import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from './src/context/AuthContext';
import Navbar          from './src/components/common/layout/Navbar';
import Sidebar         from './src/components/common/layout/Sidebar';
import LandingPage     from './src/pages/LandingPage';
import LoginPage       from './src/pages/LoginPage';
import SignupPage      from './src/pages/SignupPAge';
import DashboardPage   from './src/pages/DashboardPage';
import WorkspacePage   from './src/pages/WorkspacePage';
import LiveTaskPage    from './src/pages/LiveTaskPage';
import ProfilePage     from './src/pages/ProfilePage';
import Loader          from './src/components/common/Loader';
import CommandPalette  from './src/components/common/CommandPalette';
import HelpRobotChatbot from './src/components/common/HelpRobotChatbot';

/* ─── Protected layout (Sidebar + Navbar) ── */
function ProtectedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        {children}
      </div>
    </div>
  );
}

/* ─── DEV ONLY: set true to skip auth and preview all pages ── */
const DEV_BYPASS = false;

/* ─── Guard: redirect to /login if not authed ── */
function ProtectedRoute({ children }) {
  const { token, loading } = useContext(AuthContext);
  if (DEV_BYPASS) return <ProtectedLayout>{children}</ProtectedLayout>;
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Loader />
    </div>
  );
  if (!token) return <Navigate to="/login" replace />;
  return <ProtectedLayout>{children}</ProtectedLayout>;
}

/* ─── Guard: redirect to /dashboard if already authed ── */
function PublicRoute({ children }) {
  const { token, loading } = useContext(AuthContext);
  if (loading) return null;
  if (token)   return <Navigate to="/dashboard" replace />;
  return children;
}

/* ─── App ── */
export default function App() {
  return (
    <>
      <Routes>
        {/* Public — Landing */}
        <Route path="/"       element={<LandingPage />} />

        {/* Public — Auth (redirect to dashboard if already logged in) */}
        <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

        {/* Protected — App pages */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/workspace/:id"
          element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>}
        />
        <Route
          path="/workspace/:workspaceId/task/:taskId"
          element={<ProtectedRoute><LiveTaskPage /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CommandPalette />
      <HelpRobotChatbot />
    </>
  );
}

