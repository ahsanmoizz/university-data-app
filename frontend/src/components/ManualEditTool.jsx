import { useState } from "react";
import { updateEventManualEdit } from "../utils/api";

export default function ManualEditTool({ eventId, currentData }) {
  const [localData, setLocalData] = useState(currentData || {});
  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => {
    setLocalData({ ...localData, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEventManualEdit(eventId, { results: localData });
      alert("✅ Manual edit saved successfully!");
    } catch (err) {
      console.error("Manual edit failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-t pt-3 mt-3">
      <h5 className="font-semibold mb-2">✏️ Manual / Zero Edit</h5>
      {Object.entries(localData).map(([key, val]) => (
        <div key={key} className="flex items-center mb-2">
          <span className="w-32 text-sm text-gray-600">{key}</span>
          <input
            type="text"
            value={val}
            onChange={(e) => handleChange(key, e.target.value)}
            className="border p-1 rounded w-40 text-sm"
          />
        </div>
      ))}
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
