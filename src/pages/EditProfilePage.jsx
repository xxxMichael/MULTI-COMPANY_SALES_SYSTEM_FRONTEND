// src/pages/EditProfilePage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "../state/auth";
import { getMyProfile, updateMyProfile } from "../api/auth";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const hasFetched = useRef(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    correo: "",
    telefono: "",
    direccion: "",
    genero: "M", // default to M for Masculino
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    if (!auth?.user || !auth?.token) {
      navigate("/login");
      return;
    }

    if (hasFetched.current) return; // Prevent multiple fetches

    hasFetched.current = true;

    const fetchUserData = async () => {
      try {
        const userData = await getMyProfile(); // usa axios + interceptor (Authorization)
        setFormData({
          nombre: userData?.nombre ?? "",
          apellido: userData?.apellido ?? "",
          cedula: userData?.cedula ?? auth.user?.cedula ?? "",
          correo: userData?.correo ?? auth.user?.correo ?? "",
          telefono: userData?.telefono ?? "",
          direccion: userData?.direccion ?? "",
          genero: userData?.genero ?? "",
        });
        setError("");
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401) {
          setError("Sesión expirada. Inicia sesión nuevamente.");
          navigate("/login");
        } else if (status === 403) {
          setError("No tienes permisos para ver tu perfil.");
        } else {
          setError("Error al cargar los datos del perfil");
        }
        console.error("getMyProfile error:", e);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchUserData();
  }, [auth, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await updateMyProfile(formData); // sincroniza setAuth internamente
      setSuccessModal(true);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        setError("Sesión expirada. Inicia sesión nuevamente.");
        navigate("/login");
      } else if (status === 403) {
        setError("No tienes permisos para actualizar este perfil.");
      } else {
        const msg = e?.response?.data?.message || e.message || "Error al actualizar perfil";
        setError(msg);
      }
      console.error("updateMyProfile error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!auth?.user || !auth?.token) return null;

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando datos del perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-2xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-violet-600 p-4 rounded-2xl shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
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
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Editar Perfil
              </h1>
              <p className="text-slate-400 mt-1">Actualiza tu información personal</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-200 border-b border-slate-700 pb-2">
                  Información Personal
                </h3>

                <div className="space-y-4">
                  <Input
                    label="Nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="bg-slate-700/50 border-slate-600 focus:border-blue-500"
                  />
                  <Input
                    label="Apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    className="bg-slate-700/50 border-slate-600 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Cédula</label>
                    <div className="px-3 py-2 bg-slate-700/30 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed">
                      {formData.cedula}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Correo electrónico</label>
                    <div className="px-3 py-2 bg-slate-700/30 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed">
                      {formData.correo}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-200 border-b border-slate-700 pb-2">
                  Información de Contacto
                </h3>

                <div className="space-y-4">
                  <Input
                    label="Teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="bg-slate-700/50 border-slate-600 focus:border-blue-500"
                  />
                  <Input
                    label="Dirección"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="bg-slate-700/50 border-slate-600 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Género</label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-6 pt-8 border-t border-slate-700">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/marketplace")}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 border-slate-600"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </div>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-100 mb-2">
                  ¡Perfil actualizado!
                </h3>
                <p className="text-sm text-slate-400 mb-6">
                  Tu información personal ha sido guardada correctamente.
                </p>
                <Button
                  onClick={() => {
                    setSuccessModal(false);
                    navigate("/marketplace");
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                >
                  Ir al Marketplace
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
