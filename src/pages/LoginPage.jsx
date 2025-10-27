import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { login } from "../api/auth";
import { setAuth } from "../state/auth";
import logo from "../assets/marketplace-logo.png";

export default function LoginPage() {
  const [form, setForm] = useState({ correo: "", contrasena: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const navigate = useNavigate();

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    console.log("Intentando login con:", form);

    try {
      const res = await login(form);
      console.log("Respuesta del login:", res);

      // Verificar estado del usuario
      if (res.estado === 'SUSPENDIDO') {
        console.log("Usuario suspendido");
        setUserStatus({ estado: 'SUSPENDIDO', message: 'Tu cuenta está suspendida. Contacta al administrador o moderadores para más información.' });
        setShowStatusModal(true);
        return;
      }

      if (res.estado === 'ELIMINADO') {
        console.log("Usuario eliminado");
        setUserStatus({ estado: 'ELIMINADO', message: 'Tu cuenta ha sido eliminada. No puedes acceder al sistema.' });
        setShowStatusModal(true);
        return;
      }

      // Si el estado es ACTIVO, el login ya guardó el auth
      if (res.estado === 'ACTIVO') {
        console.log("Usuario activo, navegando al marketplace");
        navigate("/marketplace", { replace: true });
      } else if (!res.estado) {
        console.log("Estado no definido, asumiendo ACTIVO");
        navigate("/marketplace", { replace: true });
      } else {
        console.log("Estado desconocido:", res.estado);
        setMsg("Estado de cuenta desconocido");
      }
    } catch (err) {
      console.error("Error en login:", err);
      const message =
        err?.response?.data?.message || err.message || "No se pudo iniciar sesión";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center p-4 lg:p-8">
      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Lado izquierdo - Logo y branding */}
          <div className="hidden lg:flex flex-col items-center justify-center p-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-3xl blur-3xl group-hover:blur-[64px] transition-all duration-500" />
              <div className="relative">
                <div className="w-80 h-80 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 ring-1 ring-slate-700/50 flex items-center justify-center shadow-2xl">
                  <img src={logo} alt="Marketplace" className="w-56 h-56 object-contain" />
                </div>
              </div>
            </div>
            
            <h1 className="mt-10 text-5xl font-bold tracking-tight text-slate-50 text-center leading-tight">
              Multi-Company
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Marketplace
              </span>
            </h1>
          </div>

          {/* Lado derecho - Formulario de login */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Logo mobile */}
            <div className="flex lg:hidden flex-col items-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl blur-xl transition-all duration-300" />
                <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 ring-1 ring-slate-700/50 flex items-center justify-center shadow-2xl">
                  <img src={logo} alt="Marketplace" className="h-14 w-14 object-contain" />
                </div>
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-50">
                Multi-Company Marketplace
              </h1>
            </div>

            {/* Card del login */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
              
              <div className="relative rounded-2xl border border-slate-800/50 bg-slate-900/90 backdrop-blur-xl shadow-2xl p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-50">Iniciar sesión</h2>
                  <p className="mt-3 text-base text-slate-400">
                    Ingresa tus credenciales para acceder
                  </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                  <div>
                    <Input
                      label="Correo electrónico"
                      name="correo"
                      type="email"
                      value={form.correo}
                      onChange={onChange}
                      placeholder="correo@dominio.com"
                      required
                      autoComplete="email"
                      className="text-base"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-base font-medium text-slate-300">
                        Contraseña
                      </label>
                      <Link
                        to="/recover-password"
                        className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        name="contrasena"
                        type={showPassword ? "text" : "password"}
                        value={form.contrasena}
                        onChange={onChange}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        className="text-base pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {msg && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500/10 rounded-lg blur" />
                      <div className="relative flex items-start gap-3 text-sm text-red-300 bg-red-950/30 border border-red-800/40 rounded-lg px-4 py-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{msg}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    loading={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 border-0"
                  >
                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                </form>

                {/* Separador */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-slate-900/90 px-3 text-slate-500">
                      ¿Nuevo en el marketplace?
                    </span>
                  </div>
                </div>

                {/* Registro */}
                <div className="text-center">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-all duration-200"
                  >
                    Crear una cuenta nueva
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} Multi-Company Marketplace
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      {showStatusModal && userStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                userStatus.estado === 'SUSPENDIDO'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-slate-50">
                {userStatus.estado === 'SUSPENDIDO' ? 'Cuenta Suspendida' : 'Cuenta Eliminada'}
              </h2>

              <p className="text-slate-300 mb-6">
                {userStatus.message}
              </p>

              <Button
                onClick={() => {
                  setShowStatusModal(false);
                  setUserStatus(null);
                }}
                className="w-full bg-slate-700 hover:bg-slate-600"
              >
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
