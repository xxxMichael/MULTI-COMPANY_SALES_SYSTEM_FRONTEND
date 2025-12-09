// src/components/ui/SessionExpiredModal.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Clock } from "lucide-react";
import { clearAuth } from "../../state/auth";

export default function SessionExpiredModal() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          clearAuth(); // Limpiar sesión antes de redirigir
          navigate("/login", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleLoginNow = () => {
    clearAuth(); // Limpiar sesión explícitamente
    navigate("/login", { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-sm">
      <div className="relative max-w-md w-full mx-4">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-red-500/20 rounded-2xl blur-xl" />
        
        {/* Modal content */}
        <div className="relative bg-slate-900 border border-amber-500/30 rounded-2xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-amber-500 to-red-500 rounded-full flex items-center justify-center">
                <Clock className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-slate-50 mb-3">
            Sesión Expirada
          </h2>

          {/* Description */}
          <p className="text-center text-slate-400 mb-6">
            Tu sesión ha caducado por seguridad. Por favor, inicia sesión nuevamente para continuar.
          </p>

          {/* Countdown */}
          <div className="text-center mb-6">
            <p className="text-sm text-slate-500 mb-2">
              Redirigiendo al login en
            </p>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border border-slate-700">
              <span className="text-3xl font-bold text-amber-400">
                {countdown}
              </span>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleLoginNow}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white font-medium transition-all flex items-center justify-center gap-2 group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Iniciar Sesión Ahora
          </button>

          {/* Additional info */}
          <p className="text-xs text-center text-slate-600 mt-4">
            Las sesiones expiran después de 60 minutos de inactividad
          </p>
        </div>
      </div>
    </div>
  );
}
