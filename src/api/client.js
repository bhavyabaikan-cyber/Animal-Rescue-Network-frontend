import axios from "axios";

const api = axios.create({
  // ✅ Uses Vercel environment variable, falls back to localhost for development
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:12000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("🔑 [API] Token added to request");
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ [API] Unauthorized");
    }
    return Promise.reject(error);
  }
);

export default api;