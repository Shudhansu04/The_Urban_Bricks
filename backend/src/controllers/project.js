import { prisma } from "../config/prisma.js";
import { z } from "zod";
import { uploadMultipleToCloudinary, isConfigured } from "../utils/cloudinary.js";

const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(5000),
    price: z.coerce.number().positive(),
    status: z.enum(["ONGOING", "COMPLETED"]).optional(),
    location: z.string().max(200).optional(),
    imageUrls: z.array(z.string().url()).default([]),
    startDateLabel: z.string().max(100).optional(),
    expectedCompletion: z.string().max(100).optional(),
  }),
});

const updateProjectSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    price: z.coerce.number().positive().optional(),
    status: z.enum(["ONGOING", "COMPLETED"]).optional(),
    location: z.string().max(200).optional(),
    imageUrls: z.array(z.string().url()).optional(),
    startDateLabel: z.string().max(100).optional(),
    expectedCompletion: z.string().max(100).optional(),
  }),
});

const listProjectsSchema = z.object({
  query: z.object({
    status: z.enum(["ONGOING", "COMPLETED"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(12),
  }),
});

export const createProject = async (req, res) => {
  try {
    const data = req.validated.body;
    let uploadedUrls = [];
    if (req.files && req.files.length > 0) {
      if (!isConfigured) {
        return res.status(503).json({
          error: "Image upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in server .env",
        });
      }
      uploadedUrls = await uploadMultipleToCloudinary(req.files, "projects");
    }
    const imageUrls = [...(data.imageUrls || []), ...uploadedUrls];
    const project = await prisma.project.create({
      data: {
        ...data,
        imageUrls,
      },
    });
    res.status(201).json({ project });
  } catch (err) {
    console.error("[project] Create error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProjects = async (req, res) => {
  try {
    const { status, page, limit } = req.validated.query;
    const skip = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    } else if (req.user?.role !== "ADMIN") {
      where.status = "ONGOING";
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[project] List error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.validated.params;
    const data = req.validated.body;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = await prisma.project.update({
      where: { id },
      data,
    });

    res.json({ project });
  } catch (err) {
    console.error("[project] Update error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Project not found" });
    }

    await prisma.project.delete({ where: { id } });
    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error("[project] Delete error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { createProjectSchema, updateProjectSchema, listProjectsSchema };
