import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./BlogDetail.css";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlog();
  }, [id]);

  async function loadBlog() {
    try {
      const res = await api.get(`/blogs/${id}`);
      setBlog(res.data.blog);
    } catch (err) {
      console.error("Failed to load blog:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      await api.delete(`/blogs/${id}`);
      navigate("/blogs");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete blog");
    }
  }

  if (loading) {
    return <div className="loading">Loading blog...</div>;
  }

  if (!blog) {
    return <div className="error">Blog not found</div>;
  }

  const canEdit = user && (user.role === "ADMIN" || blog.authorId === user.id);

  return (
    <div className="blog-detail">
      {canEdit && (
        <div className="blog-actions">
          <Link to={`/blogs/${id}/edit`} className="btn-edit">Edit</Link>
          <button onClick={handleDelete} className="btn-delete">Delete</button>
        </div>
      )}
      
      {blog.featuredImage && (
        <img src={blog.featuredImage} alt={blog.title} className="blog-featured-image" />
      )}
      
      <article className="blog-article">
        <h1>{blog.title}</h1>
        
        <div className="blog-meta">
          <span>By {blog.author.name}</span>
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          {blog.updatedAt !== blog.createdAt && (
            <span>Updated: {new Date(blog.updatedAt).toLocaleDateString()}</span>
          )}
        </div>

        {blog.tags && blog.tags.length > 0 && (
          <div className="blog-tags">
            {blog.tags.map((tag, idx) => (
              <span key={idx} className="tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }} />
      </article>
    </div>
  );
}
