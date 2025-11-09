// src/components/ui/Header.jsx
import { useNavigate } from "react-router-dom";
import { getAuth, clearAuth } from "../../state/auth";
import { useState, useRef, useEffect } from "react";
import { useChatNotifications } from "../../hooks/useChatNotifications";
import {
  UserRound,
  Mail,
  Crown,
  Heart,
  Package,
  ShoppingCart,
  Settings,
  Shield,
  LogOut,
  UserCog,
  ChevronDown,
  MessageSquare,
} from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const auth = getAuth();
  const { unreadCount } = useChatNotifications();

  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const isLogged = !!auth?.user;
  const role = auth?.user?.rol || "USER";
  const fullName =
    [auth?.user?.nombre, auth?.user?.apellido].filter(Boolean).join(" ") ||
    auth?.user?.username ||
    auth?.user?.correo ||
    "Usuario";
  const email = auth?.user?.correo || "";
  const initial = (auth?.user?.nombre?.[0] || auth?.user?.correo?.[0] || "U").toUpperCase();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  // Cerrar al hacer click afuera
  useEffect(() => {
    function onClickOutside(e) {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // Cerrar con ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const goto = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-sm bg-slate-900/60 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate("/marketplace")}
            className="flex items-center gap-3"
            aria-label="Ir al Marketplace"
          >
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
          </button>

          {/* Navegación */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate("/marketplace")}
              className="text-slate-300 hover:text-slate-50 font-medium transition-colors"
            >
              Productos
            </button>

            {isLogged && (
              <button
                onClick={() => navigate("/my-products")}
                className="text-slate-300 hover:text-slate-50 font-medium transition-colors"
              >
                Mis Productos
              </button>
            )}

            {/* Chat con contador */}
            {isLogged && (
              <button
                onClick={() => navigate("/chat")}
                className="relative text-slate-300 hover:text-slate-50 font-medium transition-colors"
              >
                Chat
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[20px] h-[20px]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            {(role === "ADMIN" || role === "MODERATOR") && (
              <>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="text-slate-300 hover:text-slate-50 font-medium transition-colors"
                >
                  Gestión Usuarios
                </button>
                <button
                  onClick={() => navigate("/admin/incidents")}
                  className="text-slate-300 hover:text-slate-50 font-medium transition-colors"
                >
                  Incidencias
                </button>
                <button
                  onClick={() => navigate("/admin/appeals")}
                  className="text-slate-300 hover:text-slate-50 font-medium transition-colors"
                >
                  Apelaciones
                </button>
              </>
            )}

            <button
              onClick={() => navigate("/contact")}
              className="text-slate-300 hover:text-slate-50 font-medium transition-colors"
            >
              Contacto
            </button>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            {!isLogged ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                >
                  Crear cuenta
                </button>
              </div>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  ref={triggerRef}
                  onClick={() => setOpen((s) => !s)}
                  className="group flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-800/60 px-2 py-1.5 hover:bg-slate-700/60"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  aria-label="Abrir menú de usuario"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center font-semibold">
                    {initial}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-slate-100 text-sm leading-tight font-medium max-w-[140px] truncate">
                      {fullName}
                    </span>
                    <span className="text-slate-400 text-xs leading-tight max-w-[160px] truncate flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {email}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-200" />
                </button>

                {open && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-72 bg-slate-900/95 border border-slate-700 rounded-xl shadow-xl backdrop-blur-sm"
                  >
                    <div className="p-4 border-b border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center font-semibold">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-slate-50 font-semibold truncate">{fullName}</p>
                            {role === "ADMIN" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                                <Crown className="h-3 w-3" />
                                ADMIN
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-xs truncate">{email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <MenuItem
                        icon={<UserCog className="h-4 w-4" />}
                        label="Editar perfil"
                        onClick={() => goto("/edit-profile")}
                      />
                      <MenuItem
                        icon={<Package className="h-4 w-4" />}
                        label="Mis productos"
                        onClick={() => goto("/my-products")}
                      />
                      <MenuItem
                        icon={<MessageSquare className="h-4 w-4" />}
                        label={`Chat ${unreadCount > 0 ? `(${unreadCount})` : ""}`}
                        onClick={() => goto("/chat")}
                      />
                    </div>

                    {(role === "ADMIN" || role === "MODERATOR") && (
                      <div className="px-2 pb-2">
                        <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-slate-500 mt-2">
                          Administración
                        </div>
                        <MenuItem
                          icon={<Shield className="h-4 w-4" />}
                          label="Usuarios"
                          onClick={() => goto("/admin/users")}
                        />
                        <MenuItem
                          icon={<Shield className="h-4 w-4" />}
                          label="Incidencias"
                          onClick={() => goto("/admin/incidents")}
                        />
                        <MenuItem
                          icon={<Shield className="h-4 w-4" />}
                          label="Apelaciones"
                          onClick={() => goto("/admin/appeals")}
                        />
                      </div>
                    )}

                    <div className="p-2 border-t border-slate-700">
                      <button
                        onClick={handleLogout}
                        className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-white hover:bg-red-600/20 transition"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- Item del menú (reutilizable) ---------- */
function MenuItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 transition"
      role="menuitem"
    >
      <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}
