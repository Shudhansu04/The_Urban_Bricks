import { useEffect, useState } from "react";
import api from "../utils/api";
import "./AdminProjects.css";

const initialForm = {
  title: "",
  description: "",
  price: "",
  status: "ONGOING",
  location: "",
  startDateLabel: "",
  expectedCompletion: "",
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("status", formData.status);
      if (formData.location) data.append("location", formData.location);
      if (formData.startDateLabel) data.append("startDateLabel", formData.startDateLabel);
      if (formData.expectedCompletion) data.append("expectedCompletion", formData.expectedCompletion);
      imageFiles.forEach((file) => data.append("images", file));

      await api.post("/projects", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData(initialForm);
      setImageFiles([]);
      loadProjects();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      loadProjects();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete project");
    }
  }

  async function handleToggleStatus(id, status) {
    const next = status === "ONGOING" ? "COMPLETED" : "ONGOING";
    try {
      await api.put(`/projects/${id}`, { status: next });
      loadProjects();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    }
  }

  return (
    <div className="admin-projects">
      <div className="admin-projects-header">
        <h1>Project Management</h1>
      </div>

      <div className="project-form-card">
        <h2>Add New Project</h2>
        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-grid">
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
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Project Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
              />
              <small>{imageFiles.length > 0 ? `${imageFiles.length} image(s) selected` : "Upload project images"}</small>
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="text"
                value={formData.startDateLabel}
                onChange={(e) => setFormData({ ...formData, startDateLabel: e.target.value })}
                placeholder="Jan 2025"
              />
            </div>
            <div className="form-group">
              <label>Expected Completion</label>
              <input
                type="text"
                value={formData.expectedCompletion}
                onChange={(e) => setFormData({ ...formData, expectedCompletion: e.target.value })}
                placeholder="Dec 2025"
              />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Description *</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              minLength={10}
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Saving..." : "Add Project"}
          </button>
        </form>
      </div>

      <div className="project-list-card">
        <h2>Existing Projects</h2>
        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <p className="no-projects">No projects added yet.</p>
        ) : (
          <div className="project-list">
            {projects.map((project) => (
              <div key={project.id} className="project-item">
                <div>
                  <h3>{project.title}</h3>
                  <p className="project-status-label">{project.status}</p>
                  {project.price !== undefined && project.price !== null && (
                    <p className="project-meta">Price: ₹{Number(project.price).toLocaleString('en-IN')}</p>
                  )}
                  {project.location && <p className="project-meta">{project.location}</p>}
                </div>
                <div className="project-actions">
                  <button
                    className="btn-toggle"
                    onClick={() => handleToggleStatus(project.id, project.status)}
                  >
                    Mark {project.status === "ONGOING" ? "Completed" : "Ongoing"}
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(project.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
