import axios from "axios";

const API_BASE = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/+$/, "");

const http = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;

