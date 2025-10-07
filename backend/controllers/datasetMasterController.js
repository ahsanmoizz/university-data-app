import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const setFinalValue = async (req, res) => {
  try {
    const { datasetName, finalValue } = req.body;
    if (!datasetName || !finalValue) {
      return res.status(400).json({ message: "datasetName and finalValue required." });
    }

    const numericValue = parseFloat(finalValue);
    const isNumeric = !isNaN(numericValue);

    // ✅ match by datasetName not cleanedData
    const matchingDatasets = await prisma.dataset.findMany({
      where: { datasetName: { equals: datasetName, mode: "insensitive" } },
    });

    let combinedTotal = null;
    if (isNumeric && matchingDatasets.length > 0) {
      const allNums = [];
      for (const d of matchingDatasets) {
        const nums = (d.cleanedData || "")
          .split(",")
          .map((v) => parseFloat(v))
          .filter((n) => !isNaN(n));
        allNums.push(...nums);
      }
      combinedTotal = allNums.length ? allNums.reduce((a, b) => a + b, 0) : 0;
    }

    // ✅ upsert
    const updated = await prisma.datasetMaster.upsert({
      where: { datasetName },
      update: { finalValue, combinedTotal },
      create: { datasetName, finalValue, combinedTotal },
    });

    res.status(200).json({
      message: "Final value set successfully.",
      updated,
      affectedUsers: matchingDatasets.length,
    });
  } catch (error) {
    console.error("Error in setFinalValue:", error);
    res.status(500).json({ message: "Failed to set final value." });
  }
};

export const getAllDatasetMasters = async (req, res) => {
  try {
    const all = await prisma.datasetMaster.findMany({ orderBy: { updatedAt: "desc" } });
    res.status(200).json(all);
  } catch (error) {
    console.error("getAllDatasetMasters:", error);
    res.status(500).json({ message: "Failed to fetch dataset masters." });
  }
};



