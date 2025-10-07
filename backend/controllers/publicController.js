// backend/controllers/publicController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getPublicDatasets = async (req, res) => {
  try {
    const datasets = await prisma.dataset.findMany({
      select: {
        id: true,
        datasetName: true,
        finalValue: true,
        combinedTotal: true,
        colorCode: true,
        imageUrl: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(datasets);
  } catch (error) {
    console.error("Error fetching public datasets:", error);
    res.status(500).json({ error: "Failed to fetch public datasets" });
  }
};
