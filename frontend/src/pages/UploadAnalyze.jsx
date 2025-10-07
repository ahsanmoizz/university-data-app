import { useState } from "react";
import API from "../utils/api";

export default function UploadAnalyze() {
  const [datasetName, setDatasetName] = useState("");
  const [rawData, setRawData] = useState("");
  const [image, setImage] = useState(null);
  const [analysisReport, setAnalysisReport] = useState(null);

  // ✅ Upload raw data + optional image
  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("datasetName", datasetName);
      formData.append("rawData", rawData);
      if (image) formData.append("image", image);

      const apiKey = document.getElementById("apiKeyInput")?.value || "";

await API.post("/data/upload-dataset", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
    "x-api-key": apiKey,
  },
});

      alert("✅ Dataset uploaded successfully!");
      setDatasetName("");
      setRawData("");
      setImage(null);
    } catch (err) {
      alert("❌ Upload failed");
      console.error(err);
    }
  };

  // ✅ Analyze dataset
  const handleAnalyze = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const { data } = await API.post("/analyze", {
        userId: user.id,
        datasetName,
      });

      setAnalysisReport(data);
    } catch (err) {
      alert("❌ Analysis failed");
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h2 className="text-3xl font-semibold text-center mb-4">
        Upload & Analyze Dataset
      </h2>

      {/* Dataset upload section */}
      <div className="border p-4 rounded shadow-md bg-gray-50">
        <h3 className="text-lg font-bold mb-3">Upload Dataset</h3>
        <input
          type="text"
          placeholder="Dataset Name"
          className="border p-2 w-full mb-3"
          value={datasetName}
          onChange={(e) => setDatasetName(e.target.value)}
        />
        <textarea
          placeholder="Enter Raw Data (e.g. Mango, Banana, Guava)"
          className="border p-2 w-full mb-3 h-32"
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
        />
        <input
  type="text"
  placeholder="Enter API Key (optional, if limit reached)"
  className="border p-2 w-full mb-3"
  id="apiKeyInput"
/>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="border p-2 w-full mb-3"
        />
        <div className="flex gap-4">
          <button
            onClick={handleUpload}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Upload Dataset
          </button>
          <button
            onClick={handleAnalyze}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded"
          >
            Analyze Data
          </button>
        </div>
      </div>

      {/* Analysis report section */}
      {analysisReport && (
        <div className="border p-4 rounded shadow-md bg-white">
          <h3 className="font-bold text-lg mb-2">Analysis Report:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(analysisReport, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
