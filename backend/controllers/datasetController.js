// backend/controllers/datasetController.js
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import fs from "fs";
import path from "path";
import { cleanDataString } from "../utils/dataCleaner.js";

const prisma = new PrismaClient();

// 🔹 Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
export const upload = multer({ storage });

// 🔹 Upload + Normalize Handler
export const uploadDataset = async (req, res) => {
  try {
    const userId = req.user?.id;
    // ✅ Enforce upload limit (5 free uploads)
const totalUploads = await prisma.dataset.count({ where: { userId } });

// If more than 5 uploads, require API key
if (totalUploads >= 5) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(403).json({
      message: "Upload limit reached (5 datasets). Please enter an API key or upgrade your plan.",
    });
  }

  // Validate key
  const keyRecord = await prisma.apiKey.findFirst({
    where: { key: apiKey, userId, active: true },
  });

  if (!keyRecord) {
    return res.status(403).json({ message: "Invalid or inactive API key." });
  }

  // Optional: Check key expiry
  if (new Date(keyRecord.validTo) < new Date()) {
    return res.status(403).json({ message: "API key expired. Please renew your plan." });
  }
}

    const datasetName = req.body.datasetName?.trim();
    let rawData = "";

    if (!datasetName) {
      return res.status(400).json({ message: "Dataset name is required." });
    }

    // Read text from uploaded file (if provided)
    if (req.file && req.file.mimetype.startsWith("text/")) {
      rawData = fs.readFileSync(req.file.path, "utf8");
    } else {
      rawData = req.body.rawData || "";
    }

    if (!rawData.trim()) {
      return res.status(400).json({ message: "No data provided." });
    }

    // Clean the data
    const cleanedData = cleanDataString(rawData);

    // Save file path if image uploaded
    let imageUrl = null;
    if (req.file && req.file.mimetype.startsWith("image/")) {
      imageUrl = path.join("uploads", req.file.filename);
    }

    // Save to DB
    const dataset = await prisma.dataset.create({
      data: {
        datasetName,
        rawData,
        cleanedData,
        userId,
        imageUrl,
        colorCode: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // ✅ Add here
      },
    });

    res.status(201).json({
      message: "✅ Dataset uploaded and cleaned successfully!",
      dataset,
    });
  } catch (err) {
    console.error("❌ Error uploading dataset:", err);
    res.status(500).json({ message: "Error uploading dataset." });
  }
};

// 🔹 Get All Datasets (for professors/admins)
export const getAllDatasets = async (req, res) => {
  try {
    const datasets = await prisma.dataset.findMany({
      include: {
        user: {
          select: { email: true, username: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(datasets);
  } catch (err) {
    console.error("❌ Error fetching all datasets:", err);
    res.status(500).json({ message: "Failed to fetch all datasets." });
  }
};
// backend/controllers/datasetController.js (add near other exports)
export const setDatasetColor = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { colorCode } = req.body;
    if (!id || !colorCode) return res.status(400).json({ message: "id and colorCode required." });

    const updated = await prisma.dataset.update({
      where: { id },
      data: { colorCode },
    });
    res.json({ message: "Color updated.", dataset: updated });
  } catch (err) {
    console.error("setDatasetColor error:", err);
    res.status(500).json({ message: "Failed to set color." });
  }
};
export const getAllAnalyzed = async (req, res) => {
  try {
    const results = await prisma.analysisResult.findMany({
      include: { user: { select: { email: true, username: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(results);
  } catch (err) {
    console.error("getAllAnalyzed:", err);
    res.status(500).json({ message: "Failed to fetch analysis results." });
  }
};


