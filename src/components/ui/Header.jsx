// Componente de header reutilizable
import { useNavigate } from "react-router-dom";
import { getAuth, clearAuth } from "../../state/auth";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-sm bg-slate-900/60 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/marketplace")}>
            <div className="bg-gradient-to-br from-blue-600 to-violet-600 p-2 rounded-lg shadow-lg shadow-blue-500/25">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-50">Marketplace</h1>
          </div>

          {/* Navegación */}
          <nav className="hidden md:flex items-center gap-6">
                 {/* Navegación 
     <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/marketplace");
              }}
              className="text-slate-300 hover:text-slate-50 font-medium transition-colors"
            >
              Inicio
            </a>
            */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/marketplace");
              }}
              className="text-slate-300 hover:text-slate-50 font-medium transition-colors"
            >
              Productos
            </a>
            {auth?.user && (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/my-products");
                }}
                className="text-slate-300 hover:text-slate-50 font-medium transition-colors"
              >
                Mis Productos
              </a>
            )}
            <a
              href="#"
              className="text-slate-300 hover:text-slate-50 font-medium transition-colors"
            >
              Contacto
            </a>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            {/* Carrito
            <button
              className="p-2 text-slate-300 hover:text-slate-50 relative transition-colors"
              title="Carrito de compras"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </button>
 */}
            {/* Usuario */}
            <div className="relative flex items-center gap-2" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu((s) => !s)}
                className="p-2 text-slate-300 hover:text-slate-50 transition-colors"
                title="Perfil de usuario"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>

              {/* User menu dropdown */}
              {showUserMenu && auth?.user && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-lg text-sm z-50">
                  {/* User name (distinct style) */}
                  <div className="px-4 py-3 border-b border-slate-700">
                    <div className="text-slate-50 font-semibold text-base truncate">{auth.user.nombre || auth.user.username || auth.user.email || "Usuario"}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col p-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/my-products');
                      }}
                      className="text-left px-4 py-2 rounded hover:bg-slate-700 text-slate-200"
                    >
                      Mis productos
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/welcome');
                      }}
                      className="text-left px-4 py-2 rounded hover:bg-slate-700 text-slate-200"
                    >
                      Perfil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-left px-4 py-2 rounded hover:bg-red-700 text-red-400 mt-1"
                    >
                      Cerrar sesion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
