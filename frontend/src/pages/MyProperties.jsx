import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { getImageUrl } from "../utils/api";
import "./MyProperties.css";

export default function MyProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      const res = await api.get("/properties");
      const allProperties = res.data.properties;
      const myProperties = allProperties.filter((p) => p.owner.id === user.id);
      setProperties(myProperties);
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      await api.delete(`/properties/${id}`);
      loadProperties();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete property");
    }
  }

  if (loading) {
    return <div className="loading">Loading your properties...</div>;
  }

  return (
    <div className="my-properties">
      <div className="page-header">
        <h1>My Properties</h1>
        <Link to="/submit" className="btn-primary">
          + Submit New Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="no-properties">
          <p>You haven't submitted any properties yet.</p>
          <Link to="/submit" className="btn-primary">
            Submit Your First Property
          </Link>
        </div>
      ) : (
        <div className="properties-list">
          {properties.map((property) => (
            <div key={property.id} className="property-item">
              {property.mediaUrls && property.mediaUrls.length > 0 ? (
                <img src={getImageUrl(property.mediaUrls[0])} alt={property.title} />
              ) : (
                <div className="no-image">No Image</div>
              )}
              <div className="property-item-content">
                <h3>
                  <Link to={`/properties/${property.id}`}>{property.title}</Link>
                </h3>
                <p className="property-location">{property.location}</p>
                <p className="property-price">₹{Number(property.price).toLocaleString('en-IN')}</p>
                <span className={`property-status status-${property.status.toLowerCase()}`}>
                  {property.status}
                </span>
              </div>
              <div className="property-item-actions">
                <Link to={`/properties/${property.id}`} className="btn-view">
                  View
                </Link>
                <button onClick={() => handleDelete(property.id)} className="btn-delete">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
