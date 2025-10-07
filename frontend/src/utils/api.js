import axios from "axios";
const API = axios.create({ baseURL: "http://95.217.129.142:5000/api" });

// attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});
export default API;
