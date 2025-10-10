// src/pages/VerifyEmailPage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // correo desde state o localStorage
  const stateEmail = location.state?.email;
  const [correo, setCorreo] = useState(
    stateEmail || localStorage.getItem("pendingEmail") || ""
  );

  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Si viene desde el registro, guardarlo
  useEffect(() => {
    if (stateEmail) {
      localStorage.setItem("pendingEmail", stateEmail);
      setCorreo(stateEmail);
    }
  }, [stateEmail]);

  // Si no hay correo, volver a login
  useEffect(() => {
    if (!correo) {
      setMsg("No se encontró un correo pendiente de verificación.");
    }
  }, [correo]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!correo) {
      setMsg("No se encontró un correo para verificar.");
      return;
    }
    if (!code || code.trim().length < 4) {
      setMsg("Ingresa el código de verificación.");
      return;
    }

    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("http://localhost:8080/api/users/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, code }),
      });

      if (res.ok) {
        setMsg("Correo verificado correctamente ✅");
        // ya no necesitamos mantener el pendingEmail
        localStorage.removeItem("pendingEmail");
        setTimeout(() => navigate("/login", { replace: true }), 1200);
      } else {
        // puede que el backend responda 404/400 con {message}
        let errMsg = "Error en la verificación";
        try {
          const data = await res.json();
          errMsg = data?.message || errMsg;
        } catch (_) {
          // ignore parse error
        }
        setMsg(errMsg);
      }
    } catch {
      setMsg("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!correo) {
      setMsg("No se encontró un correo para reenviar el código.");
      return;
    }
    setResending(true);
    setMsg("");
    try {
      const res = await fetch("http://localhost:8080/api/users/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });
      if (res.ok) {
        setMsg("Nuevo código enviado a tu correo ✉️");
      } else {
        let errMsg = "No se pudo reenviar el código";
        try {
          const data = await res.json();
          errMsg = data?.message || errMsg;
        } catch (_) {}
        setMsg(errMsg);
      }
    } catch {
      setMsg("Error de conexión con el servidor");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur p-8 shadow-xl">
        <h1 className="text-2xl font-bold">Verificar tu correo</h1>
        <p className="mt-2 text-sm text-slate-400">
          Hemos enviado un código de verificación a:{" "}
          <span className="font-medium text-slate-200">{correo || "—"}</span>
        </p>

        {!correo && (
          <p className="mt-3 text-sm text-amber-300">
            Vuelve al{" "}
            <Link to="/register" className="underline">
              registro
            </Link>{" "}
            para crear una cuenta.
          </p>
        )}

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300">
              Código de verificación
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Ingresa tu código (6 dígitos)"
              className="mt-1 w-full rounded-lg bg-slate-800/60 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 px-3 py-2 text-slate-100 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !correo}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 font-medium transition"
          >
            {loading ? "Verificando..." : "Verificar"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !correo}
            className="text-blue-400 hover:text-blue-300 disabled:opacity-60"
          >
            {resending ? "Enviando..." : "Reenviar código"}
          </button>
          <Link to="/login" className="text-slate-400 hover:text-slate-300">
            Volver a iniciar sesión
          </Link>
        </div>

        {msg && (
          <p className="mt-4 text-sm text-center text-slate-200">{msg}</p>
        )}
      </div>
    </div>
  );
}
