import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

const seedAdmin = async () => {
  try {
    const existing = await prisma.user.findFirst({ where: { role: "admin" } });
    if (existing) {
      console.log("✅ Admin already exists.");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash("admin123", 10);

    await prisma.user.create({
      data: {
        username: "SuperAdmin",
        email: process.env.ADMIN_EMAIL || "admin@example.com",
        passwordHash,
        isVerified: true,
        role: "admin",
      },
    });

    console.log("🚀 Default admin created!");
    console.log("Email:", process.env.ADMIN_EMAIL || "admin@example.com");
    console.log("Password: admin123");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
};

seedAdmin();
