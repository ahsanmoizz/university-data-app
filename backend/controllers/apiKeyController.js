// backend/controllers/apiKeyController.js
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// POST /api/keys/generate
export const generateApiKey = async (req, res) => {
  try {
    const userId = req.user.id;
    const key = crypto.randomBytes(28).toString("hex"); // 56 chars
    const now = new Date();
    const validTo = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        key,
        plan: req.body.plan || "free",
        validFrom: now,
        validTo,
      },
    });

    return res.status(201).json({
      message: "API key generated.",
      apiKey: apiKey.key,
      expiresAt: apiKey.validTo,
    });
  } catch (err) {
    console.error("generateApiKey error:", err);
    return res.status(500).json({ message: "Failed to generate API key." });
  }
};

export const listMyApiKeys = async (req, res) => {
  try {
    const userId = req.user.id;
    const keys = await prisma.apiKey.findMany({ where: { userId }, orderBy: { createdAt: "desc" }});
    res.json(keys);
  } catch (err) {
    console.error("listMyApiKeys error:", err);
    res.status(500).json({ message: "Failed to list API keys." });
  }
};