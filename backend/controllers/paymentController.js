// backend/controllers/paymentController.js
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();
export const getPlans = async (req, res) => {
  try {
    const plans = [
      { 
        name: "Beginner", 
        uploads: 5, 
        amount: 0,
        features: ["Up to 5 uploads", "Basic analysis tools", "Community access"]
      },
      { 
        name: "Pro", 
        uploads: 20, 
        amount: 9.99,
        features: ["20 uploads", "Advanced analysis", "Priority support"]
      },
      { 
        name: "Premium", 
        uploads: 9999, 
        amount: 19.99,
        features: ["Unlimited uploads", "Team management", "Full professor access"]
      },
    ];
    res.status(200).json(plans);
  } catch (err) {
    console.error("getPlans error:", err);
    res.status(500).json({ message: "Failed to fetch plans." });
  }
};

export const simulatePayment = async (req, res) => {
  try {
    const { userId, planName, cardNumber } = req.body;

    if (!userId || !planName) {
      return res.status(400).json({ message: "userId and planName required." });
    }

    const planMap = {
      Beginner: 5,
      Pro: 20,
      Premium: 9999,
    };
    const amountMap = {
      Beginner: 0,
      Pro: 9.99,
      Premium: 19.99,
    };

    const uploadsAllowed = planMap[planName];
    const amount = amountMap[planName];
    if (!uploadsAllowed) return res.status(400).json({ message: "Invalid plan." });

    // 💳 Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const transactionId = `TXN-${randomBytes(4).toString("hex").toUpperCase()}`;

    // 🧾 Log payment
    const payment = await prisma.payment.create({
      data: {
        userId: parseInt(userId),
        transactionId,
        amount,
        plan: planName,
      },
    });

    // 🔑 Create API Key
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: parseInt(userId),
        key: randomBytes(24).toString("hex"),
        plan: planName,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // 🧍 Update user role
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role: planName === "Premium" ? "professor" : "student" },
    });

    res.status(200).json({
      message: "Payment successful! Your plan is activated.",
      transactionId,
      apiKey: apiKey.key,
      uploadsAllowed,
    });
  } catch (err) {
    console.error("simulatePayment error:", err);
    res.status(500).json({ message: "Payment simulation failed." });
  }
};
