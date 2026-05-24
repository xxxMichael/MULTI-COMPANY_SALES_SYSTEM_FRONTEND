import { useState, useEffect, useMemo } from "react";
import { getUsers, deleteUser, updateUser } from "../api/auth";
import { getAuth } from "../state/auth";
import Header from "../components/ui/Header";
import Pagination from "../components/ui/Pagination";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  PencilLine,
  Trash2,
  Mail,
  IdCard,
  User2,
  Shield,
  Loader2,
  RefreshCw,
  Ban,
} from "lucide-react";

/* ---------- Pequeños componentes de UI ---------- */
function IconButton({ title, onClick, className = "", children, ariaLabel }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel || title}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-lg px-2 py-2
                  border border-slate-700/60 bg-slate-800/60 text-slate-200
                  hover:bg-slate-700/60 hover:text-white transition
                  focus:outline-none focus:ring-2 focus:ring-blue-500/40
                  disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({ tone = "green", children }) {
  const tones = {
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    green: "bg-green-100 text-green-800",
    slate: "bg-slate-200 text-slate-800",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/* ---------- Página principal ---------- */
export default function AdminUsersPage() {
  // Dataset completo (cliente)
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Paginación local
  const [currentPage, setCurrentPage] = useState(0); // 0-based
  const [pageSize] = useState(6);

  // Modales
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [suspendingUser, setSuspendingUser] = useState(null);
  const [reactivatingUser, setReactivatingUser] = useState(null);

  // Mensajes
  const [msg, setMsg] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Filtros
  const [filters, setFilters] = useState({
    nombre: "",
    correo: "",
    rol: "",
  });

  // Vista: 'active', 'suspended' o 'deleted'
  const [view, setView] = useState('active');

  // Form edición
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    direccion: "",
    genero: "",
    rol: "",
    cedula: "",
  });

  // Auth
  const auth = getAuth();
  const isAdmin = auth?.user?.rol === "ADMIN";
  const isModerator = auth?.user?.rol === "MODERATOR";

  // Helpers
  const norm = (v) => (v ?? "").toString().trim().toLowerCase();

  const matchUser = (u, f) => {
    const n = norm(f.nombre);
    const c = norm(f.correo);
    const r = norm(f.rol);

    const uNombre = norm(u?.nombre);
    const uApellido = norm(u?.apellido);
    const uCorreo = norm(u?.correo);
    const uRol = norm(u?.rol);

    const byNombre =
      !n ||
      uNombre.includes(n) ||
      uApellido.includes(n) ||
      `${uNombre} ${uApellido}`.includes(n);

    const byCorreo = !c || uCorreo.includes(c);
    const byRol = !r || uRol === r;

    return byNombre && byCorreo && byRol;
  };

  // Cargar TODA la data (y luego filtrar/paginar en cliente)
  const fetchAllUsers = async () => {
    setLoading(true);
    setMsg("");
    try {
      let page = 1;
      const size = 200;
      let totalPages = 1;
      const acc = [];

      // Cargar usuarios activos
      const resActive = await getUsers({ page, size });
      const dataActive = resActive?.data;

      if (Array.isArray(dataActive)) {
        acc.push(...dataActive);
        totalPages = 1;
      } else {
        const firstUsers = dataActive?.users || [];
        totalPages = dataActive?.totalPages ?? 1;
        acc.push(...firstUsers);

        for (page = 2; page <= totalPages; page++) {
          const { data: d } = await getUsers({ page, size });
          const list = d?.users || (Array.isArray(d) ? d : []);
          if (!list.length) break;
          acc.push(...list);
        }
      }

      // Cargar usuarios eliminados solo si es admin
      if (isAdmin) {
        try {
          const resDeleted = await getUsers({ page: 1, size: 200, includeDeleted: true });
          const dataDeleted = resDeleted?.data;
          if (Array.isArray(dataDeleted)) {
            // Filtrar solo los eliminados ya que includeDeleted trae todos
            const onlyDeleted = dataDeleted.filter(u => u.estado === 'ELIMINADO');
            acc.push(...onlyDeleted);
          } else {
            const deletedUsers = (dataDeleted?.users || []).filter(u => u.estado === 'ELIMINADO');
            acc.push(...deletedUsers);
          }
        } catch (err) {
          console.warn("No se pudieron cargar usuarios eliminados:", err);
        }
      }

      // Unificar por cédula (si la API puede repetir)
      const unique = new Map();
      acc.forEach((u) => {
        if (u?.cedula) unique.set(u.cedula, u);
      });

      setAllUsers([...unique.values()]);
      setCurrentPage(0);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setMsg("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    if (isAdmin || isModerator) fetchAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, isModerator]);

  // Filtrado + Paginación (cliente)
  const filteredUsers = useMemo(
    () => allUsers.filter((u) => {
      // Primero filtrar por vista: active (ACTIVO), suspended (SUSPENDIDO), deleted (ELIMINADO)
      let matchesView = false;
      if (view === 'active') matchesView = u.estado === 'ACTIVO';
      else if (view === 'suspended') matchesView = u.estado === 'SUSPENDIDO';
      else if (view === 'deleted') {
        // Solo admins pueden ver eliminados
        matchesView = isAdmin && u.estado === 'ELIMINADO';
      }
      return matchesView && matchUser(u, filters);
    }),
    [allUsers, filters, view, isAdmin]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredUsers.length / pageSize)),
    [filteredUsers.length, pageSize]
  );

  const pageSlice = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage, pageSize]);

  // Reset página al cambiar filtros o vista
  useEffect(() => {
    setCurrentPage(0);
  }, [filters, view]);

  /* ---------- Acciones ---------- */
  const handleDelete = (user) => {
    setDeletingUser(user);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;
    try {
      await updateUser(deletingUser.cedula, { ...deletingUser, estado: 'ELIMINADO' });
      setMsg("Usuario eliminado exitosamente");
      setDeletingUser(null);
      // Marcar como eliminado en lugar de remover
      setAllUsers((prev) =>
        prev.map((u) =>
          u.cedula === deletingUser.cedula ? { ...u, estado: 'ELIMINADO' } : u
        )
      );
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
      setMsg("Error al eliminar usuario");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      nombre: user.nombre || "",
      apellido: user.apellido || "",
      cedula: user.cedula || "",
      correo: user.correo || "",
      telefono: user.telefono || "",
      direccion: user.direccion || "",
      genero: user.genero || "",
      rol: user.rol || "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editingUser.cedula, editForm);
      setSuccessMessage("Usuario actualizado exitosamente");
      setSuccessModal(true);
      setEditingUser(null);
      setAllUsers((prev) =>
        prev.map((u) => (u.cedula === editForm.cedula ? { ...u, ...editForm } : u))
      );
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      setMsg("Error al actualizar usuario");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page); // 0-based
  };

  const handleSuspend = (user) => {
    setSuspendingUser(user);
  };

  const confirmSuspend = async () => {
    if (!suspendingUser) return;
    try {
      await updateUser(suspendingUser.cedula, { ...suspendingUser, estado: 'SUSPENDIDO' });
      setMsg("Usuario suspendido exitosamente");
      setSuspendingUser(null);
      setAllUsers((prev) =>
        prev.map((u) =>
          u.cedula === suspendingUser.cedula ? { ...u, estado: 'SUSPENDIDO' } : u
        )
      );
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error("Error suspendiendo usuario:", err);
      setMsg("Error al suspender usuario");
    }
  };

  const handleReactivate = (user) => {
    setReactivatingUser(user);
  };

  const confirmReactivate = async () => {
    if (!reactivatingUser) return;
    try {
      await updateUser(reactivatingUser.cedula, { ...reactivatingUser, estado: 'ACTIVO' });
      setMsg("Usuario reactivado exitosamente");
      setReactivatingUser(null);
      setAllUsers((prev) =>
        prev.map((u) =>
          u.cedula === reactivatingUser.cedula ? { ...u, estado: 'ACTIVO' } : u
        )
      );
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error("Error reactivando usuario:", err);
      setMsg("Error al reactivar usuario");
    }
  };

  const clearFilters = () => {
    setFilters({ nombre: "", correo: "", rol: "" });
  };

  if (!isAdmin && !isModerator) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso denegado</h1>
          <p>No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              Gestión de Usuarios
              {isModerator && !isAdmin && (
                <span className="text-sm font-normal text-slate-400 ml-2">(Vista Moderador)</span>
              )}
            </h1>
            <IconButton
              title="Recargar"
              ariaLabel="Recargar usuarios"
              onClick={fetchAllUsers}
              className="ml-2"
            >
              <RefreshCw className="h-5 w-5" />
            </IconButton>
          </div>

          {/* Tabs para vistas */}
          <div className="mb-6 flex space-x-1 bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setView('active')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                view === 'active'
                  ? 'bg-green-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              Activas
            </button>
            <button
              onClick={() => setView('suspended')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                view === 'suspended'
                  ? 'bg-yellow-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              Suspendidas
            </button>
            {isAdmin && (
              <button
                onClick={() => setView('deleted')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                  view === 'deleted'
                    ? 'bg-red-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                }`}
              >
                Eliminadas
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <h2 className="text-lg font-semibold mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Buscar por nombre"
                name="nombre"
                value={filters.nombre}
                onChange={(e) => setFilters((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Nombre o apellido"
              />
              <Input
                label="Buscar por correo"
                name="correo"
                type="email"
                value={filters.correo}
                onChange={(e) => setFilters((f) => ({ ...f, correo: e.target.value }))}
                placeholder="Correo electrónico"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Filtrar por rol</label>
                <select
                  value={filters.rol}
                  onChange={(e) => setFilters((f) => ({ ...f, rol: e.target.value }))}
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none"
                >
                  <option value="">Todos los roles</option>
                  <option value="USER">Usuario</option>
                  <option value="MODERATOR">Moderador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={clearFilters} className="bg-gray-600 hover:bg-gray-700">
                Limpiar Filtros
              </Button>
            </div>
          </div>

          {msg && (
            <div className="mb-4 p-4 rounded-lg bg-blue-600/20 border border-blue-600 text-blue-100">
              {msg}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="mx-auto h-8 w-8 animate-spin" />
              <p className="mt-2 text-slate-400">Cargando usuarios...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg">
                {filters.nombre || filters.correo || filters.rol
                  ? "Usuario no encontrado"
                  : view === 'active'
                  ? "No hay usuarios activos"
                  : view === 'suspended'
                  ? "No hay usuarios suspendidos"
                  : "No hay usuarios eliminados"}
              </div>
              <p className="text-slate-500 mt-2">
                {filters.nombre || filters.correo || filters.rol
                  ? "Intenta con otros criterios de búsqueda"
                  : view === 'active'
                  ? "Los usuarios aparecerán aquí cuando sean registrados"
                  : view === 'suspended'
                  ? "Los usuarios suspendidos aparecerán aquí"
                  : "Los usuarios eliminados aparecerán aquí"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-slate-800/40 rounded-lg overflow-hidden">
                  <thead className="bg-slate-700/60">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Cédula
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Apellido
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Correo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {pageSlice.map((user) => (
                      <tr key={user.cedula} className="hover:bg-slate-700/30">
                        <td className="px-4 py-3 text-sm text-slate-100">
                          <div className="inline-flex items-center gap-2">
                            <IdCard className="h-4 w-4 opacity-70" />
                            {user.cedula}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-100">
                          <div className="inline-flex items-center gap-2">
                            <User2 className="h-4 w-4 opacity-70" />
                            {user.nombre}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-100">{user.apellido}</td>
                        <td className="px-4 py-3 text-sm text-slate-100">
                          <div className="inline-flex items-center gap-2">
                            <Mail className="h-4 w-4 opacity-70" />
                            {user.correo}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-100">
                          <div className="inline-flex items-center gap-2">
                            <Shield className="h-4 w-4 opacity-70" />
                            <Badge
                              tone={
                                user.rol === "ADMIN"
                                  ? "red"
                                  : user.rol === "MODERATOR"
                                  ? "yellow"
                                  : "green"
                              }
                            >
                              {user.rol === "USER"
                                ? "Usuario"
                                : user.rol === "MODERATOR"
                                ? "Moderador"
                                : user.rol === "ADMIN"
                                ? "Administrador"
                                : user.rol}
                            </Badge>

                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center justify-end gap-2">
                            {view === 'active' && (
                              <>
                                {isAdmin && (
                                  <IconButton
                                    title="Editar usuario"
                                    ariaLabel={`Editar ${user.nombre} ${user.apellido}`}
                                    onClick={() => handleEdit(user)}
                                    className="border-blue-500/30 hover:border-blue-500/50"
                                  >
                                    <PencilLine className="h-4 w-4" />
                                  </IconButton>
                                )}
                                <IconButton
                                  title="Suspender usuario"
                                  ariaLabel={`Suspender ${user.nombre} ${user.apellido}`}
                                  onClick={() => handleSuspend(user)}
                                  className="border-yellow-500/30 hover:border-yellow-500/50"
                                >
                                  <Ban className="h-4 w-4" />
                                </IconButton>
                                {isAdmin && (
                                  <IconButton
                                    title="Eliminar usuario"
                                    ariaLabel={`Eliminar ${user.nombre} ${user.apellido}`}
                                    onClick={() => handleDelete(user)}
                                    className="border-red-500/30 hover:border-red-500/50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </IconButton>
                                )}
                              </>
                            )}
                            {view === 'suspended' && (
                              <>
                                {isAdmin && (
                                  <IconButton
                                    title="Editar usuario"
                                    ariaLabel={`Editar ${user.nombre} ${user.apellido}`}
                                    onClick={() => handleEdit(user)}
                                    className="border-blue-500/30 hover:border-blue-500/50"
                                  >
                                    <PencilLine className="h-4 w-4" />
                                  </IconButton>
                                )}
                                <IconButton
                                  title="Reactivar usuario"
                                  ariaLabel={`Reactivar ${user.nombre} ${user.apellido}`}
                                  onClick={() => handleReactivate(user)}
                                  className="border-green-500/30 hover:border-green-500/50"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </IconButton>
                                {isAdmin && (
                                  <IconButton
                                    title="Eliminar usuario"
                                    ariaLabel={`Eliminar ${user.nombre} ${user.apellido}`}
                                    onClick={() => handleDelete(user)}
                                    className="border-red-500/30 hover:border-red-500/50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </IconButton>
                                )}
                              </>
                            )}
                            {view === 'deleted' && (
                              <span className="text-slate-400 text-sm">Cuenta eliminada</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}

          {/* Delete Confirmation Modal */}
          {deletingUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-red-400">Confirmar Eliminación</h2>
                <p className="text-slate-300 mb-6">
                  ¿Eliminar al usuario{" "}
                  <strong>
                    {deletingUser.nombre} {deletingUser.apellido}
                  </strong>
                  ?
                  <br />
                  <span className="text-sm text-slate-400">Cédula: {deletingUser.cedula}</span>
                </p>
                <p className="text-sm text-slate-400 mb-6">Esta acción no se puede deshacer.</p>
                <div className="flex gap-3">
                  <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                    Eliminar
                  </Button>
                  <Button
                    onClick={() => setDeletingUser(null)}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Suspend Confirmation Modal */}
          {suspendingUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400">Confirmar Suspensión</h2>
                <p className="text-slate-300 mb-6">
                  ¿Suspender al usuario{" "}
                  <strong>
                    {suspendingUser.nombre} {suspendingUser.apellido}
                  </strong>
                  ?
                  <br />
                  <span className="text-sm text-slate-400">Cédula: {suspendingUser.cedula}</span>
                </p>
                <p className="text-sm text-slate-400 mb-6">El usuario podrá ser reactivado después.</p>
                <div className="flex gap-3">
                  <Button onClick={confirmSuspend} className="bg-yellow-600 hover:bg-yellow-700">
                    Suspender
                  </Button>
                  <Button
                    onClick={() => setSuspendingUser(null)}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Reactivate Confirmation Modal */}
          {reactivatingUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-green-400">Confirmar Reactivación</h2>
                <p className="text-slate-300 mb-6">
                  ¿Reactivar al usuario{" "}
                  <strong>
                    {reactivatingUser.nombre} {reactivatingUser.apellido}
                  </strong>
                  ?
                  <br />
                  <span className="text-sm text-slate-400">Cédula: {reactivatingUser.cedula}</span>
                </p>
                <p className="text-sm text-slate-400 mb-6">El usuario podrá acceder nuevamente al sistema.</p>
                <div className="flex gap-3">
                  <Button onClick={confirmReactivate} className="bg-green-600 hover:bg-green-700">
                    Reactivar
                  </Button>
                  <Button
                    onClick={() => setReactivatingUser(null)}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {editingUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-center">Editar Usuario</h2>
                  <form onSubmit={handleUpdate} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nombre"
                        name="nombre"
                        value={editForm.nombre}
                        onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                      />
                      <Input
                        label="Apellido"
                        name="apellido"
                        value={editForm.apellido}
                        onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Cédula"
                        name="cedula"
                        value={editForm.cedula}
                        onChange={(e) => setEditForm({ ...editForm, cedula: e.target.value })}
                        disabled
                      />
                      <Input
                        label="Correo"
                        name="correo"
                        type="email"
                        value={editForm.correo}
                        onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })}
                        disabled
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Teléfono"
                        name="telefono"
                        value={editForm.telefono}
                        onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">Género</label>
                        <select
                          value={editForm.genero}
                          onChange={(e) => setEditForm({ ...editForm, genero: e.target.value })}
                          className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none"
                        >
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                        </select>
                      </div>
                    </div>

                    <Input
                      label="Dirección"
                      name="direccion"
                      value={editForm.direccion}
                      onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })}
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">Rol</label>
                      <select
                        value={editForm.rol}
                        onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}
                        className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none"
                        disabled={!isAdmin}
                      >
                        <option value="USER">Usuario</option>
                        <option value="MODERATOR">Moderador</option>
                        {isAdmin && <option value="ADMIN">Administrador</option>}
                      </select>
                      {!isAdmin && (
                        <p className="text-xs text-slate-400">Solo administradores pueden cambiar roles</p>
                      )}
                    </div>



                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1">
                        Actualizar Usuario
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="bg-gray-600 hover:bg-gray-700 flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

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
                      ¡Operación exitosa!
                    </h3>
                    <p className="text-sm text-slate-400 mb-6">
                      {successMessage}
                    </p>
                    <Button
                      onClick={() => setSuccessModal(false)}
                      className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                    >
                      Aceptar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
