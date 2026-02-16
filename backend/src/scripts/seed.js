import { prisma } from "../config/prisma.js";
import { hashPassword } from "../utils/password.js";

async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log("[seed] Admin user already exists");
    return;
  }

  const passwordHash = await hashPassword(adminPassword);
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("[seed] Admin user created:", admin.email);
}

seed()
  .catch((err) => {
    console.error("[seed] Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
