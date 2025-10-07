// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import API from "../utils/api";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function Dashboard() {
  const [datasets, setDatasets] = useState([]);
  const [view, setView] = useState("table");

  useEffect(() => {
    const fetchData = async () => {
      const res = await API.get("/dataset/my");
      setDatasets(res.data);
    };
    fetchData();
  }, []);

  const tileContent = ({ date }) => {
    const day = date.toDateString();
    const items = datasets.filter(
      (d) => new Date(d.createdAt).toDateString() === day
    );
    if (!items.length) return null;
    return (
      <div className="mt-1">
        <span
          className="text-xs px-2 py-1 rounded"
          style={{
            background: items[0].colorCode || "#2563eb",
            color: "#fff",
          }}
        >
          {items.length}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">
          {view === "table" ? "My Uploaded Datasets" : "My Upload Calendar"}
        </h2>
        <button
          onClick={() => setView(view === "table" ? "calendar" : "table")}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Switch to {view === "table" ? "Calendar" : "Table"}
        </button>
      </div>

      {view === "calendar" ? (
        <div className="flex justify-center">
          <Calendar tileContent={tileContent} />
        </div>
      ) : datasets.length === 0 ? (
        <p className="text-gray-600">No datasets uploaded yet.</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2">Dataset Name</th>
              <th className="p-2">Raw Data</th>
              <th className="p-2">Final Value</th>
              <th className="p-2">Combined Total</th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((d) => (
              <tr key={d.id} className="border text-center">
                <td className="p-2">{d.datasetName}</td>
                <td className="p-2 truncate max-w-xs">{d.rawData}</td>
                <td className="p-2 text-green-700">{d.finalValue ?? "—"}</td>
                <td className="p-2">{d.combinedTotal ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
