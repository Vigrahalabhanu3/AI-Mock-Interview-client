import { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthContext } from './context/AuthContext.jsx';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import InterviewSetupPage from './pages/InterviewSetupPage';
import InterviewPage from './pages/InterviewPage';
import FeedbackPage from './pages/FeedbackPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import { PageLoader } from './components/common/Loading';

/**
 * Smart Root Router Component
 * - If user is logged in: renders Dashboard (/ / /dashboard)
 * - If user is NOT logged in: renders public LandingPage
 */
function RootRoute() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <PageLoader message="Verifying Session..." />;
  }

  if (user) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <HomePage />
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return <LandingPage />;
}

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HomePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InterviewSetupPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <InterviewPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <FeedbackPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HistoryPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;