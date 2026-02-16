import { notifyAdminOnNewListing, notifyAdminOnNewUser, notifyAdminOnLead } from "../services/notification.js";
import { prisma } from "../config/prisma.js";

export const testNotification = async (req, res) => {
  try {
    const { type } = req.body; // "property" or "user"

    if (type === "property") {
      // Create a test property notification
      const testProperty = {
        id: "test-property-123",
        title: "Test Property",
        description: "This is a test property for notification testing",
        price: 100000,
        location: "123 Test Street",
        city: "Test City",
        state: "Test State",
        country: "Test Country",
        status: "PENDING",
        mediaUrls: [],
        createdAt: new Date(),
        owner: {
          id: "test-owner-123",
          name: "Test Owner",
          email: "testowner@example.com",
          phone: "+1234567890",
        },
      };

      console.log("[test] Sending test property notification...");
      await notifyAdminOnNewListing(testProperty);
      res.json({ message: "Test property notification sent. Check your email and WhatsApp." });
    } else if (type === "user") {
      // Create a test user notification
      const testUser = {
        id: "test-user-123",
        name: "Test User",
        email: "testuser@example.com",
        phone: "+1234567890",
        role: "USER",
        createdAt: new Date(),
      };

      console.log("[test] Sending test user notification...");
      await notifyAdminOnNewUser(testUser);
      res.json({ message: "Test user notification sent. Check your email and WhatsApp." });
    } else if (type === "lead") {
      const testProperty = {
        id: "507f1f77bcf86cd799439011",
        title: "Test Approved Property",
        price: 250000,
        location: "456 Test Avenue",
        city: "Test City",
        state: "Test State",
        status: "APPROVED",
      };
      const testLead = {
        id: "test-lead-123",
        propertyId: "test-property-456",
        type: "BUY",
        name: "Test Buyer",
        email: "testbuyer@example.com",
        phone: "+1234567890",
        message: "Interested in buying this property.",
        createdAt: new Date(),
      };

      console.log("[test] Sending test lead notification...");
      await notifyAdminOnLead(testLead, testProperty);
      res.json({ message: "Test lead notification sent. Check your WhatsApp." });
    } else {
      res.status(400).json({ error: "Type must be 'property', 'user', or 'lead'" });
    }
  } catch (err) {
    console.error("[test] Error:", err);
    res.status(500).json({ error: err.message });
  }
};
