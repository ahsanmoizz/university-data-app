// backend/controllers/analysisController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const analyzeData = async (req, res) => {
  try {
    const { userId, datasetName } = req.body;
    if (!userId || !datasetName)
      return res.status(400).json({ message: "userId and datasetName are required." });

    // 1️⃣ Get user's dataset
    const userDataset = await prisma.dataset.findFirst({
      where: { userId: parseInt(userId), datasetName },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    if (!userDataset) return res.status(404).json({ message: "User dataset not found." });

    // 2️⃣ Get reference dataset
    const reference = await prisma.datasetMaster.findFirst({
      where: { datasetName: { equals: datasetName, mode: "insensitive" } },
    });
    if (!reference) return res.status(404).json({ message: "Reference dataset not found." });

    // 3️⃣ Split data
    const userValues = (userDataset.cleanedData || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const refValues = (reference.finalValue || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    // 4️⃣ Compare
    const missing = refValues.filter((v) => !userValues.includes(v));
    const extra = userValues.filter((v) => !refValues.includes(v));
    const matched = userValues.filter((v) => refValues.includes(v));
    const total = refValues.length || 1;
    const matchPercentage = ((matched.length / total) * 100).toFixed(2);

    // 5️⃣ Frequency (how many times each value appeared in all uploads)
    const allDatasets = await prisma.dataset.findMany({ where: { datasetName } });
    const freq = {};
    allDatasets.forEach((d) => {
      const vals = (d.cleanedData || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      vals.forEach((v) => (freq[v] = (freq[v] || 0) + 1));
    });

    // 6️⃣ Summary
    const summary = {
      username: userDataset.user?.username || "Unknown",
      datasetName,
      uploadDate: new Date(userDataset.createdAt).toLocaleDateString(),
      uploadTime: new Date(userDataset.createdAt).toLocaleTimeString(),
      analyzedValue: matched.join(", ") || "—",
      result: `${matchPercentage}% match`,
      imageUrl: userDataset.imageUrl || null,
    };

    // 7️⃣ Save analysis result
    await prisma.analysisResult
      .create({
        data: {
          userId: parseInt(userId),
          datasetName,
          matchPercentage: parseFloat(matchPercentage),
          missing: JSON.stringify(missing),
          extra: JSON.stringify(extra),
          result: summary.result,
          analyzedValue: summary.analyzedValue,
          imageUrl: summary.imageUrl,
        },
      })
      .catch(() => {});

    // 8️⃣ Update dataset (to show professor/public)
    try {
      await prisma.dataset.update({
        where: { id: userDataset.id },
        data: {
          finalValue: reference.finalValue ?? null,
          combinedTotal: reference.combinedTotal ?? null,
        },
      });
    } catch (e) {
      console.warn("Failed to update dataset with finalValue/combinedTotal:", e.message);
    }

    // ✅ Final response
    res.json({
      message: "Analysis complete.",
      summary,
      details: { matched, missing, extra, matchPercentage, frequency: freq },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Failed to analyze dataset." });
  }
};

// 🕘 User history
export const getAnalysisHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const rows = await prisma.analysisResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(rows);
  } catch (err) {
    console.error("getAnalysisHistory error:", err);
    res.status(500).json({ message: "Failed to get history." });
  }
};
