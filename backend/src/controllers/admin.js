import { prisma } from "../config/prisma.js";
import { z } from "zod";

const updateStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "SOLD"]),
  }),
});

export const getPendingProperties = async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    // Populate owner data
    const ownerIds = [...new Set(properties.map((p) => p.ownerId))];
    const owners = await prisma.user.findMany({
      where: { id: { in: ownerIds } },
      select: { id: true, name: true, email: true, phone: true },
    });
    const ownerMap = new Map(owners.map((o) => [o.id, o]));
    properties.forEach((p) => {
      p.owner = ownerMap.get(p.ownerId);
    });

    res.json({ properties });
  } catch (err) {
    console.error("[admin] Get pending error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePropertyStatus = async (req, res) => {
  try {
    const { id } = req.validated.params;
    const { status } = req.validated.body;

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: { status },
    });

    const owner = await prisma.user.findUnique({
      where: { id: updated.ownerId },
      select: { id: true, name: true, email: true },
    });

    res.json({ property: { ...updated, owner } });
  } catch (err) {
    console.error("[admin] Update status error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [totalProperties, pendingCount, approvedCount, soldCount, recentSubmissions] =
      await Promise.all([
        prisma.property.count(),
        prisma.property.count({ where: { status: "PENDING" } }),
        prisma.property.count({ where: { status: "APPROVED" } }),
        prisma.property.count({ where: { status: "SOLD" } }),
        prisma.property.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
        }),
      ]);

    // Populate owners for recent submissions
    const ownerIds = [...new Set(recentSubmissions.map((p) => p.ownerId))];
    const owners = await prisma.user.findMany({
      where: { id: { in: ownerIds } },
      select: { id: true, name: true, email: true },
    });
    const ownerMap = new Map(owners.map((o) => [o.id, o]));
    recentSubmissions.forEach((p) => {
      p.owner = ownerMap.get(p.ownerId);
    });

    res.json({
      stats: {
        total: totalProperties,
        pending: pendingCount,
        approved: approvedCount,
        sold: soldCount,
      },
      recentSubmissions,
    });
  } catch (err) {
    console.error("[admin] Dashboard stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getNotificationLogs = async (req, res) => {
  try {
    const logs = await prisma.notificationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Populate property data
    const propertyIds = [...new Set(logs.map((l) => l.propertyId))];
    const properties = await prisma.property.findMany({
      where: { id: { in: propertyIds } },
      select: { id: true, title: true },
    });
    const propertyMap = new Map(properties.map((p) => [p.id, p]));
    logs.forEach((log) => {
      log.property = propertyMap.get(log.propertyId);
    });

    res.json({ logs });
  } catch (err) {
    console.error("[admin] Notification logs error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const testNotificationConfig = async (req, res) => {
  try {
    const { env } = await import("../config/env.js");
    const config = {
      email: {
        smtpHost: env.smtpHost || "Not set",
        smtpPort: env.smtpPort,
        smtpUser: env.smtpUser ? `${env.smtpUser.substring(0, 5)}...` : "Not set",
        smtpPasswordSet: !!env.smtpPassword,
        emailFrom: env.emailFrom || "Not set",
        adminEmail: env.adminEmail || "Not set",
        emailReady: !!(env.smtpHost && env.smtpUser && env.smtpPassword && env.emailFrom && env.adminEmail),
      },
      twilio: {
        accountSid: env.twilioSid ? `${env.twilioSid.substring(0, 10)}...` : "Not set",
        authTokenSet: !!env.twilioToken,
        whatsappFrom: env.twilioWhatsappFrom || "Not set",
        adminWhatsappTo: env.adminWhatsappTo || "Not set",
        whatsappReady: !!(env.twilioSid && env.twilioToken && env.twilioWhatsappFrom && env.adminWhatsappTo),
      },
    };
    res.json({ config });
  } catch (err) {
    console.error("[admin] Test config error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const testWhatsApp = async (req, res) => {
  try {
    const twilio = (await import("twilio")).default;
    const { env } = await import("../config/env.js");
    
    if (!env.twilioSid || !env.twilioToken) {
      return res.status(400).json({ 
        error: "Twilio not configured",
        details: {
          accountSid: !!env.twilioSid,
          authToken: !!env.twilioToken,
        }
      });
    }

    if (!env.twilioWhatsappFrom || !env.adminWhatsappTo) {
      return res.status(400).json({ 
        error: "WhatsApp numbers not configured",
        details: {
          from: env.twilioWhatsappFrom || "Not set",
          to: env.adminWhatsappTo || "Not set",
        }
      });
    }

    const client = twilio(env.twilioSid, env.twilioToken);
    const fromNumber = env.twilioWhatsappFrom.startsWith("whatsapp:") 
      ? env.twilioWhatsappFrom 
      : `whatsapp:${env.twilioWhatsappFrom}`;
    const toNumber = env.adminWhatsappTo.startsWith("whatsapp:") 
      ? env.adminWhatsappTo 
      : `whatsapp:${env.adminWhatsappTo}`;

    const testMessage = `🧪 *Test WhatsApp Notification*\n\nThis is a test message from your property marketplace.\n\nIf you received this, WhatsApp notifications are working correctly! ✅\n\nTime: ${new Date().toLocaleString()}`;

    console.log("[admin] Sending test WhatsApp message...");
    console.log("[admin] From:", fromNumber);
    console.log("[admin] To:", toNumber);

    const result = await client.messages.create({
      from: fromNumber,
      to: toNumber,
      body: testMessage,
    });

    res.json({ 
      success: true,
      message: "Test WhatsApp message sent",
      details: {
        messageSid: result.sid,
        status: result.status,
        from: fromNumber,
        to: toNumber,
      }
    });
  } catch (err) {
    console.error("[admin] Test WhatsApp error:", err);
    res.status(500).json({ 
      error: "Failed to send test WhatsApp",
      details: {
        message: err.message,
        code: err.code,
        status: err.status,
        moreInfo: err.moreInfo,
      }
    });
  }
};

export { updateStatusSchema };
