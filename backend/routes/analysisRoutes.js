// backend/routes/analysisRoutes.js (adjust)
import express from "express";
import multer from "multer";
import { analyzeData, getAnalysisHistory } from "../controllers/analysisController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/analyze", authenticateToken, upload.single("image"), analyzeData);
router.get("/history", authenticateToken, getAnalysisHistory);

export default router;
