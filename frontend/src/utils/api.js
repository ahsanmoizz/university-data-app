import axios from "axios";
const api = axios.create({ baseURL: "https://student.curnce.com/api" });

// attach token automatically

// Attach token automatically
api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ------------------------------
// 🔹 Dataset / Event Upload APIs
// ------------------------------
export const uploadEventData = (formData) =>
  api.post("/events/upload-event-data", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ------------------------------
// 🔹 Calendar / Event Data APIs
// ------------------------------
export const getAvailableDates = () => api.get("/events/available-dates");

export const getEventDataByDate = (year, month, day) =>
  api.get("/events/event-data-by-date", { params: { year, month, day } });

// ------------------------------
// 🔹 Representative / Permutation APIs (next phase ready)
// ------------------------------
export const setRepresentative = (payload) =>
  api.post("/events/set-representative", payload);

// ------------------------------
// 🔹 Future placeholders for Zero/Manual Edit or Image mapping
// ------------------------------
export const updateEventManualEdit = (eventId, data) =>
  api.post(`/events/${eventId}/manual-edit`, data);

export const uploadResultImage = (formData) =>
  api.post("/events/upload-result-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export default api;

