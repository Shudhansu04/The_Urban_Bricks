import { useEffect, useState } from "react";
import api from "../utils/api";
import "./Projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Ongoing Projects</h1>
        <p>Discover our latest property developments and community projects.</p>
      </div>

      {projects.length === 0 ? (
        <p className="no-projects">No ongoing projects yet. Please check back soon.</p>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              {project.imageUrls && project.imageUrls.length > 0 ? (
                <img src={project.imageUrls[0]} alt={project.title} className="project-image" />
              ) : (
                <div className="project-image placeholder">No image</div>
              )}
              <div className="project-content">
                <div className="project-top">
                  <h2>{project.title}</h2>
                  <span className="project-status">{project.status}</span>
                </div>
                {project.price !== undefined && project.price !== null && (
                  <p className="project-price">₹{Number(project.price).toLocaleString('en-IN')}</p>
                )}
                {project.location && <p className="project-location">{project.location}</p>}
                <p className="project-description">{project.description}</p>
                <div className="project-meta">
                  {project.startDateLabel && (
                    <span>Started: {project.startDateLabel}</span>
                  )}
                  {project.expectedCompletion && (
                    <span>Completion: {project.expectedCompletion}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
