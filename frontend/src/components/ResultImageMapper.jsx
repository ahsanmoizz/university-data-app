import { useState } from "react";
import API from "../utils/api";

export default function ResultImageMapper({ eventId, baseResults = {} }) {
  const [files, setFiles] = useState({});

  const handleFileChange = (key, file) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleUpload = async () => {
    const formData = new FormData();

    // pick the first image only for now (backend supports single upload)
    const firstKey = Object.keys(files)[0];
    if (!firstKey) {
      alert("Please select at least one image.");
      return;
    }

    formData.append("image", files[firstKey]); // ✅ must be 'image'

    try {
      await API.post(`/events/upload-result-image/${eventId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Image uploaded successfully!");
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("❌ Upload failed — check console");
    }
  };

  return (
    <div className="border-t pt-3 mt-3">
      <h5 className="font-semibold mb-2">🖼️ Map Images to Results</h5>

      {Object.entries(baseResults || {}).map(([key, value], i) => (
        <div key={i} className="flex justify-between items-center border-b py-1">
          <span className="font-medium text-gray-700">{key}</span>
            <span className="text-gray-900">
  {typeof value === "object"
    ? Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")
    : value ?? "—"}
</span>
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => handleFileChange(key, e.target.files[0])}
          />
        </div>
      ))}

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm mt-2"
      >
        Upload
      </button>
    </div>
  );
}
