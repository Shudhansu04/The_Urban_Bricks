import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./AdminBlogs.css";

export default function AdminBlogs() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadBlogs();
  }, []);

  async function loadBlogs() {
    try {
      const res = await api.get("/blogs");
      setBlogs(res.data.blogs);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      await api.delete(`/blogs/${id}`);
      loadBlogs();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete blog");
    }
  }

  async function handleTogglePublish(id, currentStatus) {
    try {
      await api.put(`/blogs/${id}`, { published: !currentStatus });
      loadBlogs();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update blog");
    }
  }

  if (loading) {
    return <div className="loading">Loading blogs...</div>;
  }

  return (
    <div className="admin-blogs">
      <div className="admin-blogs-header">
        <h1>Blog Management</h1>
        <Link to="/admin/blogs/new" className="btn-primary">
          Create New Blog
        </Link>
      </div>

      {blogs.length === 0 ? (
        <p className="no-blogs">No blogs yet. Create your first blog!</p>
      ) : (
        <div className="blogs-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td>
                    <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
                  </td>
                  <td>{blog.author.name}</td>
                  <td>
                    <span className={`status ${blog.published ? "published" : "draft"}`}>
                      {blog.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      onClick={() => handleTogglePublish(blog.id, blog.published)}
                      className="btn-toggle"
                    >
                      {blog.published ? "Unpublish" : "Publish"}
                    </button>
                    <Link to={`/admin/blogs/${blog.id}/edit`}  className="btn-edit">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
