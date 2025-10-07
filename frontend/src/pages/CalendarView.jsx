import React, { useEffect, useState } from "react";
import API from "../utils/api";

/**
 * CalendarView.jsx
 * Shows uploaded datasets grouped by date.
 */
export default function CalendarView() {
  const [datasets, setDatasets] = useState([]);
  const [grouped, setGrouped] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/data/my");
 // ✅ your backend endpoint
        setDatasets(res.data);

        // group by date
        const groupedData = res.data.reduce((acc, item) => {
          const date = new Date(item.createdAt).toLocaleDateString();
          if (!acc[date]) acc[date] = [];
          acc[date].push(item);
          return acc;
        }, {});
        setGrouped(groupedData);
      } catch (err) {
        console.error("Error fetching calendar data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center">
        📅 Dataset Upload Calendar
      </h2>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-gray-600 text-center">No datasets uploaded yet.</p>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="border rounded-lg p-4 shadow">
              <h3 className="text-xl font-semibold mb-3 text-blue-700">
                {date}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {items.map((d) => (
                  <div
                    key={d.id}
                    className="border p-3 rounded shadow hover:shadow-lg transition"
                  >
                    <h4 className="font-bold text-lg mb-2 text-gray-800">
                      {d.datasetName}
                    </h4>

                    {d.imageUrl && (
                      <img
                        src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${d.imageUrl.replace("uploads/", "")}`}
                        alt={d.datasetName}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}

                    <p className="text-sm text-gray-600">
                      <strong>Uploaded at:</strong>{" "}
                      {new Date(d.createdAt).toLocaleTimeString()}
                    </p>

                    <p className="text-sm">
                      <strong>Result:</strong>{" "}
                      <span className="text-green-600 font-medium">
                        {d.analyzedValue ?? "—"}
                      </span>
                    </p>

                    {d.result && (
                      <p className="text-sm text-gray-700 mt-1">
                        <strong>Summary:</strong> {d.result}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
