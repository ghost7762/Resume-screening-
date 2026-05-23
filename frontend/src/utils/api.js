import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({ baseURL: BASE });

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const analyzeText = (payload) =>
  api.post("/api/resume/analyze-text", payload).then((r) => r.data);

export const uploadFile = (formData) =>
  api.post("/api/resume/upload", formData).then((r) => r.data);

export const getCandidates = (params = {}) =>
  api.get("/api/candidates", { params }).then((r) => r.data);

export const getCandidate = (id) =>
  api.get(`/api/candidates/${id}`).then((r) => r.data);

export const deleteCandidate = (id) =>
  api.delete(`/api/candidates/${id}`).then((r) => r.data);

export const getStats = () =>
  api.get("/api/stats").then((r) => r.data);

export const login = (username, password) =>
  api.post("/api/auth/login", { username, password }).then((r) => r.data);

export const getCurrentUser = () =>
  api.get("/api/auth/me").then((r) => r.data);

export default api;
