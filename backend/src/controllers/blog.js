import { prisma } from "../config/prisma.js";
import { z } from "zod";

const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    content: z.string().min(50),
    excerpt: z.string().max(500).optional(),
    published: z.boolean().default(false),
    featuredImage: z.string().url().optional().or(z.literal("")),
    tags: z.array(z.string()).default([]),
  }),
});

const updateBlogSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    content: z.string().min(50).optional(),
    excerpt: z.string().max(500).optional(),
    published: z.boolean().optional(),
    featuredImage: z.string().url().optional().or(z.literal("")),
    tags: z.array(z.string()).optional(),
  }),
});

const getBlogSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const listBlogsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
    published: z.coerce.boolean().optional(),
    search: z.string().optional(),
  }),
});

export const createBlog = async (req, res) => {
  try {
    const data = req.validated.body;
    
    const blog = await prisma.blog.create({
      data: {
        ...data,
        authorId: req.user.id,
      },
    });

    // Populate author
    const author = await prisma.user.findUnique({
      where: { id: blog.authorId },
      select: { id: true, name: true, email: true },
    });

    res.status(201).json({ blog: { ...blog, author } });
  } catch (err) {
    console.error("[blog] Create error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBlogs = async (req, res) => {
  try {
    const { page, limit, published, search } = req.validated.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    // If user is not admin, only show published blogs
    if (req.user?.role !== "ADMIN") {
      where.published = true;
    } else if (published !== undefined) {
      where.published = published;
    }

    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.blog.count({ where }),
    ]);

    // Populate authors
    const authorIds = [...new Set(blogs.map((b) => b.authorId))];
    const authors = await prisma.user.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, name: true, email: true },
    });
    const authorMap = new Map(authors.map((a) => [a.id, a]));
    blogs.forEach((blog) => {
      blog.author = authorMap.get(blog.authorId);
    });

    res.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[blog] List error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBlog = async (req, res) => {
  try {
    const { id } = req.validated.params;

    const blog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Populate author
    const author = await prisma.user.findUnique({
      where: { id: blog.authorId },
      select: { id: true, name: true, email: true },
    });
    blog.author = author;

    // If blog is not published and user is not admin or author, return 404
    if (!blog.published && req.user?.role !== "ADMIN" && blog.authorId !== req.user?.id) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json({ blog });
  } catch (err) {
    console.error("[blog] Get error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.validated.params;
    const data = req.validated.body;

    const existing = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Only admin or author can update
    if (existing.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const blog = await prisma.blog.update({
      where: { id },
      data,
    });

    // Populate author
    const author = await prisma.user.findUnique({
      where: { id: blog.authorId },
      select: { id: true, name: true, email: true },
    });

    res.json({ blog: { ...blog, author } });
  } catch (err) {
    console.error("[blog] Update error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Only admin or author can delete
    if (existing.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.blog.delete({
      where: { id },
    });

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("[blog] Delete error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { createBlogSchema, updateBlogSchema, getBlogSchema, listBlogsSchema };
