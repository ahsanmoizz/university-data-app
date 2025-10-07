import React, { useEffect, useState } from "react";
import API from "../utils/api";

export default function PublicDashboard() {
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    API.get("/public-datasets")
      .then((res) => setDatasets(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center">
         Public Dataset Dashboard
      </h2>

      {datasets.length === 0 ? (
        <p className="text-center text-gray-600">No datasets yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {datasets.map((d) => (
            <div
              key={d.id}
              className="border rounded-lg p-4 shadow-md text-center"
              style={{ borderColor: d.colorCode }}
            >
              <h3
                className="font-semibold text-lg mb-2"
                style={{ color: d.colorCode }}
              >
                {d.name}
              </h3>
              <p>
                <span className="font-medium">Final Value:</span>{" "}
                {d.finalValue || "Not set"}
              </p>
              <p>
                <span className="font-medium">Combined Total:</span>{" "}
                {d.combinedTotal ?? "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
