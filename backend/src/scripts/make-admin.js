import { prisma } from "../config/prisma.js";

async function makeAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error("Usage: node src/scripts/make-admin.js <email>");
    console.error("Example: node src/scripts/make-admin.js user@example.com");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.error(`❌ User with email "${email}" not found.`);
      process.exit(1);
    }

    if (user.role === "ADMIN") {
      console.log(`✅ User "${email}" is already an ADMIN.`);
      process.exit(0);
    }

    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`✅ Successfully promoted "${email}" to ADMIN role.`);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
