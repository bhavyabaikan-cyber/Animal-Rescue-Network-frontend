import { Navigate } from "react-router-dom";
import { useAuth } from "../store/authStore";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <p className="text-[#6e6e73] text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    // If not logged in, redirect to home (which will open the login popup)
    return <Navigate to="/" replace />;
  }

  // If a specific role is required and the user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}