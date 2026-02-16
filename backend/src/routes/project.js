import express from "express";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
} from "../controllers/project.js";
import { validate } from "../middleware/validate.js";
import { authenticate, requireAuth, requireAdmin } from "../middleware/auth.js";
import { uploadProjectImages } from "../middleware/upload.js";

const router = express.Router();

router.get("/", validate(listProjectsSchema), getProjects);
router.post("/", authenticate, requireAuth, requireAdmin, uploadProjectImages, validate(createProjectSchema), createProject);
router.put("/:id", authenticate, requireAuth, requireAdmin, validate(updateProjectSchema), updateProject);
router.delete("/:id", authenticate, requireAuth, requireAdmin, deleteProject);

export default router;
