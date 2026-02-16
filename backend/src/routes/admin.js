import express from "express";
import {
  getPendingProperties,
  updatePropertyStatus,
  getDashboardStats,
  getNotificationLogs,
  updateStatusSchema,
  testNotificationConfig,
  testWhatsApp,
} from "../controllers/admin.js";
import { validate } from "../middleware/validate.js";
import { authenticate, requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate, requireAuth, requireAdmin);

router.get("/pending", getPendingProperties);
router.put("/properties/:id/status", validate(updateStatusSchema), updatePropertyStatus);
router.get("/stats", getDashboardStats);
router.get("/notifications", getNotificationLogs);
router.get("/test-config", testNotificationConfig);
router.post("/test-whatsapp", testWhatsApp);

export default router;
