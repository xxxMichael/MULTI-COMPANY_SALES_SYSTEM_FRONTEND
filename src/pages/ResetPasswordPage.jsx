import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Leer query params ?email=...&code=...
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [email, setEmail] = useState(query.get("email") || "");
  const [recoveryCode, setRecoveryCode] = useState(query.get("code") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    // Limpia mensajes al cambiar inputs
    setMsg("");
    setOk(false);
  }, [email, recoveryCode, newPassword, confirm]);

  const validate = () => {
    if (!email || !recoveryCode || !newPassword || !confirm) {
      setMsg("Todos los campos son obligatorios");
      return false;
    }
    if (newPassword.length < 8) {
      setMsg("La contraseña debe tener al menos 8 caracteres");
      return false;
    }
    if (newPassword !== confirm) {
      setMsg("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("http://localhost:8080/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          recoveryCode,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setOk(true);
        setMsg(data?.message || "Contraseña cambiada correctamente");
        // Redirigir al login tras 1.5 s
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      } else {
        setOk(false);
        setMsg(data?.message || "No se pudo cambiar la contraseña");
      }
    } catch (err) {
      setOk(false);
      setMsg("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl p-6">
          <h1 className="text-2xl font-bold">Cambiar contraseña</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Ingresa tu correo, el código de recuperación y tu nueva contraseña.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm mb-1">Correo electrónico</label>
              <input
                type="email"
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/30"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@dominio.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Código de recuperación</label>
              <input
                type="text"
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/30"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                placeholder="Ej. 123456 / ABCD-1234"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Nueva contraseña</label>
              <input
                type="password"
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/30"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Confirmar contraseña</label>
              <input
                type="password"
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/30"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
                required
              />
            </div>

            {msg && (
              <div
                className={`text-sm rounded-lg px-3 py-2 border ${
                  ok
                    ? "bg-emerald-900/20 border-emerald-700 text-emerald-300"
                    : "bg-red-900/20 border-red-800 text-red-300"
                }`}
              >
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 transition px-4 py-2 font-medium"
            >
              {loading ? "Guardando..." : "Cambiar contraseña"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-slate-400 hover:text-slate-200">
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
