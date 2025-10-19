import React, { useState, useEffect } from "react";
import API from "../utils/api";
import CalendarView from "./CalendarView";
import EventPermutationTool from "../components/EventPermutationTool";

export default function ProfessorPanel() {
  const [datasetName, setDatasetName] = useState("");
  const [finalValue, setFinalValue] = useState("");
  const [allMasters, setAllMasters] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [updateValue, setUpdateValue] = useState({});
  const [activeTab, setActiveTab] = useState("reference");

  // 📤 New states for Event Upload
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDatasetName, setUploadDatasetName] = useState("");

  // 🧠 Fetch all professor-defined reference datasets
  const fetchMasters = async () => {
    try {
      const res = await API.get("/dataset-master/all");
      setAllMasters(res.data);
    } catch (err) {
      console.error("Failed to load dataset masters:", err);
    }
  };

  // 🧠 Fetch all uploaded datasets from students
  const fetchStudentDatasets = async () => {
    try {
      const res = await API.get("/data/all");
      setDatasets(res.data);
    } catch (err) {
      console.error("Failed to load student datasets:", err);
    }
  };

  // 🧩 Create new reference dataset
  const handleSetReference = async () => {
    if (!datasetName || !finalValue) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await API.post("/dataset-master/set-final-value", { datasetName, finalValue });
      alert("✅ Reference dataset saved successfully!");
      setDatasetName("");
      setFinalValue("");
      fetchMasters();
    } catch (err) {
      console.error(err);
      alert("Failed to save reference dataset.");
    }
  };

  // 🧩 Set or update final value for any existing uploaded dataset
  const handleUpdateFinalValue = async (datasetId) => {
    const value = updateValue[datasetId];
    if (!value) {
      alert("Please enter a value before saving.");
      return;
    }

    try {
      await API.post("/dataset/set-final-value", { datasetId, finalValue: value });
      alert("✅ Final value updated!");
      fetchStudentDatasets();
    } catch (err) {
      console.error("Failed to set value:", err);
      alert("Failed to update value.");
    }
  };

  // 📤 Upload Event Data (new)
  const handleUploadEventData = async () => {
    if (!uploadFile || !uploadDatasetName) {
      alert("Please select a file and enter dataset name.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("datasetName", uploadDatasetName);

      const res = await API.post("/events/upload-event-data", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Dataset uploaded and parsed successfully!");
      console.log("Event upload result:", res.data);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("❌ Upload failed — check console or backend logs.");
    }
  };

  useEffect(() => {
    fetchMasters();
    fetchStudentDatasets();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 space-y-10">
      <h2 className="text-3xl font-semibold text-center mb-6">
        Professor Dashboard
      </h2>

      {/* Tabs */}
      <div className="flex justify-center mb-6 space-x-3">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "reference"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("reference")}
        >
          Reference & Uploads
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "calendar"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("calendar")}
        >
          Calendar View
        </button>
      </div>

      {activeTab === "reference" ? (
        <>
          {/* ✅ Create Reference Dataset */}
          <div className="border p-4 rounded-lg bg-gray-50 mb-6">
            <h3 className="text-xl font-bold mb-3">Set New Reference Dataset</h3>
            <input
              type="text"
              placeholder="Dataset Name (e.g. ABC)"
              className="border p-2 w-full mb-3"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
            />
            <textarea
              placeholder="Enter Final (Correct) Values — comma separated"
              className="border p-2 w-full mb-3 h-28"
              value={finalValue}
              onChange={(e) => setFinalValue(e.target.value)}
            />
            <button
              onClick={handleSetReference}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Save Reference Dataset
            </button>
          </div>

          {/* ✅ All Reference Datasets */}
          <div className="border p-4 rounded-lg bg-white shadow">
            <h3 className="text-xl font-bold mb-4">All Reference Datasets</h3>
            {allMasters.length === 0 ? (
              <p>No reference datasets yet.</p>
            ) : (
              <ul className="space-y-2">
                {allMasters.map((ds) => (
                  <li
                    key={ds.id}
                    className="border-b pb-2 flex justify-between text-gray-700"
                  >
                    <span>
                      <strong>{ds.datasetName}</strong>: {ds.finalValue}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 📤 Upload Event Data Section (NEW) */}
          <div className="border p-4 rounded-lg bg-gray-50 shadow mt-8">
            <h3 className="text-xl font-bold mb-4">📤 Upload Event Data</h3>
            <p className="text-gray-600 mb-3">
              Upload .xlsx or .csv file containing event rows (Date, EventName, From Time, To Time, etc.)
            </p>
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="border p-2 w-full mb-3"
            />
            <input
              type="text"
              placeholder="Dataset Name (e.g. Planets)"
              className="border p-2 w-full mb-3"
              value={uploadDatasetName}
              onChange={(e) => setUploadDatasetName(e.target.value)}
            />
            <button
              onClick={handleUploadEventData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Upload Event Data
            </button>
          </div>

          {/* ✅ Student Uploaded Datasets */}
          <div className="border p-4 rounded-lg bg-gray-50 shadow">
            <h3 className="text-xl font-bold mb-4">
              Student Uploaded Datasets
            </h3>

            {datasets.length === 0 ? (
              <p>No datasets uploaded yet.</p>
            ) : (
              <table className="w-full border text-sm">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="p-2">Dataset Name</th>
                    <th className="p-2">Uploaded By</th>
                    <th className="p-2">Final Value</th>
                    <th className="p-2">Image</th>
                    <th className="p-2">Set / Update</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((d) => (
                    <tr key={d.id} className="border text-center">
                      <td className="p-2">{d.datasetName}</td>
                      <td className="p-2">{d.user?.email ?? "Unknown"}</td>
                      <td className="p-2 text-green-700">
                        {d.finalValue ?? "—"}
                      </td>
                      <td className="p-2">
                        {d.imageUrl ? (
                          <img
                            src={`${
                              import.meta.env.VITE_API_URL ||
                              "http://localhost:5000"
                            }/uploads/${d.imageUrl.replace("uploads/", "")}`}
                            alt="dataset"
                            className="w-16 h-16 object-cover mx-auto rounded"
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Value"
                          className="border p-1 w-32 mr-2"
                          value={updateValue[d.id] || ""}
                          onChange={(e) =>
                            setUpdateValue({
                              ...updateValue,
                              [d.id]: e.target.value,
                            })
                          }
                        />
                        <button
                          onClick={() => handleUpdateFinalValue(d.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div className="p-4 border rounded bg-gray-50 shadow">
          <CalendarView />
          <EventPermutationTool />
        </div>
      )}
    </div>
  );
}
