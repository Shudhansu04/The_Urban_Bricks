import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./SubmitProperty.css";

export default function SubmitProperty() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    city: "",
    state: "",
    country: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urls = imageFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [imageFiles]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("location", formData.location);
      if (formData.city) data.append("city", formData.city);
      if (formData.state) data.append("state", formData.state);
      if (formData.country) data.append("country", formData.country);
      imageFiles.forEach((file) => data.append("images", file));

      await api.post("/properties", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Property submitted successfully! Admin will review it.");
      navigate("/my-properties");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit property");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="submit-property">
      <div className="submit-container">
        <h2>Submit a Property</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              minLength={10}
              rows={5}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Property Images (up to 10)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
            />
            <small>{imageFiles.length > 0 ? `${imageFiles.length} image(s) selected` : "Upload multiple images"}</small>
            {previewUrls.length > 0 && (
              <div className="image-preview-grid">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="image-preview-item">
                    <img src={url} alt={imageFiles[idx]?.name} />
                    <span className="image-preview-name">{imageFiles[idx]?.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? "Submitting..." : "Submit Property"}
          </button>
        </form>
      </div>
    </div>
  );
}
