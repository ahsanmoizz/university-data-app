// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import fs from "fs";

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import datasetRoutes from "./routes/datasetRoutes.js";
import datasetMasterRoutes from "./routes/datasetMasterRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import apiKeyRoutes from "./routes/apikeyRoutes.js";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// ✅ Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
  console.log("📁 'uploads' folder created!");
}

// ✅ Global middleware
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded files (images, etc.)
app.use("/uploads", express.static("uploads"));
// Now, anything stored in /uploads can be accessed like:
// http://localhost:5000/uploads/<filename>.jpg

// ✅ Test route
app.get("/", (req, res) => res.send("✅ API running successfully!"));

// ✅ Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/data", datasetRoutes);
app.use("/api/dataset-master", datasetMasterRoutes);
app.use("/api", analysisRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", publicRoutes);
app.use("/api/keys", apiKeyRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
