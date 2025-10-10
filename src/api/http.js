import axios from "axios";
import { getAuth } from "../state/auth";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

http.interceptors.request.use((config) => {
  const auth = getAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

export default http;
