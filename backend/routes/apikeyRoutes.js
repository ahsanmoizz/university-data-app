// backend/routes/apiKeyRoutes.js
import express from "express";
import { generateApiKey, listMyApiKeys } from "../controllers/apiKeyController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", authenticateToken, generateApiKey);
router.get("/my", authenticateToken, listMyApiKeys);

export default router;
