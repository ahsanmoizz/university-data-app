import { useState } from "react";
import API from "../utils/api";

export default function UploadAnalyze() {
  const [datasetName, setDatasetName] = useState("");
  const [eventName, setEventName] = useState("");
  const [rawData, setRawData] = useState("");
  const [image, setImage] = useState(null);
  const [datasetFile, setDatasetFile] = useState(null);
  const [analysisReport, setAnalysisReport] = useState(null);
  const [eventReport, setEventReport] = useState(null);

  /* ----------------------------------------------
     ✅ Upload dataset
  ---------------------------------------------- */
  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("datasetName", datasetName);

      if (datasetFile) formData.append("file", datasetFile);
      else if (rawData) formData.append("rawData", rawData);

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
      setDatasetFile(null);
    } catch (err) {
      alert("❌ Upload failed");
      console.error(err);
    }
  };

  /* ----------------------------------------------
     ✅ Analyze dataset (student vs professor)
  ---------------------------------------------- */
  const handleAnalyze = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user?.id) {
        alert("You must be logged in to analyze.");
        return;
      }
      if (!datasetName.trim()) {
        alert("Please enter a dataset name.");
        return;
      }

      const payload = { userId: user.id, datasetName: datasetName.trim() };

      const { data } = await API.post("/analyze", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAnalysisReport(data);
      setEventReport(null); // clear old event results
    } catch (err) {
      alert("❌ Dataset analysis failed");
      console.error(err);
    }
  };

  /* ----------------------------------------------
     ✅ Event-level analysis (totals, min, max)
  ---------------------------------------------- */
  const handleEventAnalyze = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user?.id) {
        alert("You must be logged in to analyze events.");
        return;
      }
      if (!eventName.trim()) {
        alert("Please enter event name.");
        return;
      }

      const payload = { userId: user.id, eventName: eventName.trim() };

      const { data } = await API.post("/analyze/event-analyze", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEventReport(data);
      setAnalysisReport(null); // clear old dataset results
    } catch (err) {
      alert("❌ Event analysis failed");
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h2 className="text-3xl font-semibold text-center mb-4">
        Upload & Analyze Dataset
      </h2>

      {/* Upload dataset section */}
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

        <input
          type="file"
          accept=".csv, .xls, .xlsx"
          onChange={(e) => setDatasetFile(e.target.files[0])}
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


      {/* Dataset-level analysis report */}
      {analysisReport && (
        <div className="border p-4 rounded shadow-md bg-white">
          <h3 className="font-bold text-lg mb-2">Dataset Analysis Report:</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(analysisReport, null, 2)}
          </pre>
        </div>
      )}

      
    </div>
  );
}
