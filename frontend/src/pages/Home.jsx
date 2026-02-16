import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api, { getImageUrl } from "../utils/api";
import "./Home.css";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: "",
    state: "",
    minPrice: "",
    maxPrice: "",
    search: "",
  });

  useEffect(() => {
    loadProperties();
  }, [filters]);

  async function loadProperties() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("status", "APPROVED");
      if (filters.city) params.append("city", filters.city);
      if (filters.state) params.append("state", filters.state);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.search) params.append("search", filters.search);

      const res = await api.get(`/properties?${params.toString()}`);
      setProperties(res.data.properties);
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home">
      <div className="hero">
        <h1>Find Your Dream Property</h1>
        <p>Browse thousands of properties for sale</p>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by title, location..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <input
          type="text"
          placeholder="City"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        />
        <input
          type="text"
          placeholder="State"
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
        />
        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
        />
      </div>

      {loading ? (
        <div className="loading">Loading properties...</div>
      ) : (
        <div className="properties-grid">
          {properties.length === 0 ? (
            <p className="no-results">No properties found</p>
          ) : (
            properties.map((property) => (
              <Link
                key={property.id}
                to={`/properties/${property.id}`}
                className="property-card"
              >
                {property.mediaUrls && property.mediaUrls.length > 0 ? (
                  <img
                    src={getImageUrl(property.mediaUrls[0])}
                    alt={property.title}
                    className="property-image"
                  />
                ) : (
                  <div className="property-image-placeholder">No Image</div>
                )}
                <div className="property-info">
                  <h3>{property.title}</h3>
                  <p className="property-location">{property.location}</p>
                  <p className="property-price">₹{Number(property.price).toLocaleString('en-IN')}</p>
                  <span className={`property-status status-${property.status.toLowerCase()}`}>
                    {property.status}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
