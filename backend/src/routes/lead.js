import express from "express";
import { createLead, createLeadSchema } from "../controllers/lead.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, validate(createLeadSchema), createLead);

export default router;
