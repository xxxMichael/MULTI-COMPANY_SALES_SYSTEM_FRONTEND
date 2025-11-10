import { useState, useEffect } from "react";
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  toggleActivoCategoria,
  verificarProductosCategoria,
} from "../../api/categorias";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Tag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
} from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ConfirmModal from "../ui/ConfirmModal";
import Portal from "../ui/Portal";
import { useNotifications } from "../../hooks/useNotifications";

export default function CategoriasSection() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const { notify } = useNotifications();

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    setLoading(true);
    try {
      const data = await obtenerCategorias();
      setCategorias(data);
    } catch (error) {
      notify.error("Error al cargar categorías");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminar = async (categoria) => {
    try {
      const info = await verificarProductosCategoria(categoria.idCategoria);
      if (info.tieneProductos) {
        notify.warning(
          `No se puede eliminar la categoría "${categoria.nombre}" porque tiene ${info.cantidadProductos} producto(s) asociado(s)`
        );
        return;
      }
      setCategoriaAEliminar(categoria);
    } catch (error) {
      notify.error("Error al verificar la categoría");
      console.error(error);
    }
  };

  const eliminar = async () => {
    if (!categoriaAEliminar) return;

    setEliminando(true);
    try {
      await eliminarCategoria(categoriaAEliminar.idCategoria);
      notify.success(`Categoría "${categoriaAEliminar.nombre}" eliminada correctamente`);
      setCategoriaAEliminar(null);
      cargarCategorias();
    } catch (error) {
      notify.error(
        error.response?.data?.message || "Error al eliminar categoría"
      );
      console.error(error);
    } finally {
      setEliminando(false);
    }
  };

  const toggleActivo = async (categoria) => {
    try {
      await toggleActivoCategoria(categoria.idCategoria);
      const nuevoEstado = !categoria.activo;
      notify.success(
        `Categoría "${categoria.nombre}" ${nuevoEstado ? "activada" : "desactivada"} correctamente`
      );
      cargarCategorias();
    } catch (error) {
      notify.error("Error al cambiar estado de la categoría");
      console.error(error);
    }
  };

  const abrirModal = (categoria = null) => {
    setEditingCategoria(categoria);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
  };

  const guardarCategoria = async (datos) => {
    try {
      if (editingCategoria) {
        await actualizarCategoria(editingCategoria.idCategoria, datos);
        notify.success(`Categoría "${datos.nombre}" actualizada correctamente`);
      } else {
        await crearCategoria(datos);
        notify.success(`Categoría "${datos.nombre}" creada correctamente`);
      }
      cerrarModal();
      cargarCategorias();
    } catch (error) {
      notify.error(
        error.response?.data?.message || "Error al guardar categoría"
      );
      throw error;
    }
  };

  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoriasActivas = categorias.filter((c) => c.activo).length;
  const categoriasInactivas = categorias.length - categoriasActivas;

  if (loading && categorias.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-slate-400">Cargando categorías...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-50 mb-2">
            Gestión de Categorías
          </h2>
          <p className="text-slate-400 text-sm">
            Administra las categorías de productos del sistema
          </p>
        </div>
        <Button
          onClick={() => abrirModal()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar categoría..."
          className="pl-10"
        />
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total de categorías"
          value={categorias.length}
          icon={Tag}
          color="blue"
        />
        <StatCard
          label="Activas"
          value={categoriasActivas}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Inactivas"
          value={categoriasInactivas}
          icon={XCircle}
          color="slate"
        />
      </div>

      {/* Lista de categorías */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-lg overflow-hidden">
        {categoriasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {searchTerm
              ? "No se encontraron categorías con ese término"
              : "No hay categorías configuradas"}
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
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {categoriasFiltradas.map((categoria, index) => (
                  <tr
                    key={categoria.idCategoria}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-slate-200">
                          {categoria.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">
                        {categoria.descripcion || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleActivo(categoria)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          categoria.activo
                            ? "bg-green-900/40 text-green-300 border border-green-700/40 hover:bg-green-900/60"
                            : "bg-slate-700/40 text-slate-400 border border-slate-600/40 hover:bg-slate-700/60"
                        }`}
                        title={`Click para ${categoria.activo ? "desactivar" : "activar"}`}
                      >
                        {categoria.activo ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Activa
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Inactiva
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirModal(categoria)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar categoría"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => confirmarEliminar(categoria)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
        <h3 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Información
        </h3>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• Las categorías inactivas no aparecerán al crear productos</li>
          <li>• No se pueden eliminar categorías con productos asociados</li>
          <li>• Las categorías se pueden desactivar temporalmente</li>
        </ul>
      </div>

      {/* Modal de formulario */}
      {showModal && (
        <CategoriaModal
          categoria={editingCategoria}
          onClose={cerrarModal}
          onGuardar={guardarCategoria}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        open={!!categoriaAEliminar}
        title="Eliminar categoría"
        description={`¿Estás seguro de que deseas eliminar la categoría "${categoriaAEliminar?.nombre}"?\n\nEsta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={eliminar}
        onCancel={() => setCategoriaAEliminar(null)}
        loading={eliminando}
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue: "from-blue-600 to-blue-700",
    green: "from-green-600 to-green-700",
    slate: "from-slate-600 to-slate-700",
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wide">
            {label}
          </p>
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

function CategoriaModal({ categoria, onClose, onGuardar }) {
  const [nombre, setNombre] = useState(categoria?.nombre || "");
  const [descripcion, setDescripcion] = useState(categoria?.descripcion || "");
  const [guardando, setGuardando] = useState(false);
  const [cantidadProductos, setCantidadProductos] = useState(0);
  const [loadingInfo, setLoadingInfo] = useState(false);

  useEffect(() => {
    if (categoria) {
      cargarInfoCategoria();
    }
  }, [categoria]);

  const cargarInfoCategoria = async () => {
    if (!categoria) return;
    setLoadingInfo(true);
    try {
      const info = await verificarProductosCategoria(categoria.idCategoria);
      setCantidadProductos(info.cantidadProductos);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      return;
    }

    setGuardando(true);
    try {
      await onGuardar({ nombre, descripcion });
    } catch (error) {
      // El error ya se maneja en el componente padre
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Modal panel - absolutamente centrado en la pantalla */}
        <div className="relative w-full max-w-lg z-[10000]">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Tag className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-50">
                {categoria ? "Editar Categoría" : "Nueva Categoría"}
              </h3>
            </div>

          {/* Información de productos */}
          {categoria && (
            <div className="mb-6 bg-blue-900/20 border border-blue-800/40 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-300">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {loadingInfo ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Verificando productos...
                    </span>
                  ) : (
                    `${cantidadProductos} producto(s) asociado(s)`
                  )}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Electrónica, Ropa, Hogar..."
                disabled={guardando}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción de la categoría..."
                disabled={guardando}
                rows={3}
                className="w-full px-4 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={guardando}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50"
              >
                Cancelar
              </button>
              <Button
                type="submit"
                disabled={guardando || !nombre.trim()}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {guardando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {categoria ? "Actualizar" : "Crear"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </Portal>
  );
}
