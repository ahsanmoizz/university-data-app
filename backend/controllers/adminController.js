// backend/controllers/adminController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/* ------------------------------------------------------------------
 👥 USERS MANAGEMENT
------------------------------------------------------------------ */
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isBlocked: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ message: "Failed to get users." });
  }
};

export const toggleUserBlock = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found." });

    const updated = await prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked },
    });
    res.json({ message: "User status updated.", updated });
  } catch (err) {
    console.error("toggleUserBlock:", err);
    res.status(500).json({ message: "Failed to update user." });
  }
};

export const promoteUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) return res.status(404).json({ message: "User not found." });

    const updated = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role: "professor" },
    });

    res.status(200).json({
      message: `${updated.username} promoted to professor.`,
      user: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Promotion failed." });
  }
};

/* ------------------------------------------------------------------
 🔑 API KEY MANAGEMENT
------------------------------------------------------------------ */
export const getAllKeys = async (req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(keys);
  } catch (err) {
    console.error("getAllKeys:", err);
    res.status(500).json({ message: "Failed to get API keys." });
  }
};

export const revokeKey = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.apiKey.update({
      where: { id },
      data: { active: false },
    });
    res.json({ message: "API key revoked." });
  } catch (err) {
    console.error("revokeKey:", err);
    res.status(500).json({ message: "Failed to revoke key." });
  }
};

/* ------------------------------------------------------------------
 💳 PAYMENT OVERSIGHT
------------------------------------------------------------------ */
export const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(payments);
  } catch (err) {
    console.error("getAllPayments:", err);
    res.status(500).json({ message: "Failed to get payments." });
  }
};

/* ------------------------------------------------------------------
 📂 DATASET OVERSIGHT
------------------------------------------------------------------ */
export const getAllDatasetsAdmin = async (req, res) => {
  try {
    const datasets = await prisma.dataset.findMany({
      include: {
        user: { select: { email: true, username: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(datasets);
  } catch (err) {
    console.error("getAllDatasetsAdmin:", err);
    res.status(500).json({ message: "Failed to fetch datasets." });
  }
};

/* ------------------------------------------------------------------
 🧮 ADMIN OVERVIEW
------------------------------------------------------------------ */
export const getOverview = async (req, res) => {
  try {
    const [userCount, datasetCount, paymentCount, keyCount] = await Promise.all([
      prisma.user.count(),
      prisma.dataset.count(),
      prisma.payment.count(),
      prisma.apiKey.count(),
    ]);

    res.json({
      users: userCount,
      datasets: datasetCount,
      payments: paymentCount,
      apiKeys: keyCount,
    });
  } catch (err) {
    console.error("getOverview:", err);
    res.status(500).json({ message: "Failed to get overview stats." });
  }
};
