// backend/routes/datasetRoutes.js
import express from "express";
import multer from "multer";
import { authenticateToken, authorizeAdminOrProfessor } from "../middleware/authMiddleware.js";
import { uploadDataset, getAllDatasets, setDatasetColor } from "../controllers/datasetController.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ✅ Multer for uploads
const upload = multer({ dest: "uploads/" });

// ✅ 1️⃣ Upload dataset (student)
router.post(
  "/upload-dataset",
  authenticateToken,
  upload.single("image"),
  uploadDataset
);

// ✅ 2️⃣ Fetch all datasets uploaded by the logged-in user (student view)
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const datasets = await prisma.dataset.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(datasets);
  } catch (err) {
    console.error("❌ Error fetching datasets:", err);
    res.status(500).json({ error: "Failed to fetch datasets." });
  }
});

// ✅ 3️⃣ Fetch all datasets (professor/admin view)
router.get("/all", authenticateToken, authorizeAdminOrProfessor, getAllDatasets);
router.post("/:id/set-color", authenticateToken, authorizeAdminOrProfessor, setDatasetColor);
export default router;
