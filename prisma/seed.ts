import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("[Seed] Starting database seed...");

  // Create an admin user for testing
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
    },
  });

  console.log("[Seed] Created admin user:", adminUser.email);

  // Create some test users
  const testUsers = [
    { email: "user1@example.com", name: "Test User 1", role: "user" },
    { email: "user2@example.com", name: "Test User 2", role: "user" },
    { email: "user3@example.com", name: "Test User 3", role: "user" },
  ];

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log("[Seed] Created user:", user.email);
  }

  console.log("[Seed] Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("[Seed] Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
