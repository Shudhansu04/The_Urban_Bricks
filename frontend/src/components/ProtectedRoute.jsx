import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== "ADMIN") {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Access Denied</h2>
        <p>You need ADMIN role to access this page.</p>
        <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "1rem" }}>
          To become an admin, run: <code>npm run make-admin your-email@example.com</code> in the backend directory.
        </p>
      </div>
    );
  }

  return children;
}
