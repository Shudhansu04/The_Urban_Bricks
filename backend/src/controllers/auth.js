import crypto from "crypto";
import { prisma } from "../config/prisma.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { notifyAdminOnNewUser, sendPasswordResetEmail } from "../services/notification.js";
import { env } from "../config/env.js";
import { z } from "zod";

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().min(6).max(20),
    location: z.string().min(2).max(200),
    password: z.string().min(6),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(20),
    password: z.string().min(6),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(6).max(20).optional(),
    location: z.string().min(2).max(200).optional(),
    currentPassword: z.string().min(6).optional(),
    newPassword: z.string().min(6).optional(),
  }),
});

export const signup = async (req, res) => {
  try {
    const { name, email, phone, location, password } = req.validated.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, phone, location, passwordHash },
      select: { id: true, name: true, email: true, role: true, phone: true, location: true, createdAt: true },
    });

    // Notify admin about new user registration (don't wait for it)
    notifyAdminOnNewUser(user).catch((err) => {
      console.error("[auth] Failed to notify admin about new user:", err);
    });

    const token = signToken({ sub: user.id, role: user.role });
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error("[auth] Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.validated.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken({ sub: user.id, role: user.role });
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
      },
      token,
    });
  } catch (err) {
    console.error("[auth] Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  res.json({ message: "Logged out" });
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, phone: true, location: true, createdAt: true },
    });
    res.json({ user });
  } catch (err) {
    console.error("[auth] Get me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.validated.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: hashedToken, resetTokenExpiry: expiry },
      });

      const resetLink = `${env.frontendUrl}/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail(user, resetLink);
    }

    res.json({ message: "If an account exists, a reset link has been sent." });
  } catch (err) {
    console.error("[auth] Forgot password error:", err);
    res.status(500).json({ error: "Failed to send reset email" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.validated.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("[auth] Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, location, currentPassword, newPassword } = req.validated.body;

    if (newPassword && !currentPassword) {
      return res.status(400).json({ error: "Current password is required to set a new password" });
    }

    const existing = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }

    if (email && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    if (newPassword) {
      const valid = await verifyPassword(currentPassword, existing.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
    }

    const updateData = {
      name: name ?? existing.name,
      email: email ?? existing.email,
      phone: phone ?? existing.phone,
      location: location ?? existing.location,
    };

    if (newPassword) {
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const user = await prisma.user.update({
      where: { id: existing.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, phone: true, location: true, createdAt: true },
    });

    res.json({ user });
  } catch (err) {
    console.error("[auth] Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema };
