import { prisma } from "../config/prisma.js";
import { z } from "zod";
import { notifyAdminOnLead } from "../services/notification.js";

const createLeadSchema = z.object({
  body: z.object({
    propertyId: z.string(),
    type: z.enum(["BUY", "RENT"]),
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().min(6).max(20),
    message: z.string().max(1000).optional(),
  }),
});

export const createLead = async (req, res) => {
  try {
    const { propertyId, type, name, email, phone, message } = req.validated.body;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        price: true,
        location: true,
        city: true,
        state: true,
        status: true,
      },
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (property.status !== "APPROVED") {
      return res.status(400).json({ error: "This property is not available for buy/rent requests yet" });
    }

    const lead = await prisma.lead.create({
      data: { propertyId, type, name, email, phone, message },
    });

    notifyAdminOnLead(lead, property).catch((err) => {
      console.error("[lead] Admin notification error:", err);
    });

    res.status(201).json({ lead });
  } catch (err) {
    console.error("[lead] Create error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { createLeadSchema };
