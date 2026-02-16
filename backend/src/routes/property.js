import express from "express";
import {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  createSchema,
  updateSchema,
  listSchema,
} from "../controllers/property.js";
import { validate } from "../middleware/validate.js";
import { authenticate, requireAuth } from "../middleware/auth.js";
import { uploadPropertyImages } from "../middleware/upload.js";

const router = express.Router();

router.get("/", validate(listSchema), getProperties);
router.get("/:id", getProperty);
router.post("/", authenticate, requireAuth, uploadPropertyImages, validate(createSchema), createProperty);
router.put("/:id", authenticate, requireAuth, validate(updateSchema), updateProperty);
router.delete("/:id", authenticate, requireAuth, deleteProperty);

export default router;
