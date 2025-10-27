import http from "./http";
import { setAuth, getAuth } from "../state/auth";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

/**
 * ============================
 *  AUTENTICACIÓN DE USUARIOS
 * ============================
 */

// 🔹 Registro general de usuarios
export const registerUser = async (payload) => {
  const { data } = await http.post("/api/users/register", payload);
  return data; // { id, correo, rol, message }
};

// 🔹 Login de usuario con almacenamiento local del token
export const login = async (payload) => {
  // Usar axios directamente para evitar el interceptor que requiere token
  const API_BASE =
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080";

  try {
    const response = await fetch(`${API_BASE}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error en login");
    }

    // Verifica que el backend devuelva token y usuario
    if (data?.token && data?.estado === 'ACTIVO') {
      setAuth({
        token: data.token,
        user: {
          id: data.id,
          correo: data.correo,
          nombre: data.nombre,
          apellido: data.apellido,
          cedula: data.cedula, // importante para perfil
          rol: data.rol,
          emailVerificado: data.emailVerificado,
          estado: data.estado,
        },
      });
    }

    return data;
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
};

// 🔹 Verificación de correo (código enviado por email)
export const verifyEmail = (payload) =>
  http.post("/api/users/verify-email", payload);

// 🔹 Reenvío de código de verificación
export const resendCode = (payload) =>
  http.post("/api/users/resend-code", payload);

// 🔹 Comprobar disponibilidad de correo
export const checkEmail = (email) =>
  http.get("/api/users/check-email", { params: { email } });

// 🔹 Crear moderador (solo ADMIN)
export const createModerator = (payload) =>
  http.post("/api/users/admin/moderators", payload);

// 🔹 Obtener lista de usuarios con filtros y paginación (ADMIN)
export const getUsers = (params = {}) => http.get("/api/users", { params });

// 🔹 Eliminar usuario (ADMIN)
export const deleteUser = (cedula) => http.delete(`/api/users/${cedula}`);

// 🔹 Actualizar usuario (ADMIN)
export const updateUser = (cedula, payload) =>
  http.put(`/api/users/${cedula}`, payload);

// 🔹 Cambiar rol de usuario (ADMIN)
export const changeUserRole = (cedula, rol) =>
  http.put(`/api/users/${cedula}/role`, { rol });

/**
 * ============================
 *  PERFIL DEL USUARIO LOGUEADO
 * ============================
 */

export const getMyProfile = async () => {
  const { data } = await http.get("/api/users/profile");
  return data;
};

export const updateMyProfile = async (payload) => {
  const { data } = await http.put('/api/users/profile', payload);

  const auth = getAuth();
  setAuth({
    token: auth.token,
    user: {
      ...auth.user,
      ...data, // assuming backend returns updated user data
    },
  });

  return data;
};

/**
 * ============================
 *  RESET DE CONTRASEÑA
 * ============================
 */
export const resetPassword = (payload) =>
  fetch(`${API_BASE}/api/users/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(async (r) => {
    const data = await r.json().catch(() => null);
    if (!r.ok) {
      const err = new Error(data?.message || "Error");
      err.response = { status: r.status, data };
      throw err;
    }
    return data;
  });
