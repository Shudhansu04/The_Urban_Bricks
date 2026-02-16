import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { z } from "zod";
import { notifyAdminOnNewListing } from "../services/notification.js";
import { isCloudinaryConfigured, uploadFilesToCloudinary } from "../services/cloudinary.js";

function getUploadBaseUrl(req) {
  if (env.apiBaseUrl) return env.apiBaseUrl.replace(/\/$/, "");
  return `${req.protocol}://${req.get("host")}`;
}

const createSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(5000),
    price: z.coerce.number().positive(),
    location: z.string().min(3).max(200),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    mediaUrls: z.array(z.string().url()).default([]),
  }),
});

const updateSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    price: z.coerce.number().positive().optional(),
    location: z.string().min(3).max(200).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    mediaUrls: z.array(z.string().url()).optional(),
  }),
});

const listSchema = z.object({
  query: z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "SOLD"]).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});

export const createProperty = async (req, res) => {
  try {
    const data = req.validated.body;
    let uploadedUrls = [];

    if (req.files?.length > 0) {
      if (isCloudinaryConfigured()) {
        uploadedUrls = await uploadFilesToCloudinary(req.files, "properties");
      } else {
        const baseUrl = getUploadBaseUrl(req);
        uploadedUrls = req.files.map((file) =>
          `${baseUrl}/uploads/properties/${file.filename}`
        );
      }
    }

    const mediaUrls = [...(data.mediaUrls || []), ...uploadedUrls];
    const property = await prisma.property.create({
      data: {
        ...data,
        mediaUrls,
        ownerId: req.user.id,
        price: parseFloat(data.price),
      },
    });

    const owner = await prisma.user.findUnique({
      where: { id: property.ownerId },
      select: { id: true, name: true, email: true, phone: true },
    });

    const propertyWithOwner = { ...property, owner };

    // Notify admin (don't wait, but log errors)
    notifyAdminOnNewListing(propertyWithOwner).catch((err) => {
      console.error("[property] Notification error:", err);
    });

    res.status(201).json({ property: propertyWithOwner });
  } catch (err) {
    console.error("[property] Create error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProperties = async (req, res) => {
  try {
    const { status, city, state, minPrice, maxPrice, search, page, limit } = req.validated.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (state) where.state = { contains: state, mode: "insensitive" };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.property.count({ where }),
    ]);

    // Populate owner data manually
    const ownerIds = [...new Set(properties.map((p) => p.ownerId))];
    const owners = await prisma.user.findMany({
      where: { id: { in: ownerIds } },
      select: { id: true, name: true, email: true, phone: true },
    });
    const ownerMap = new Map(owners.map((o) => [o.id, o]));
    properties.forEach((p) => {
      p.owner = ownerMap.get(p.ownerId);
    });

    res.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[property] List error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Populate owner
    const owner = await prisma.user.findUnique({
      where: { id: property.ownerId },
      select: { id: true, name: true, email: true, phone: true },
    });

    // Populate inquiries
    const inquiries = await prisma.inquiry.findMany({
      where: { propertyId: id },
      orderBy: { createdAt: "desc" },
    });

    // Populate buyers for inquiries
    const buyerIds = inquiries.filter((i) => i.buyerId).map((i) => i.buyerId);
    const buyers = buyerIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: buyerIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const buyerMap = new Map(buyers.map((b) => [b.id, b]));
    inquiries.forEach((inq) => {
      if (inq.buyerId) {
        inq.buyer = buyerMap.get(inq.buyerId);
      }
    });

    res.json({ property: { ...property, owner, inquiries } });
  } catch (err) {
    console.error("[property] Get error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.validated.params;
    const data = req.validated.body;

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (existing.ownerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (data.price) {
      data.price = parseFloat(data.price);
    }

    const property = await prisma.property.update({
      where: { id },
      data,
    });

    const owner = await prisma.user.findUnique({
      where: { id: property.ownerId },
      select: { id: true, name: true, email: true },
    });

    res.json({ property: { ...property, owner } });
  } catch (err) {
    console.error("[property] Update error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (existing.ownerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.property.delete({ where: { id } });
    res.json({ message: "Property deleted" });
  } catch (err) {
    console.error("[property] Delete error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { createSchema, updateSchema, listSchema };
