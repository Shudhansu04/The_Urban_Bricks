import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./BlogEditor.css";

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    published: false,
    featuredImage: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      loadBlog();
    }
  }, [id]);

  async function loadBlog() {
    try {
      const res = await api.get(`/blogs/${id}`);
      const blog = res.data.blog;
      setFormData({
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt || "",
        published: blog.published,
        featuredImage: blog.featuredImage || "",
        tags: blog.tags ? blog.tags.join(", ") : "",
      });
    } catch (err) {
      console.error("Failed to load blog:", err);
      setError("Failed to load blog");
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : [],
      };

      if (isEdit) {
        await api.put(`/blogs/${id}`, data);
      } else {
        await api.post("/blogs", data);
      }

      navigate("/admin/blogs");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save blog");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="blog-editor">
      <h1>{isEdit ? "Edit Blog" : "Create New Blog"}</h1>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label htmlFor="excerpt">Excerpt (optional)</label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={3}
            maxLength={500}
            placeholder="Short summary of the blog post..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={20}
            minLength={50}
            placeholder="Write your blog content here..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="featuredImage">Featured Image URL (optional)</label>
          <input
            type="url"
            id="featuredImage"
            name="featuredImage"
            value={formData.featuredImage}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="real estate, property, tips"
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleChange}
            />
            Publish immediately
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Saving..." : isEdit ? "Update Blog" : "Create Blog"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/blogs")}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
