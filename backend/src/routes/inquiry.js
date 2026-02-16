import express from "express";
import { createInquiry, getInquiries, updateInquiryStatus, createSchema } from "../controllers/inquiry.js";
import { validate } from "../middleware/validate.js";
import { authenticate, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, validate(createSchema), createInquiry);
router.get("/", authenticate, requireAuth, getInquiries);
router.patch("/:id/status", authenticate, requireAuth, updateInquiryStatus);

export default router;
