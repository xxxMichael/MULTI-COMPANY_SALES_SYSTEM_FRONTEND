import { getAuth, clearAuth } from "../state/auth";
import { Button } from "../components/ui/Button";

export default function WelcomePage() {
  const auth = getAuth();
  const nombre = auth?.user?.nombre ?? "Usuario";

  const logout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
      <div className="max-w-2xl w-full p-8 bg-slate-800/60 rounded-2xl border border-slate-700">
        <h1 className="text-3xl font-bold">¡Bienvenido/a al Marketplace, {nombre}!</h1>
        <p className="mt-2 text-slate-300">
          Ya puedes explorar productos, vender y gestionar tus pedidos.
        </p>

        <div className="mt-6 flex gap-3">
          <a href="/" className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600">
            Ir al inicio
          </a>
          <Button onClick={logout}>Cerrar sesión</Button>
        </div>
      </div>
    </div>
  );
}
