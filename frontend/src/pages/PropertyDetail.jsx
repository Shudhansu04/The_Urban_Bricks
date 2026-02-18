import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { getImageUrl } from "../utils/imageUrl";
import "./PropertyDetail.css";

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [leadType, setLeadType] = useState("");
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState("");

  useEffect(() => {
    loadProperty();
  }, [id]);

  useEffect(() => {
    if (user) {
      setLeadForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  async function loadProperty() {
    try {
      const res = await api.get(`/properties/${id}`);
      setProperty(res.data.property);
    } catch (err) {
      console.error("Failed to load property:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleInquiry(e) {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/inquiries", {
        propertyId: id,
        message: inquiryMessage,
      });
      alert("Inquiry submitted successfully!");
      setInquiryMessage("");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit inquiry");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLeadSubmit(e) {
    e.preventDefault();
    if (!leadType) {
      return;
    }
    setLeadSubmitting(true);
    setLeadSuccess("");
    try {
      await api.post("/leads", {
        propertyId: id,
        type: leadType,
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone,
        message: leadForm.message,
      });
      setLeadSuccess("Thank you for your interest our executive will contact you within 24 hours.");
      setLeadForm((prev) => ({
        ...prev,
        message: "",
      }));
      setLeadType("");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit request");
    } finally {
      setLeadSubmitting(false);
    }
  }

  if (loading) {
    return <div className="loading">Loading property...</div>;
  }

  if (!property) {
    return <div className="error">Property not found</div>;
  }

  return (
    <div className="property-detail">
      <div className="property-detail-main">
        <div className="property-images">
          {property.mediaUrls && property.mediaUrls.length > 0 ? (
            property.mediaUrls.map((url, idx) => (
              <img key={idx} src={getImageUrl(url)} alt={`${property.title} ${idx + 1}`} />
            ))
          ) : (
            <div className="no-image">No images available</div>
          )}
        </div>

        <div className="property-content">
          <h1>{property.title}</h1>
          <p className="property-price">₹{Number(property.price).toLocaleString('en-IN')}</p>
          <p className="property-location">📍 {property.location}</p>
          {property.city && property.state && (
            <p className="property-city-state">
              {property.city}, {property.state}
            </p>
          )}
          <span className={`property-status status-${property.status.toLowerCase()}`}>
            {property.status}
          </span>

          <div className="property-description">
            <h2>Description</h2>
            <p>{property.description}</p>
          </div>

          <div className="property-owner">
            <h3>Owner Information</h3>
            <p>Name: {property.owner.name}</p>
            <p>Email: {property.owner.email}</p>
            {property.owner.phone && <p>Phone: {property.owner.phone}</p>}
          </div>
        </div>
      </div>

      {property.status === "APPROVED" && (
        <div className="lead-section">
          <h2>Buy or Rent this property</h2>
          <div className="lead-actions">
            <button
              type="button"
              className={`lead-btn ${leadType === "BUY" ? "active" : ""}`}
              onClick={() => setLeadType("BUY")}
            >
              Buy
            </button>
            <button
              type="button"
              className={`lead-btn ${leadType === "RENT" ? "active" : ""}`}
              onClick={() => setLeadType("RENT")}
            >
              Rent
            </button>
          </div>

          {leadType && (
            <form className="lead-form" onSubmit={handleLeadSubmit}>
              <div className="lead-grid">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone (10 digits required)"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value.replace(/\D/g, "") })}
                  minLength={10}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  title="10 digits required"
                  required
                />
              </div>
              <textarea
                placeholder="Additional details (optional)"
                value={leadForm.message}
                onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                rows={4}
              />
              <button type="submit" disabled={leadSubmitting} className="btn-submit">
                {leadSubmitting ? "Submitting..." : `Submit ${leadType.toLowerCase()} request`}
              </button>
            </form>
          )}

          {leadSuccess && <div className="success-message">{leadSuccess}</div>}
        </div>
      )}

      <div className="inquiry-section">
        <h2>Interested in this property?</h2>
        <form onSubmit={handleInquiry}>
          <textarea
            placeholder="Send a message to the owner..."
            value={inquiryMessage}
            onChange={(e) => setInquiryMessage(e.target.value)}
            required
            rows={4}
          />
          <button type="submit" disabled={submitting} className="btn-submit">
            {submitting ? "Submitting..." : "Send Inquiry"}
          </button>
        </form>
      </div>
    </div>
  );
}
