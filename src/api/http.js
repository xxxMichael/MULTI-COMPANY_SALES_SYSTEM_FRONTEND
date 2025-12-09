import axios from "axios";
import { getAuth } from "../state/auth";

// Variable global para rastrear si ya se mostró el modal
let sessionExpiredShown = false;

const http = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL,
});

/* ============================
 * Interceptor de REQUEST
 *  - Inyecta Authorization: Bearer <token>
 * ============================ */
http.interceptors.request.use(
  (config) => {
    const auth = getAuth();
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    } else {
      console.warn("[HTTP] No hay token JWT disponible");
      try {
        console.log("Estado de auth:", auth);
        console.log("localStorage mcms_auth:", localStorage.getItem("mcms_auth"));
      } catch {
      }
    }
    return config;
  },
  (error) => {
    console.error("[HTTP] Error en request interceptor:", error);
    return Promise.reject(error);
  }
);

/* ============================
 * Interceptor de RESPONSE
 *  - Logs de errores
 *  - Logout SOLO en 401 (no autenticado / token expirado)
 *    * 403: lo maneja la UI (el usuario está autenticado pero sin permisos)
 * ============================ */
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const cfg = error?.config;

    console.error("[HTTP] Response Error:", {
      url: cfg?.url,
      method: cfg?.method,
      status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
    });

    if (status === 401) {
      // Evitar mostrar múltiples modales
      if (!sessionExpiredShown) {
        sessionExpiredShown = true;
        
        // Disparar evento personalizado para mostrar el modal
        window.dispatchEvent(new CustomEvent('sessionExpired'));
        
        // Limpiar auth después de un pequeño delay
        setTimeout(() => {
          import("../state/auth").then(({ clearAuth }) => {
            clearAuth();
          });
        }, 500);
      }
    }

    return Promise.reject(error);
  }
);

// Función para resetear el flag (útil después del login)
export const resetSessionExpiredFlag = () => {
  sessionExpiredShown = false;
};

export default http;
