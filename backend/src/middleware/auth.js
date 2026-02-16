import { verifyToken } from "../utils/jwt.js";
import { prisma } from "../config/prisma.js";

export async function authenticate(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return next();
  }
  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) {
      return next();
    }
    req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
  } catch (err) {
    // ignore invalid tokens
  }
  return next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  return next();
}
