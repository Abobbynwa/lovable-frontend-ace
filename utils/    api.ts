// src/utils/api.ts
/// <reference types="vite/client" />
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((cfg) => {
  const tok = localStorage.getItem("token");
  if (tok && cfg.headers) cfg.headers.Authorization = `Bearer ${tok}`;
  return cfg;
});

export default apiClient;
