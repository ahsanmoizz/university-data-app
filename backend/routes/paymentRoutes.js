import express from "express";
import { getPlans, simulatePayment } from "../controllers/paymentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// List plans (public)
router.get("/plans", getPlans);

// Simulate payment (authenticated users only)
router.post("/simulate-payment", authenticateToken, simulatePayment);

export default router;
