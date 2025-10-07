import express from "express";
import { getPublicDatasets } from "../controllers/publicController.js";

const router = express.Router();

router.get("/public-datasets", getPublicDatasets);

export default router;
