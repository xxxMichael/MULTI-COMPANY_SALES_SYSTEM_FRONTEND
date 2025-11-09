import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, UserCheck, CheckCircle, XCircle } from "lucide-react";
import Header from "../components/ui/Header";
import Pagination from "../components/ui/Pagination";
import ModerationActionModal from "../components/ui/ModerationActionModal";
import { productsApi } from "../api/products";
import { reportsApi, moderationReportsApi } from "../api/reports";
import { productManagementApi } from "../api/productManagement";
import { useNotifications } from "../hooks/useNotifications";
import { getAuth } from "../state/auth";

const PAGE_SIZE = 6;

const fetchAllProducts = async () => {
  const pageSize = 100;
  let page = 0;
  let totalPages = 1;
  const results = [];

  while (page < totalPages) {
    const response = await productsApi.getAll({ page, size: pageSize, sort: "fechaPublicacion,desc" });
    const data = response?.data;

    if (data?.content) {
      results.push(...data.content);
      totalPages = data.totalPages ?? 1;
      if (!data.content.length) break;
    } else if (Array.isArray(data)) {
      results.push(...data);
      break;
    } else {
      break;
    }

    page += 1;
    if (page >= 20) break;
  }

  return results;
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function AdminAppealsPage() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", tipo: "ALL" });
  const [currentPage, setCurrentPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { notify } = useNotifications();
  const auth = getAuth();
  const moderatorId = auth?.user?.id;

  const loadData = async () => {
    setLoading(true);

    try {
      const [products, incidentRes, reportRes] = await Promise.all([
        fetchAllProducts(),
        reportsApi.getAll(),
        moderationReportsApi.getAll(),
      ]);

      const incidents = Array.isArray(incidentRes?.data) ? incidentRes.data : [];
      const reports = Array.isArray(reportRes?.data) ? reportRes.data : [];

      const groupedReports = reports.reduce((acc, report) => {
        if (!report.idIncidencia) return acc;
        if (!acc[report.idIncidencia]) acc[report.idIncidencia] = [];
        acc[report.idIncidencia].push(report);
        return acc;
      }, {});

      Object.values(groupedReports).forEach((list) => {
        list.sort((a, b) => new Date(b.fechaAccion) - new Date(a.fechaAccion));
      });

      const appealsData = products
        .filter((product) => product.estado === "APELADO")
        .map((product) => {
          const related = incidents.filter((incident) => incident.idProducto === product.idProducto);
          const accepted = related.find((incident) => incident.estado === "ATENDIDA");
          const incident = accepted || related.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))[0] || null;
          const lastReport = incident && groupedReports[incident.idIncidencia]
            ? groupedReports[incident.idIncidencia][0]
            : null;

          return {
            product,
            incident,
            lastReport,
          };
        });

      appealsData.sort((a, b) => new Date(b.product.fechaPublicacion) - new Date(a.product.fechaPublicacion));

  setAppeals(appealsData);
    } catch (err) {
      console.error("Error cargando apelaciones:", err);
      notify.error("No se pudieron cargar las apelaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAppeals = useMemo(() => {
    const term = filters.search.trim().toLowerCase();

    return appeals.filter(({ product }) => {
      if (filters.tipo !== "ALL" && product.tipo !== filters.tipo) {
        return false;
      }

      if (!term) return true;

      const haystack = [
        product.nombre,
        product.codigo,
        product.descripcion,
        product.nombreVendedor,
        product.idProducto,
      ]
        .filter(Boolean)
        .map((value) => value.toString().toLowerCase())
        .join(" ");

      return haystack.includes(term);
    });
  }, [appeals, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredAppeals.length / PAGE_SIZE));

  const paginatedAppeals = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return filteredAppeals.slice(start, start + PAGE_SIZE);
  }, [filteredAppeals, currentPage]);

  const openActionModal = (appeal, type) => {
    setSelected(appeal);
    setActionType(type);
  };

  const closeActionModal = () => {
    if (actionLoading) return;
    setSelected(null);
    setActionType(null);
  };

  const executeAction = async ({ reason, comment }) => {
    if (!selected || !actionType || !moderatorId) return;

    setActionLoading(true);

    const { product, incident } = selected;
    const incidentId = incident?.idIncidencia;

    try {
      if (actionType === "approve") {
        await productManagementApi.approveAppeal(product.idProducto, reason);

        if (incidentId) {
          await moderationReportsApi.create({
            idIncidencia: incidentId,
            idModerador: moderatorId,
            accionTomada: reason?.slice(0, 480) || "Apelación aprobada - producto reactivado",
            comentario: comment || "",
          });
        }

        notify.success("Apelación aprobada. El producto vuelve a estar activo.");
      } else {
        const fallback = reason || "Apelación rechazada - el producto continúa prohibido";
        await productManagementApi.rejectAppeal(product.idProducto, fallback);

        if (incidentId) {
          await moderationReportsApi.create({
            idIncidencia: incidentId,
            idModerador: moderatorId,
            accionTomada: fallback.slice(0, 480),
            comentario: comment || "",
          });
        }

        notify.info("Apelación rechazada. El producto permanece bloqueado.");
      }

      closeActionModal();
      await loadData();
    } catch (err) {
      console.error("Error al procesar apelación:", err);
      const message =
        err?.response?.data?.mensaje ||
        err?.response?.data?.error ||
        "No se pudo completar la acción";
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
                <UserCheck className="w-7 h-7 text-blue-400" />
                Revisión de apelaciones
              </h1>
              <p className="text-slate-400 mt-1">
                Valida las apelaciones enviadas por los vendedores para reactivar productos bloqueados.
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
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => {
                    setCurrentPage(0);
                    setFilters((prev) => ({ ...prev, search: e.target.value }));
                  }}
                  placeholder="Buscar por producto, vendedor o código"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <select
                value={filters.tipo}
                onChange={(e) => {
                  setCurrentPage(0);
                  setFilters((prev) => ({ ...prev, tipo: e.target.value }));
                }}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="ALL">Todos los tipos</option>
                <option value="PRODUCTO">Producto</option>
                <option value="SERVICIO">Servicio</option>
              </select>
            </div>
          </div>

          <div className="px-6 py-4">
            {loading ? (
              <div className="py-20 text-center text-slate-400">Cargando apelaciones...</div>
            ) : filteredAppeals.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg text-slate-300 mb-2">No hay apelaciones pendientes</p>
                <p className="text-sm text-slate-500">Los productos bloqueados aparecerán aquí cuando los vendedores apelen.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedAppeals.map((appeal) => (
                  <div
                    key={appeal.product.idProducto}
                    className="border border-slate-800 rounded-2xl bg-slate-900/70 p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-5 hover:border-blue-500/30 transition"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-start gap-3">
                        <div className="flex-1 min-w-[200px]">
                          <h2 className="text-xl font-semibold text-slate-50 flex items-center gap-2">
                            {appeal.product.nombre}
                            <span className="px-2 py-1 text-xs rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200">
                              APELADO
                            </span>
                          </h2>
                          <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                            {appeal.product.descripcion || "Sin descripción"}
                          </p>
                        </div>
                        <div className="text-sm text-slate-400">
                          <p className="font-semibold text-slate-200">Vendedor</p>
                          <p>{appeal.product.nombreVendedor || "--"}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Código: {appeal.product.codigo}
                          </p>
                        </div>
                        <div className="text-sm text-slate-400">
                          <p className="font-semibold text-slate-200">Tipo</p>
                          <p>{appeal.product.tipo}</p>
                          <p className="text-xs text-slate-500 mt-1">Publicado: {formatDate(appeal.product.fechaPublicacion)}</p>
                        </div>
                      </div>

                      {appeal.incident ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs text-slate-400">
                          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                            <p className="uppercase tracking-wide text-slate-500">Incidencia</p>
                            <p className="text-slate-200 font-semibold mt-1">#{appeal.incident.idIncidencia}</p>
                            <p className="mt-1">{appeal.incident.motivo}</p>
                            <p className="text-[11px] text-slate-500 mt-1">{formatDate(appeal.incident.fechaRegistro)}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                            <p className="uppercase tracking-wide text-slate-500">Última revisión</p>
                            {appeal.lastReport ? (
                              <>
                                <p className="text-slate-200 font-semibold mt-1">{appeal.lastReport.nombreModerador}</p>
                                <p className="mt-1 line-clamp-2">{appeal.lastReport.accionTomada}</p>
                                <p className="text-[11px] text-slate-500 mt-1">{formatDate(appeal.lastReport.fechaAccion)}</p>
                              </>
                            ) : (
                              <p className="mt-1">Sin registro</p>
                            )}
                          </div>
                          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                            <p className="uppercase tracking-wide text-slate-500">Estado actual</p>
                            <p className="text-purple-200 font-semibold mt-1">En revisión de apelación</p>
                            <p className="mt-1 text-slate-500">
                              Al aprobar, el producto vuelve a ser visible. Al rechazar, continuará bloqueado.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-slate-400">
                          No se encontró una incidencia asociada. Se recomienda verificar manualmente el historial del producto antes de decidir.
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 min-w-[200px]">
                      <button
                        type="button"
                        onClick={() => openActionModal(appeal, "approve")}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/15 border border-green-400/40 text-green-200 hover:bg-green-500/25"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprobar apelación
                      </button>
                      <button
                        type="button"
                        onClick={() => openActionModal(appeal, "deny")}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/15 border border-red-400/40 text-red-200 hover:bg-red-500/25"
                      >
                        <XCircle className="w-4 h-4" />
                        Rechazar apelación
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {filteredAppeals.length > PAGE_SIZE && (
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
        mode={actionType === "deny" ? "reject" : "approve"}
        title={actionType === "approve" ? "Aprobar apelación" : "Rechazar apelación"}
        description={
          selected
            ? `Producto: ${selected.product.nombre || ""}\nVendedor: ${selected.product.nombreVendedor || ""}`
            : ""
        }
        confirmLabel={actionType === "approve" ? "Reactivar producto" : "Mantener bloqueo"}
        reasonLabel={actionType === "approve" ? "Motivo de la aprobación" : "Motivo del rechazo"}
        reasonPlaceholder={
          actionType === "approve"
            ? "Explica por qué el producto volverá a estar disponible"
            : "Explica por qué la apelación no procede"
        }
        commentPlaceholder="Notas internas para el equipo"
        requireReason
        loading={actionLoading}
        onClose={closeActionModal}
        onConfirm={executeAction}
      />
    </div>
  );
}
