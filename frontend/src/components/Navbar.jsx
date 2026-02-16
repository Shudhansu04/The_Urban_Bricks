import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img src="/vite.svg" alt="Property Marketplace logo" className="navbar-logo" />
          <span>The Urban Bricks</span>
        </Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/blogs">Blog</Link>
          {user ? (
            <>
              <Link to="/submit">Submit Property</Link>
              {user.role === "ADMIN" && <Link to="/admin">Admin</Link>}
              <div className="user-menu">
                <button type="button" className="user-trigger" aria-label="User menu">
                  <img src="/dp.jpg" alt="User" className="user-avatar" />
                </button>
                <div className="user-dropdown">
                  <Link to="/profile">Edit Profile</Link>
                  <Link to="/my-properties">My Properties</Link>
                  <button type="button" onClick={handleLogout} className="dropdown-logout">
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup" className="btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
