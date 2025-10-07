// backend/routes/adminRoutes.js
import express from "express";
import {
  getAllUsers,
  toggleUserBlock,
  promoteUser,
  getAllKeys,
  revokeKey,
  getAllPayments,
  getOverview,
  getAllDatasetsAdmin,
} from "../controllers/adminController.js";
import { authenticateToken, authorizeAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 👥 Users
router.get("/users", authenticateToken, authorizeAdmin, getAllUsers);
router.patch("/users/:id/block", authenticateToken, authorizeAdmin, toggleUserBlock);
router.post("/users/promote", authenticateToken, authorizeAdmin, promoteUser);

// 🔑 API Keys
router.get("/keys", authenticateToken, authorizeAdmin, getAllKeys);
router.delete("/keys/:id/revoke", authenticateToken, authorizeAdmin, revokeKey);

// 💳 Payments
router.get("/payments", authenticateToken, authorizeAdmin, getAllPayments);

// 📊 Datasets
router.get("/datasets", authenticateToken, authorizeAdmin, getAllDatasetsAdmin);

// 📈 Overview (counts)
router.get("/overview", authenticateToken, authorizeAdmin, getOverview);

export default router;
