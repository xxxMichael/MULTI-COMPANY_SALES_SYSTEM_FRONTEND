import { useState, useEffect } from "react";
import {
  obtenerPalabrasProhibidas,
  agregarPalabraProhibida,
  eliminarPalabraProhibida,
} from "../../api/configuracion";
import {
  Plus,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ConfirmModal from "../ui/ConfirmModal";
import { useNotifications } from "../../hooks/useNotifications";

export default function PalabrasProhibidasSection() {
  const [palabras, setPalabras] = useState([]);
  const [nuevaPalabra, setNuevaPalabra] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [adding, setAdding] = useState(false);
  const [palabraAEliminar, setPalabraAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const { notify } = useNotifications();

  useEffect(() => {
    cargarPalabras();
  }, []);

  const cargarPalabras = async () => {
    setLoading(true);
    try {
      const data = await obtenerPalabrasProhibidas();
      setPalabras(data.palabras || []);
    } catch (error) {
      notify.error("Error al cargar palabras prohibidas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const agregarPalabra = async (e) => {
    e.preventDefault();

    if (!nuevaPalabra.trim()) {
      notify.warning("La palabra no puede estar vacía");
      return;
    }

    setAdding(true);
    try {
      const data = await agregarPalabraProhibida(nuevaPalabra);
      setPalabras(data.palabras);
      setNuevaPalabra("");
      notify.success(`Palabra "${nuevaPalabra.trim()}" agregada correctamente`);
    } catch (error) {
      notify.error(error.response?.data?.mensaje || "Error al agregar palabra");
      console.error(error);
    } finally {
      setAdding(false);
    }
  };

  const confirmarEliminar = (palabra) => {
    setPalabraAEliminar(palabra);
  };

  const eliminarPalabra = async () => {
    if (!palabraAEliminar) return;

    setEliminando(true);
    try {
      const data = await eliminarPalabraProhibida(palabraAEliminar);
      setPalabras(data.palabras);
      notify.success(`Palabra "${palabraAEliminar}" eliminada correctamente`);
      setPalabraAEliminar(null);
    } catch (error) {
      notify.error(
        error.response?.data?.mensaje || "Error al eliminar palabra"
      );
      console.error(error);
    } finally {
      setEliminando(false);
    }
  };

  const palabrasFiltradas = palabras.filter((palabra) =>
    palabra.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && palabras.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-slate-400">Cargando palabras prohibidas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-slate-50 mb-2">
          Filtro de Palabras Prohibidas
        </h2>
        <p className="text-slate-400 text-sm">
          Administra las palabras que serán filtradas en el sistema de moderación
        </p>
      </div>

      {/* Formulario para agregar */}
      <form onSubmit={agregarPalabra} className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="text"
              value={nuevaPalabra}
              onChange={(e) => setNuevaPalabra(e.target.value)}
              placeholder="Escribe una palabra prohibida..."
              disabled={adding}
            />
          </div>
          <Button
            type="submit"
            disabled={adding || !nuevaPalabra.trim()}
            className="flex items-center gap-2"
          >
            {adding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Agregando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Agregar
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar palabra..."
          className="pl-10"
        />
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total de palabras"
          value={palabras.length}
          icon={CheckCircle2}
          color="blue"
        />
        <StatCard
          label="Mostrando"
          value={palabrasFiltradas.length}
          icon={Search}
          color="violet"
        />
        <StatCard
          label="Filtradas"
          value={palabras.length - palabrasFiltradas.length}
          icon={AlertCircle}
          color="slate"
        />
      </div>

      {/* Lista de palabras */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-hidden">
        {palabrasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {searchTerm
              ? "No se encontraron palabras con ese término"
              : "No hay palabras prohibidas configuradas"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/60 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Palabra
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {palabrasFiltradas.map((palabra, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-200">
                        {palabra}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => confirmarEliminar(palabra)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-300 hover:text-red-200 bg-red-900/20 hover:bg-red-900/30 border border-red-800/40 rounded-lg transition-colors"
                        title="Eliminar palabra"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-300 mb-2">
          💡 Información
        </h3>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• Las palabras se guardan automáticamente en minúsculas</li>
          <li>• No se permiten duplicados</li>
          <li>• Los cambios se aplican inmediatamente al sistema de moderación</li>
        </ul>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        open={!!palabraAEliminar}
        title="Eliminar palabra prohibida"
        description={`¿Estás seguro de que deseas eliminar la palabra "${palabraAEliminar}"?\n\nEsta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={eliminarPalabra}
        onCancel={() => setPalabraAEliminar(null)}
        loading={eliminando}
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue: "from-blue-600 to-blue-700",
    violet: "from-violet-600 to-violet-700",
    slate: "from-slate-600 to-slate-700",
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-50 mt-1">{value}</p>
        </div>
        <div
          className={`p-3 rounded-lg bg-gradient-to-br ${colors[color]} shadow-lg`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
