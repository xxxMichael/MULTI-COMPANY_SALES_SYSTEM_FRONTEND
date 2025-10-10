import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { registerUser } from "../api/auth";
import logo from "../assets/marketplace-logo.png";

export default function RegisterPage() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    correo: "",
    contrasena: "",
    telefono: "",
    direccion: "",
    genero: "",
    rol: "COMPRADOR",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const navigate = useNavigate();

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await registerUser(form);
      const pendingEmail = form.correo;
      navigate("/verify-email", { state: { email: form.correo } });
      return;
    } catch (err) {
      const message =
        err?.response?.data?.message || "No se pudo registrar el usuario";
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

      <div className="w-full max-w-7xl relative z-10">
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

          {/* Lado derecho - Formulario de registro */}
          <div className="w-full max-w-2xl mx-auto lg:mx-0">
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

            {/* Card del registro */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
              
              <div className="relative rounded-2xl border border-slate-800/50 bg-slate-900/90 backdrop-blur-xl shadow-2xl p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-slate-50">Crear cuenta</h2>
                  <p className="mt-2 text-base text-slate-400">
                    Únete y empieza a vender o comprar
                  </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nombre"
                      name="nombre"
                      value={form.nombre}
                      onChange={onChange}
                      placeholder="Nombre"
                      required
                    />
                    <Input
                      label="Apellido"
                      name="apellido"
                      value={form.apellido}
                      onChange={onChange}
                      placeholder="Apellido"
                      required
                    />
                    <Input
                      label="Cédula"
                      name="cedula"
                      value={form.cedula}
                      onChange={onChange}
                      placeholder="Ingrese su cédula"
                      required
                    />
                    <Input
                      label="Correo electrónico"
                      name="correo"
                      type="email"
                      value={form.correo}
                      onChange={onChange}
                      placeholder="correo@dominio.com"
                      required
                      autoComplete="email"
                    />
                    <Input
                      label="Contraseña"
                      name="contrasena"
                      type="password"
                      value={form.contrasena}
                      onChange={onChange}
                      placeholder="Mín. 8 caracteres"
                      required
                      autoComplete="new-password"
                    />
                    <Input
                      label="Teléfono"
                      name="telefono"
                      value={form.telefono}
                      onChange={onChange}
                      placeholder="999999999"
                    />
                    <Input
                      label="Dirección"
                      name="direccion"
                      value={form.direccion}
                      onChange={onChange}
                      placeholder="Ambato"
                    />
                    <Input
                      label="Género"
                      name="genero"
                      value={form.genero}
                      onChange={onChange}
                      placeholder="F / M"
                    />
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

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      disabled={loading}
                      loading={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 border-0"
                    >
                      {loading ? "Creando cuenta..." : "Crear cuenta"}
                    </Button>
                    <Link
                      to="/login"
                      className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-all duration-200"
                    >
                      Ya tengo cuenta
                    </Link>
                  </div>
                </form>
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
    </div>
  );
}