import { useEffect, useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, CalendarDays, User, FileText, MessageSquare, ShieldCheck, AlertTriangle } from "lucide-react";
import { productsApi } from "../../api/products";

const formatDateTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatCurrency = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "--";
  try {
    return Number(value).toLocaleString("es-EC", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
  } catch (err) {
    return `$${value}`;
  }
};

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";

const getNestedValue = (source, key) => {
  if (!source) return undefined;
  if (Array.isArray(key)) {
    let current = source;
    for (const segment of key) {
      if (!current || typeof current !== "object") return undefined;
      current = current?.[segment];
    }
    return current;
  }
  return source?.[key];
};

function DetailRow({ label, value }) {
  if (!hasValue(value)) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm text-slate-200 whitespace-pre-wrap break-words">{value}</span>
    </div>
  );
}

export default function ModerationDetailsModal({
  open,
  onClose,
  productId,
  product: providedProduct,
  incident,
  history = [],
  context = "incident",
  appealInfo,
}) {
  const [product, setProduct] = useState(providedProduct ?? null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [error, setError] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setProduct(providedProduct ?? null);
    setImageIndex(0);
    setError(null);
    setImageErrors({});
  }, [open, providedProduct]);

  useEffect(() => {
    if (!open || !productId) return;
    let cancelled = false;
    setLoadingProduct(true);
    setError(null);

    productsApi
      .getById(productId)
      .then((response) => {
        if (cancelled) return;
        const data = response?.data ?? null;
        setProduct((prev) => data || prev || null);
      })
      .catch((err) => {
        console.error("Error al cargar detalle de producto:", err);
        if (cancelled) return;
        setError("No se pudo cargar el detalle completo del producto");
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingProduct(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, productId]);

  const imageUrls = useMemo(() => {
    if (!product || !Array.isArray(product.fotos)) return [];
    return product.fotos
      .map((foto) => {
        if (!foto) return null;
        if (typeof foto === "string") return productsApi.getImageUrl(foto);
        if (typeof foto === "object" && foto.url) return productsApi.getImageUrl(foto.url);
        if (typeof foto === "object" && foto.nombreArchivo) return productsApi.getImageUrl(foto.nombreArchivo);
        return null;
      })
      .filter(Boolean);
  }, [product]);

  useEffect(() => {
    if (imageIndex >= imageUrls.length) {
      setImageIndex(0);
    }
  }, [imageUrls, imageIndex]);

  const historyEntries = useMemo(() => {
    if (!Array.isArray(history)) return [];
    return [...history].sort((a, b) => {
      const dateA = new Date(a?.fechaAccion ?? 0).getTime();
      const dateB = new Date(b?.fechaAccion ?? 0).getTime();
      return dateB - dateA;
    });
  }, [history]);

  const derivedAppealDetails = useMemo(() => {
    if (context !== "appeal") return [];

    const sources = [
      appealInfo?.appeal,
      appealInfo?.product?.apelacion,
      appealInfo?.product,
      product?.apelacion,
      product,
    ].filter((item) => item && typeof item === "object");

    const descriptors = [
      { label: "Justificación de la apelación", keys: ["justificacion", "justificacionApelacion", "motivo", "motivoApelacion"] },
      { label: "Comentarios adicionales", keys: ["comentarios", "comentariosApelacion", "detalle"] },
      { label: "Fecha de apelación", keys: ["fechaRegistro", "fechaApelacion", "fechaCreacion"] },
      { label: "Estado de la apelación", keys: ["estado", "estadoApelacion"] },
      { label: "Contacto del solicitante", keys: ["correoSolicitante", "contacto", "email"] },
    ];

    const seenLabels = new Set();
    const results = [];

    descriptors.forEach(({ label, keys }) => {
      for (const source of sources) {
        for (const key of keys) {
          const value = getNestedValue(source, key);
          if (hasValue(value)) {
            if (label.toLowerCase().includes("fecha")) {
              results.push({ label, value: formatDateTime(value) });
            } else {
              results.push({ label, value });
            }
            seenLabels.add(label);
            return;
          }
        }
      }
    });

    if (!seenLabels.has("Estado de la apelación") && hasValue(product?.estado)) {
      results.push({ label: "Estado de la apelación", value: product.estado });
    }

    return results;
  }, [context, appealInfo, product]);

  if (!open) return null;

  const handlePrevImage = () => {
    setImageIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const productName = product?.nombre || incident?.nombreProducto || "Detalle del producto";
  const productStatus = product?.estado || incident?.estadoProducto || "";
  const availability = product?.disponibilidad;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/90 shadow-2xl backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-800/80 bg-slate-950/95 px-6 py-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-slate-50">{productName}</h2>
              {productStatus && (
                <span className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                  {productStatus}
                </span>
              )}
              {context === "appeal" && (
                <span className="rounded-full border border-purple-500/40 bg-purple-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-purple-200">
                  Apelación
                </span>
              )}
              {context === "incident" && (
                <span className="rounded-full border border-yellow-400/40 bg-yellow-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-200">
                  Incidencia
                </span>
              )}
            </div>
            {product?.codigo && <p className="text-sm text-slate-400">Código: {product.codigo}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/70 text-slate-300 hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex h-full flex-col overflow-y-auto">
          <div className="space-y-8 px-6 py-6">
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  {imageUrls.length > 0 && !imageErrors[imageIndex] ? (
                    <img
                      src={imageUrls[imageIndex]}
                      alt={`${productName} - imagen ${imageIndex + 1}`}
                      className="h-full w-full object-cover"
                      onError={() => {
                        setImageErrors((prev) => ({ ...prev, [imageIndex]: true }));
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-600">
                      <span className="text-sm">Sin imágenes disponibles</span>
                    </div>
                  )}

                  {imageUrls.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/80 text-slate-200 shadow hover:bg-slate-900"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/80 text-slate-200 shadow hover:bg-slate-900"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/85 px-3 py-1 text-xs text-slate-200">
                        {imageIndex + 1} / {imageUrls.length}
                      </div>
                    </>
                  )}
                </div>
                {loadingProduct && (
                  <p className="text-sm text-slate-400">Cargando información del producto...</p>
                )}
                {error && !loadingProduct && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailRow label="Precio" value={formatCurrency(product?.precio)} />
                  <DetailRow label="Tipo" value={product?.tipo} />
                  <DetailRow label="Categoría" value={product?.nombreCategoria} />
                  <DetailRow label="Ubicación" value={product?.ubicacion} />
                  <DetailRow label="Publicado" value={formatDateTime(product?.fechaPublicacion)} />
                  <DetailRow label="Última actualización" value={formatDateTime(product?.fechaActualizacion)} />
                  <DetailRow label="Disponibilidad" value={availability === undefined ? undefined : availability ? "Disponible" : "No disponible"} />
                  <DetailRow label="Vendedor" value={product?.nombreVendedor ? `${product.nombreVendedor}${product?.idVendedor ? ` (ID ${product.idVendedor})` : ""}` : undefined} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Descripción</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                    {hasValue(product?.descripcion) ? product.descripcion : "Sin descripción disponible."}
                  </p>
                </div>
              </div>
            </section>

            {incident && (
              <section className="space-y-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                <div className="flex items-center gap-2 text-yellow-200">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Detalle de la incidencia</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailRow label="ID de incidencia" value={`#${incident.idIncidencia}`} />
                  <DetailRow label="Estado" value={incident.estado} />
                  <DetailRow
                    label="Usuario que reporta"
                    value={incident.nombreUsuarioReporta ? `${incident.nombreUsuarioReporta}${incident.idUsuarioReporta ? ` (ID ${incident.idUsuarioReporta})` : ""}` : undefined}
                  />
                  <DetailRow label="Registrado" value={formatDateTime(incident.fechaRegistro)} />
                  <DetailRow label="Motivo" value={incident.motivo} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-yellow-300">Descripción completa del reporte</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-yellow-50/90">
                    {hasValue(incident.descripcion) ? incident.descripcion : "Sin descripción adicional."}
                  </p>
                </div>
                {incident.estado !== "PENDIENTE" && (
                  <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-yellow-200/80">Resumen de revisión</p>
                    <p className="mt-2 text-sm text-yellow-100/90">
                      {historyEntries[0]?.accionTomada || "Sin registros de acciones."}
                    </p>
                  </div>
                )}
              </section>
            )}

            {context === "appeal" && (
              <section className="space-y-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5">
                <div className="flex items-center gap-2 text-purple-200">
                  <ShieldCheck className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Detalle de la apelación</h3>
                </div>
                {derivedAppealDetails.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {derivedAppealDetails.map(({ label, value }) => (
                      <DetailRow key={label} label={label} value={value} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-purple-100/80">
                    No se encontraron detalles adicionales de la apelación en los datos disponibles.
                  </p>
                )}
                {appealInfo?.product?.apelacion?.comentarioRevisor && (
                  <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-purple-200/80">Notas del revisor</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-purple-50/90">
                      {appealInfo.product.apelacion.comentarioRevisor}
                    </p>
                  </div>
                )}
              </section>
            )}

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-200">
                <MessageSquare className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Historial de revisión</h3>
              </div>
              {historyEntries.length > 0 ? (
                <div className="space-y-3">
                  {historyEntries.map((entry, index) => (
                    <div
                      key={entry.idReporte ?? entry.id ?? index}
                      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-slate-200">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="font-semibold">
                            {entry.nombreModerador || (entry.idModerador ? `Moderador ${entry.idModerador}` : "Moderador")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <CalendarDays className="h-4 w-4" />
                          {formatDateTime(entry.fechaAccion)}
                        </div>
                      </div>
                      {hasValue(entry.accionTomada) && (
                        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-200">{entry.accionTomada}</p>
                      )}
                      {hasValue(entry.comentario) && (
                        <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                            <FileText className="h-3.5 w-3.5" />
                            Notas internas
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{entry.comentario}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Aún no hay registros de acciones de moderación.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
