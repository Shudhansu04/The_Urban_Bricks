import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "../controllers/auth.js";
import { validate } from "../middleware/validate.js";
import { authenticate, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post("/logout", logout);
router.get("/me", authenticate, requireAuth, getMe);
router.put("/me", authenticate, requireAuth, validate(updateProfileSchema), updateProfile);

export default router;
