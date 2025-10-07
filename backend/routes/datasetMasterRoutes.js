import express from "express";
import { setFinalValue, getAllDatasetMasters } from "../controllers/datasetMasterController.js";
import { authenticateToken, authorizeAdminOrProfessor } from "../middleware/authMiddleware.js";

const router = express.Router();

// Professor/Admin only routes
router.post("/set-final-value", authenticateToken, authorizeAdminOrProfessor, setFinalValue);
router.get("/all", authenticateToken, authorizeAdminOrProfessor, getAllDatasetMasters);

export default router;
