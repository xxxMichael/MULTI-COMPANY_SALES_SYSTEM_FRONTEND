import http from "./http";
import { setAuth } from "../state/auth";

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
  const { data } = await http.post("/api/users/login", payload);

  // Verifica que el backend devuelva token y usuario
  if (data?.token) {
    setAuth({
      token: data.token,
      user: {
        id: data.id,
        correo: data.correo,
        nombre: data.nombre,
        apellido: data.apellido,
        rol: data.rol,
        emailVerificado: data.emailVerificado,
      },
    });
  }

  return data; // { token, id, correo, nombre, apellido, rol, emailVerificado }
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

export const resetPassword = (payload) =>
  fetch("http://localhost:8080/api/users/reset-password", {
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

