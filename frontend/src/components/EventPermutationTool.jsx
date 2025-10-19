import { useState, useEffect } from "react";
import API from "../utils/api";
import { getPermutations } from "../utils/permutationUtil"; // must exist in utils folder

export default function EventPermutationTool({
  eventName: propEventName,
  date: propDate,
  baseResults = [],
}) {
  // if used standalone, user can type values manually
  const [eventName, setEventName] = useState(propEventName || "");
  const [date, setDate] = useState(propDate || "");
  const [k, setK] = useState(2);
  const [result, setResult] = useState(null);
  const [permutations, setPermutations] = useState([]);

  // 🔹 Auto-generate permutations if `baseResults` given from CalendarView
  useEffect(() => {
    if (baseResults && baseResults.length > 0) {
      const perms = getPermutations(baseResults, k);
      setPermutations(perms.map((p) => ({ perm: p, count: 0 })));
    }
  }, [baseResults, k]);

  // 🔹 Manual "Analyze" button for standalone mode
  const handleFetch = async () => {
    if (!eventName || !date) {
      alert("Enter both event name and date (YYYY-MM-DD)");
      return;
    }
    try {
      const { data } = await API.get(
        `/events/event-permutations?eventName=${encodeURIComponent(
          eventName
        )}&date=${date}&k=${k}`
      );
      setResult(data.data);
    } catch (err) {
      console.error("Failed:", err);
      alert("❌ Failed to fetch permutations");
    }
  };

  // 🔹 Save representative (least permutation)
  const handleSelectLeast = async (perm) => {
    try {
      const body = {
        eventName: propEventName || eventName,
        date: propDate || date,
        k,
        permutation: Array.isArray(perm) ? perm.join(", ") : perm,
      };
      const res = await API.post("/events/set-representative", body);
      alert(res.data.message || "✅ Representative set successfully");
    } catch (err) {
      console.error("Failed to set representative:", err);
      alert("Failed to set representative");
    }
  };

  return (
    <div className="border p-4 rounded bg-gray-50 shadow mt-6">
      <h3 className="text-xl font-bold mb-3">🔢 Event Permutation Analysis</h3>

      {/* Show input controls only if not embedded */}
      {!propEventName && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="number"
            min={2}
            max={5}
            value={k}
            onChange={(e) => setK(parseInt(e.target.value))}
            className="border p-2 rounded w-24"
          />
          <button
            onClick={handleFetch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Analyze
          </button>
        </div>
      )}

      {/* Embedded or standalone results */}
      {result ? (
        <div className="bg-white border p-3 rounded max-h-96 overflow-auto">
          <h4 className="font-semibold mb-2">
            Permutations (k={result.k}) from pool: [{result.pool.join(", ")}]
          </h4>
          <ul className="text-sm space-y-1">
            {result.permutations.map((p, idx) => (
              <li key={idx}>
                {p.perm} → <strong>{p.count}</strong>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleSelectLeast(result.permutations[0].perm)}
            className="mt-3 bg-green-600 text-white px-3 py-1 rounded"
          >
            Set Least Permutation
          </button>
        </div>
      ) : baseResults?.length > 0 ? (
        <ul className="text-sm space-y-1 max-h-60 overflow-auto">
          {permutations.map((p, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center border-b py-1"
            >
              <span>{p.perm.join(", ")}</span>
              <button
                onClick={() => handleSelectLeast(p.perm)}
                className="bg-green-600 text-white px-2 py-1 rounded text-xs"
              >
                Set Least
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">
          Upload dataset or enter event info to view permutations.
        </p>
      )}
    </div>
  );
}
