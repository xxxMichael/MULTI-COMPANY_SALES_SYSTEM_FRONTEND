import axios from "axios";
import { getAuth } from "../state/auth";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

// Interceptor de request - agregar JWT
http.interceptors.request.use(
  (config) => {
    const auth = getAuth();

    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    } else {
      console.warn("No hay token JWT disponible");
      console.log(" Estado de auth completo:", auth);
      console.log("localStorage mcms_auth:", localStorage.getItem("mcms_auth"));
    }
    
    return config;
  },
  (error) => {
    console.error(" Error en request interceptor:", error);
    return Promise.reject(error);
  }
);


http.interceptors.response.use(
  (response) => {
    console.log("HTTP Response Success:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("HTTP Response Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.config?.headers,
    });


    return Promise.reject(error);
  }
);

export default http;
