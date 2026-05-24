import { useEffect, useMemo, useState } from "react";
import { Check, Ban, RefreshCw, Search, AlertTriangle, ShieldCheck, Eye } from "lucide-react";
import Header from "../components/ui/Header";
import Pagination from "../components/ui/Pagination";
import ModerationActionModal from "../components/ui/ModerationActionModal";
import ModerationDetailsModal from "../components/ui/ModerationDetailsModal";
import { reportsApi, moderationReportsApi } from "../api/reports";
import { productManagementApi } from "../api/productManagement";
import { useNotifications } from "../hooks/useNotifications";
import { getAuth } from "../state/auth";

const STATUS_FILTERS = [
  { value: "ALL", label: "Todas" },
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "ATENDIDA", label: "Atendidas" },
  { value: "DESCARTADA", label: "Descartadas" },
];

const PAGE_SIZE = 8;

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [reportsMap, setReportsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: "PENDIENTE" });
  const [currentPage, setCurrentPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const { notify } = useNotifications();
  const auth = getAuth();
  const moderatorId = auth?.user?.id;

  const loadData = async () => {
    setLoading(true);
    try {
      const [incidentRes, reportRes] = await Promise.all([
        reportsApi.getAll(),
        moderationReportsApi.getAll(),
      ]);

      const incidentData = Array.isArray(incidentRes?.data) ? incidentRes.data : [];
      const reportData = Array.isArray(reportRes?.data) ? reportRes.data : [];

      const grouped = reportData.reduce((acc, report) => {
        if (!report.idIncidencia) return acc;
        if (!acc[report.idIncidencia]) acc[report.idIncidencia] = [];
        acc[report.idIncidencia].push(report);
        return acc;
      }, {});

      Object.values(grouped).forEach((list) => {
        list.sort((a, b) => new Date(b.fechaAccion) - new Date(a.fechaAccion));
      });

      incidentData.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));

      setIncidents(incidentData);
      setReportsMap(grouped);
    } catch (err) {
      console.error("Error cargando incidencias:", err);
      notify.error("No se pudieron cargar las incidencias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredIncidents = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return incidents.filter((incident) => {
      if (filters.status !== "ALL" && incident.estado !== filters.status) {
        return false;
      }

      if (!term) return true;

      const haystack = [
        incident.idIncidencia,
        incident.idProducto,
        incident.nombreProducto,
        incident.motivo,
        incident.descripcion,
        incident.nombreUsuarioReporta,
        incident.idUsuarioReporta,
      ]
        .filter(Boolean)
        .map((value) => value.toString().toLowerCase())
        .join(" ");

      return haystack.includes(term);
    });
  }, [incidents, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredIncidents.length / PAGE_SIZE));

  const paginatedIncidents = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return filteredIncidents.slice(start, start + PAGE_SIZE);
  }, [filteredIncidents, currentPage]);

  const lastReportFor = (incidentId) => {
    const list = reportsMap[incidentId];
    return Array.isArray(list) && list.length > 0 ? list[0] : null;
  };

  const openActionModal = (incident, type) => {
    setSelected(incident);
    setActionType(type);
  };

  const closeActionModal = () => {
    if (actionLoading) return;
    setSelected(null);
    setActionType(null);
  };

  const openDetailModal = (incident) => {
    if (!incident) return;
    setDetail({
      productId: incident.idProducto,
      product: null,
      incident,
      history: reportsMap[incident.idIncidencia] || [],
      context: "incident",
    });
  };

  const closeDetailModal = () => {
    setDetail(null);
  };

  const executeAction = async ({ reason, comment }) => {
    if (!selected || !actionType || !moderatorId) return;

    setActionLoading(true);
    const incidentId = selected.idIncidencia;

    try {
      if (actionType === "accept") {
        await productManagementApi.changeState({
          productoId: selected.idProducto,
          nuevoEstado: "PROHIBIDO",
          motivo: reason || `Incidencia confirmada por moderación: ${selected.motivo ?? ""}`,
          usuarioId: moderatorId,
        });

        await reportsApi.markAsAttended(incidentId);

        await moderationReportsApi.create({
          idIncidencia: incidentId,
          idModerador: moderatorId,
          accionTomada: reason?.slice(0, 480) || "Incidencia aceptada: producto bloqueado",
          comentario: comment || "",
        });

        notify.success("Incidencia aceptada y producto bloqueado");
      } else {
        const fallback = reason || "Incidencia descartada tras revisión";

        await reportsApi.discard(incidentId);

        await moderationReportsApi.create({
          idIncidencia: incidentId,
          idModerador: moderatorId,
          accionTomada: fallback.slice(0, 480),
          comentario: comment || "",
        });

        notify.info("Incidencia descartada");
      }

      closeActionModal();
      await loadData();
    } catch (err) {
      console.error("Error al moderar incidencia:", err);
      const message =
        err?.response?.data?.mensaje ||
        err?.response?.data?.error ||
        "No se pudo aplicar la acción";
      notify.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="px-6 py-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <AlertTriangle className="w-7 h-7 text-yellow-400" />
                Gestión de incidencias
              </h1>
              <p className="text-slate-400 mt-1">
                Revisa los reportes enviados por los usuarios y decide si se bloquea o descarta el producto.
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700/80 text-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>

          <div className="px-6 py-4 border-b border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => {
                    setCurrentPage(0);
                    setFilters((prev) => ({ ...prev, search: e.target.value }));
                  }}
                  placeholder="Buscar por producto, motivo o usuario"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <select
                value={filters.status}
                onChange={(e) => {
                  setCurrentPage(0);
                  setFilters((prev) => ({ ...prev, status: e.target.value }));
                }}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {STATUS_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="px-6 py-4">
            {loading ? (
              <div className="py-20 text-center text-slate-400">Cargando incidencias...</div>
            ) : filteredIncidents.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg text-slate-300 mb-2">No hay incidencias</p>
                <p className="text-sm text-slate-500">
                  Ajusta los filtros o espera nuevos reportes de los usuarios.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="uppercase text-[11px] tracking-widest bg-slate-800/60 text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Incidencia</th>
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3">Reportante</th>
                      <th className="px-4 py-3">Motivo</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Registrado</th>
                      <th className="px-4 py-3">Última revisión</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {paginatedIncidents.map((incident) => {
                      const lastReport = lastReportFor(incident.idIncidencia);
                      return (
                        <tr key={incident.idIncidencia} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div>
                              <p className="font-semibold text-slate-100">#{incident.idIncidencia}</p>
                              <p className="text-xs text-slate-500">Producto #{incident.idProducto}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <p className="font-medium text-slate-100 line-clamp-2">{incident.nombreProducto}</p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{incident.descripcion}</p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <p className="font-medium text-slate-100">{incident.nombreUsuarioReporta}</p>
                            <p className="text-xs text-slate-500">ID {incident.idUsuarioReporta}</p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <span className="inline-flex px-2.5 py-1 rounded-full bg-slate-800/70 border border-slate-700 text-xs text-slate-300">
                              {incident.motivo}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <StatusBadge status={incident.estado} />
                          </td>
                          <td className="px-4 py-4 align-top text-xs text-slate-400">
                            {formatDate(incident.fechaRegistro)}
                          </td>
                          <td className="px-4 py-4 align-top text-xs text-slate-400">
                            {lastReport ? (
                              <div className="space-y-1">
                                <p className="text-slate-200 font-semibold">{lastReport.nombreModerador}</p>
                                <p className="line-clamp-2">{lastReport.accionTomada}</p>
                                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                                  {formatDate(lastReport.fechaAccion)}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-500">Sin revisión</span>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openDetailModal(incident)}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-slate-200 hover:bg-slate-700/80"
                              >
                                <Eye className="w-4 h-4" />
                                Ver producto
                              </button>
                              {incident.estado === "PENDIENTE" ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openActionModal(incident, "accept")}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/15 border border-green-400/40 text-green-300 hover:bg-green-500/25"
                                  >
                                    <Check className="w-4 h-4" />
                                    Aceptar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openActionModal(incident, "reject")}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/15 border border-red-400/40 text-red-300 hover:bg-red-500/25"
                                  >
                                    <Ban className="w-4 h-4" />
                                    Descartar
                                  </button>
                                </>
                              ) : (
                                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700 text-slate-400 text-xs">
                                  <ShieldCheck className="w-4 h-4" />
                                  Revisado
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {filteredIncidents.length > PAGE_SIZE && (
            <div className="px-6 pb-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)))}
              />
            </div>
          )}
        </section>
      </main>

      <ModerationActionModal
        open={Boolean(selected)}
        mode={actionType === "reject" ? "reject" : "accept"}
        title={actionType === "accept" ? "Aceptar incidencia" : "Descartar incidencia"}
        description={
          selected
            ? `Producto: ${selected.nombreProducto || ""}\nMotivo reportado: ${selected.motivo || ""}`
            : ""
        }
        confirmLabel={actionType === "accept" ? "Confirmar bloqueo" : "Confirmar descarte"}
        reasonLabel={actionType === "accept" ? "Motivo del bloqueo" : "Motivo del descarte"}
        reasonPlaceholder={
          actionType === "accept"
            ? "Describe brevemente por qué se bloqueará el producto"
            : "Describe por qué se descarta la incidencia"
        }
        commentPlaceholder="Notas internas para futuras revisiones"
        requireReason
        loading={actionLoading}
        onClose={closeActionModal}
        onConfirm={executeAction}
      />

      <ModerationDetailsModal
        open={Boolean(detail)}
        onClose={closeDetailModal}
        productId={detail?.productId}
        product={detail?.product}
        incident={detail?.incident}
        history={detail?.history}
        context={detail?.context}
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const base = "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold";

  switch (status) {
    case "PENDIENTE":
      return <span className={`${base} bg-yellow-500/10 border-yellow-400/40 text-yellow-300`}>Pendiente</span>;
    case "ATENDIDA":
      return <span className={`${base} bg-green-500/10 border-green-400/40 text-green-300`}>Aceptada</span>;
    case "DESCARTADA":
      return <span className={`${base} bg-slate-700/40 border-slate-600/60 text-slate-300`}>Descartada</span>;
    default:
      return <span className={`${base} bg-slate-700/40 border-slate-600/60 text-slate-300`}>{status}</span>;
  }
}
