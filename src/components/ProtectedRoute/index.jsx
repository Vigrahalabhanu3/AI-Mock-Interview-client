// ============================================
// ProtectedRoute - Auth Guard Component
// ============================================
// Redirects to /login if user is not authenticated.
// Reference: useContext, Navigate - reference-react.md
// ============================================

import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { PageLoader } from '../common/Loading';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  // Show dots pulse loader while checking auth on page refresh
  if (loading) {
    return <PageLoader message="Verifying Session..." />;
  }

  // Redirect to login if not authenticated
  if (!user) return <Navigate to="/login" />;

  return <div className="protected-shell">{children}</div>;
}

export default ProtectedRoute;
