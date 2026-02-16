import { prisma } from "../config/prisma.js";
import { z } from "zod";
import { notifyAdminOnInquiry } from "../services/notification.js";

const createSchema = z.object({
  body: z.object({
    propertyId: z.string(),
    message: z.string().min(5).max(1000),
  }),
});

export const createInquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.validated.body;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { 
        id: true, 
        title: true, 
        ownerId: true,
        price: true,
        location: true,
        city: true,
        state: true,
      },
    });
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Get property owner details
    const owner = await prisma.user.findUnique({
      where: { id: property.ownerId },
      select: { id: true, name: true, email: true, phone: true },
    });

    if (!owner) {
      return res.status(404).json({ error: "Property owner not found" });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId,
        buyerId: req.user?.id,
        message,
      },
    });

    // Populate buyer
    let buyer = null;
    if (inquiry.buyerId) {
      buyer = await prisma.user.findUnique({
        where: { id: inquiry.buyerId },
        select: { id: true, name: true, email: true, phone: true },
      });
      inquiry.buyer = buyer;
    }

    // Attach property with owner to inquiry
    const propertyWithOwner = { ...property, owner };
    inquiry.property = propertyWithOwner;

    // Notify admin only about the inquiry (don't wait, but log errors)
    notifyAdminOnInquiry(inquiry, propertyWithOwner, buyer).catch((err) => {
      console.error("[inquiry] Admin notification error:", err);
    });

    res.status(201).json({ inquiry });
  } catch (err) {
    console.error("[inquiry] Create error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getInquiries = async (req, res) => {
  try {
    // Get user's properties first
    const userProperties = await prisma.property.findMany({
      where: { ownerId: req.user.id },
      select: { id: true },
    });
    const userPropertyIds = userProperties.map((p) => p.id);

    // Get inquiries where user is buyer or property owner
    const inquiries = await prisma.inquiry.findMany({
      where: {
        OR: [
          { buyerId: req.user.id },
          { propertyId: { in: userPropertyIds } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // Populate property and buyer data
    const propertyIds = [...new Set(inquiries.map((i) => i.propertyId))];
    const buyerIds = [...new Set(inquiries.filter((i) => i.buyerId).map((i) => i.buyerId))];

    const [properties, buyers] = await Promise.all([
      prisma.property.findMany({
        where: { id: { in: propertyIds } },
        select: { id: true, title: true, price: true },
      }),
      buyerIds.length > 0
        ? prisma.user.findMany({
            where: { id: { in: buyerIds } },
            select: { id: true, name: true, email: true, phone: true },
          })
        : [],
    ]);

    const propertyMap = new Map(properties.map((p) => [p.id, p]));
    const buyerMap = new Map(buyers.map((b) => [b.id, b]));

    inquiries.forEach((inq) => {
      inq.property = propertyMap.get(inq.propertyId);
      if (inq.buyerId) {
        inq.buyer = buyerMap.get(inq.buyerId);
      }
    });

    res.json({ inquiries });
  } catch (err) {
    console.error("[inquiry] List error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    // Get property to check ownership
    const property = await prisma.property.findUnique({
      where: { id: inquiry.propertyId },
      select: { ownerId: true },
    });

    if (
      property.ownerId !== req.user.id &&
      inquiry.buyerId !== req.user.id &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: { status },
    });

    res.json({ inquiry: updated });
  } catch (err) {
    console.error("[inquiry] Update error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { createSchema };
