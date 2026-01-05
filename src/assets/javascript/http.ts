import axios from "axios";

const API_BASE = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/+$/, "");

const http = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true,
});

export default http;
