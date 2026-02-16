import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api, { getImageUrl } from "../utils/api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [pendingRes, statsRes] = await Promise.all([
        api.get("/admin/pending"),
        api.get("/admin/stats"),
      ]);
      setPending(pendingRes.data.properties);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      if (err.response?.status === 403) {
        alert("Access Denied: You need ADMIN role to access this page.");
      } else if (err.response?.status === 401) {
        alert("Please login to access admin dashboard.");
      } else {
        alert("Failed to load admin data. Please check console for details.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(id, status) {
    try {
      await api.put(`/admin/properties/${id}/status`, { status });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <Link to="/admin/blogs" className="btn-primary">
            Manage Blogs
          </Link>
          <Link to="/admin/projects" className="btn-primary">
            Manage Projects
          </Link>
        </div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Properties</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
          <div className="stat-card stat-pending">
            <h3>Pending Review</h3>
            <p className="stat-number">{stats.pending}</p>
          </div>
          <div className="stat-card stat-approved">
            <h3>Approved</h3>
            <p className="stat-number">{stats.approved}</p>
          </div>
          <div className="stat-card stat-sold">
            <h3>Sold</h3>
            <p className="stat-number">{stats.sold}</p>
          </div>
        </div>
      )}

      <div className="pending-section">
        <h2>Pending Properties ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="no-pending">No pending properties</p>
        ) : (
          <div className="pending-list">
            {pending.map((property) => (
              <div key={property.id} className="pending-item">
                {property.mediaUrls && property.mediaUrls.length > 0 ? (
                  <img src={getImageUrl(property.mediaUrls[0])} alt={property.title} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
                <div className="pending-item-content">
                  <h3>
                    <Link to={`/properties/${property.id}`}>{property.title}</Link>
                  </h3>
                  <p className="property-location">{property.location}</p>
                  <p className="property-price">₹{Number(property.price).toLocaleString('en-IN')}</p>
                  <p className="property-owner">
                    Owner: {property.owner.name} ({property.owner.email})
                  </p>
                  <p className="property-date">
                    Submitted: {new Date(property.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="pending-item-actions">
                  <button
                    onClick={() => handleStatusUpdate(property.id, "APPROVED")}
                    className="btn-approve"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(property.id, "REJECTED")}
                    className="btn-reject"
                  >
                    Reject
                  </button>
                  <Link to={`/properties/${property.id}`} className="btn-view">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
