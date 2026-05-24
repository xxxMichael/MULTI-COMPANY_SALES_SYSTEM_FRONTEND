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
    rol: "USUARIO",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Validation functions
  const validateCedula = (cedula) => {
    if (!/^\d{10}$/.test(cedula)) return "La cédula debe tener exactamente 10 dígitos.";
    const province = parseInt(cedula.substring(0, 2));
    if (province < 1 || province > 24) return "Los primeros dos dígitos deben ser un código de provincia válido (01-24).";
    const digits = cedula.split('').map(Number);
    const multipliers = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let product = digits[i] * multipliers[i];
      if (product >= 10) product -= 9;
      sum += product;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    if (checkDigit !== digits[9]) return "La cédula no es válida.";
    return "";
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[A-Z]/.test(password)) return "La contraseña debe contener al menos una letra mayúscula.";
    if (!/[a-z]/.test(password)) return "La contraseña debe contener al menos una letra minúscula.";
    if (!/\d/.test(password)) return "La contraseña debe contener al menos un número.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return "La contraseña debe contener al menos un carácter especial.";
    return "";
  };

  const validatePhone = (phone) => {
    if (!/^\d{10}$/.test(phone)) return "El teléfono debe tener exactamente 10 dígitos.";
    return "";
  };

  const validateGender = (gender) => {
    if (!["F", "M"].includes(gender.toUpperCase())) return "El género debe ser F o M.";
    return "";
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((err) => ({ ...err, [name]: "" }));
    }
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    let error = "";
    switch (name) {
      case "cedula":
        error = validateCedula(value);
        break;
      case "contrasena":
        error = validatePassword(value);
        break;
      case "telefono":
        error = validatePhone(value);
        break;
      case "genero":
        error = validateGender(value);
        break;
      default:
        break;
    }
    setErrors((err) => ({ ...err, [name]: error }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    // Validate all fields
    const newErrors = {};
    let hasErrors = false;

    const validations = {
      cedula: validateCedula,
      contrasena: validatePassword,
      telefono: validatePhone,
      genero: validateGender,
    };

    Object.keys(validations).forEach(key => {
      const error = validations[key](form[key]);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

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
                      onBlur={onBlur}
                      placeholder="Ingrese su cédula"
                      required
                      maxLength="10"
                      error={errors.cedula}
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
                      type={showPassword ? "text" : "password"}
                      value={form.contrasena}
                      onChange={onChange}
                      onBlur={onBlur}
                      placeholder="Mín. 8 caracteres"
                      required
                      autoComplete="new-password"
                      error={errors.contrasena}
                      showPasswordToggle={true}
                      onToggleShowPassword={() => setShowPassword(!showPassword)}
                    />
                    <Input
                      label="Teléfono"
                      name="telefono"
                      type="tel"
                      value={form.telefono}
                      onChange={onChange}
                      onBlur={onBlur}
                      placeholder="9999999999"
                      required
                      maxLength="10"
                      error={errors.telefono}
                    />
                    <Input
                      label="Dirección"
                      name="direccion"
                      value={form.direccion}
                      onChange={onChange}
                      placeholder="Ambato"
                    />
                    <div className="flex flex-col gap-1">
                      <label htmlFor="genero" className="text-sm font-medium text-slate-200">
                        Género
                      </label>
                      <select
                        id="genero"
                        name="genero"
                        value={form.genero}
                        onChange={onChange}
                        onBlur={onBlur}
                        required
                        className={`w-full rounded-lg bg-slate-800/60 border px-3 py-2 text-slate-100 placeholder:text-slate-400 outline-none ${
                          errors.genero ? "border-red-500 focus:border-red-500 focus:ring-red-500/30" : "border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                        }`}
                      >
                        <option value="">Seleccione</option>
                        <option value="F">Femenino</option>
                        <option value="M">Masculino</option>
                      </select>
                      {errors.genero && <span className="text-sm text-red-400">{errors.genero}</span>}
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