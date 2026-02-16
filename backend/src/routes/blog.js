import express from "express";
import {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  createBlogSchema,
  updateBlogSchema,
  getBlogSchema,
  listBlogsSchema,
} from "../controllers/blog.js";
import { validate } from "../middleware/validate.js";
import { authenticate, requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", validate(listBlogsSchema), getBlogs);
router.get("/:id", validate(getBlogSchema), getBlog);

// Protected routes (admin only for create)
router.post("/", authenticate, requireAuth, requireAdmin, validate(createBlogSchema), createBlog);
router.put("/:id", authenticate, requireAuth, validate(updateBlogSchema), updateBlog);
router.delete("/:id", authenticate, requireAuth, deleteBlog);

export default router;
