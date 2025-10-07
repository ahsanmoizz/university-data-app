// frontend/src/pages/PublicDatasets.jsx
import { useEffect, useState } from "react";
import API from "../utils/api";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function PublicDatasets() {
  const [datasets, setDatasets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table"); // table or calendar

  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const res = await API.get("/public-datasets");
        setDatasets(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Failed to load public datasets:", err);
      }
    };
    fetchPublic();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      datasets.filter(
        (d) =>
          d.datasetName?.toLowerCase().includes(term) ||
          d.finalValue?.toString().toLowerCase().includes(term)
      )
    );
  }, [search, datasets]);

  // ✅ Calendar bubble per dataset
  const tileContent = ({ date }) => {
    const dayDatasets = datasets.filter(
      (d) => new Date(d.createdAt).toDateString() === date.toDateString()
    );
    if (dayDatasets.length > 0) {
      return (
        <div
          className="text-xs text-white rounded p-1 mt-1"
          style={{ background: dayDatasets[0].colorCode || "#2563eb" }}
        >
          {dayDatasets.length}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Public Datasets
      </h2>

      {/* 🔍 Search + View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between mb-6">
        <input
          type="text"
          placeholder="Search dataset name or value..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/2 mb-3 sm:mb-0"
        />

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded ${
              viewMode === "table" ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 rounded ${
              viewMode === "calendar" ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* 📅 Table or Calendar */}
      {filtered.length === 0 ? (
        <p className="text-gray-600 text-center">No public datasets yet.</p>
      ) : viewMode === "table" ? (
        <table className="w-full border text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2">Dataset Name</th>
              <th className="p-2">Final Value</th>
              <th className="p-2">Combined Total</th>
              <th className="p-2">Image</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border text-center">
                <td className="p-2">{d.datasetName}</td>
                <td className="p-2 text-green-600 font-medium">
                  {d.finalValue ?? "—"}
                </td>
                <td className="p-2">{d.combinedTotal ?? "—"}</td>
                <td className="p-2">
                  {d.imageUrl ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${d.imageUrl.replace(
                        "uploads/",
                        "uploads/"
                      )}`}
                      alt="dataset"
                      className="w-16 h-16 object-cover mx-auto rounded"
                    />
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex justify-center overflow-x-auto p-2">
          <Calendar
            tileContent={tileContent}
            onClickDay={(date) => {
              const matches = datasets.filter(
                (d) => new Date(d.createdAt).toDateString() === date.toDateString()
              );
              if (matches.length) {
                alert(
                  matches
                    .map((m) => `${m.datasetName}: ${m.finalValue ?? "—"}`)
                    .join("\n")
                );
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
