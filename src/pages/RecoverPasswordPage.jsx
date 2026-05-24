import { useState } from "react";
import { Link } from "react-router-dom";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRecover = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL;
      const res = await fetch(
        `${API_BASE}/api/users/recover-password?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      if (res.ok) {
        setMsg("📩 Se ha enviado un correo con instrucciones para recuperar tu contraseña.");
      } else {
        const err = await res.json();
        setMsg(err.message || "No se pudo enviar el correo de recuperación.");
      }
    } catch {
      setMsg("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Card principal */}
      <div className="relative z-10 w-full max-w-md">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
          <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl p-8">
            
            <h1 className="text-2xl font-bold text-slate-50 mb-2 text-center">
              Recuperar contraseña
            </h1>
            <p className="text-sm text-slate-400 text-center mb-6">
              Ingresa tu correo electrónico para recibir el enlace de recuperación.
            </p>

            <form onSubmit={handleRecover} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@dominio.com"
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 px-3 py-2.5 text-slate-100 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-medium transition-all duration-300"
              >
                {loading ? "Enviando correo..." : "Enviar enlace de recuperación"}
              </button>
            </form>

            {/* Mensaje de respuesta */}
            {msg && (
              <div className="mt-4 text-sm text-center">
                <p
                  className={`${
                    msg.includes("📩")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {msg}
                </p>
              </div>
            )}

            {/* Enlaces inferiores */}
            <div className="mt-6 text-center text-sm text-slate-400">
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
