// src/components/ui/MyProductCard.jsx
import { useState, useEffect } from "react";
import { productsApi, interestApi } from "../../api/products";
import { Pencil, Trash2, AlertTriangle, Eye, EyeOff, Heart } from "lucide-react";

export default function MyProductCard({ product, onEdit, onDelete, onAppeal, onUpdate }) {
  const [imageError, setImageError] = useState(false);
  const [interestCount, setInterestCount] = useState(0);
  const [loadingInterest, setLoadingInterest] = useState(false);

  // Cargar conteo de "Me Interesa"
  useEffect(() => {
    const loadInterestCount = async () => {
      setLoadingInterest(true);
      try {
        // El backend usa idProducto en lugar de id
        const response = await interestApi.getCount(product.idProducto);
        setInterestCount(response.data?.totalIntereses ?? 0);
      } catch (error) {
        console.error("Error al cargar intereses:", error);
      } finally {
        setLoadingInterest(false);
      }
    };
    loadInterestCount();
  }, [product.idProducto]);

  const imageUrl = product.fotos?.[0]
    ? productsApi.getImageUrl(product.fotos[0].url)
    : null;

  const isEditable =
    product.estado !== "OCULTO" &&
    product.estado !== "PROHIBIDO" &&
    product.estado !== "APELADO";

  const getStatusBadge = () => {
    switch (product.estado) {
      case "ACTIVO":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "OCULTO":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "PROHIBIDO":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "APELADO":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "ELIMINADO":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusIcon = () => {
    if (product.estado === "OCULTO") return <EyeOff className="w-3 h-3" />;
    if (product.estado === "PROHIBIDO") return <AlertTriangle className="w-3 h-3" />;
    if (product.estado === "APELADO") return <AlertTriangle className="w-3 h-3" />;
    return <Eye className="w-3 h-3" />;
  };

  const getStatusMessage = () => {
    switch (product.estado) {
      case "OCULTO":
        return "Producto oculto temporalmente (por revisión o expiración)";
      case "PROHIBIDO":
        return "Producto detectado como peligroso — No visible para compradores";
      case "APELADO":
        return "Apelación enviada. El equipo revisará tu solicitud";
      default:
        return "";
    }
  };

  return (
    <div className="relative group">
      {/* Decorative border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-2xl blur opacity-80 pointer-events-none group-hover:opacity-100 transition duration-300" />
      
      <div className="relative rounded-2xl border border-slate-800/50 bg-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Estado badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border backdrop-blur-md text-xs font-medium shadow-lg">
          <span className={`flex items-center gap-1.5 ${getStatusBadge()}`}>
            {getStatusIcon()}
            {product.estado}
          </span>
        </div>

        {/* Badge de tipo */}
        <div className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-lg border border-slate-700/50 bg-slate-800/90 backdrop-blur-md text-xs font-medium text-slate-300 shadow-lg">
          {product.tipo}
        </div>

        {/* Imagen */}
        <div className="relative h-56 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={product.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-slate-600 text-4xl">📦</div>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4">
          {/* Título y precio */}
          <div>
            <h3 className="text-lg font-semibold text-slate-50 mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
              {product.nombre}
            </h3>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              ${product.precio?.toLocaleString("es-CO")}
            </p>
          </div>

          {/* Descripción */}
          <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">
            {product.descripcion}
          </p>

          {/* Info adicional */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/50">
            <span className="flex items-center gap-1">
              📍 {product.ubicacion}
            </span>
            <span className={`px-2 py-1 rounded ${product.disponibilidad ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
              {product.disponibilidad ? "Disponible" : "No disponible"}
            </span>
          </div>

          {/* Contador de "Me Interesa" */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/50">
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            <span className="text-sm text-slate-400">
              {loadingInterest ? "..." : interestCount} personas interesadas
            </span>
          </div>

          {/* Mensaje de estado si requiere atención */}
          {(product.estado === "OCULTO" || product.estado === "PROHIBIDO" || product.estado === "APELADO") && (
            <div className="pt-2 border-t border-slate-800/50">
              <div className={`px-3 py-2 rounded-lg text-xs ${
                product.estado === "OCULTO" 
                  ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/30" 
                  : product.estado === "PROHIBIDO"
                  ? "bg-red-500/10 text-red-300 border border-red-500/30"
                  : "bg-purple-500/10 text-purple-300 border border-purple-500/30"
              }`}>
                <p className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  {getStatusMessage()}
                </p>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            {product.estado === "ACTIVO" && (
              <>
                <button
                  onClick={() => onEdit(product)}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => onDelete(product)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-all duration-300 border border-red-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            {product.estado === "OCULTO" && (
              <button
                onClick={() => onAppeal(product)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-xl font-medium transition-all duration-300 border border-yellow-500/30"
              >
                <AlertTriangle className="w-4 h-4" />
                Apelar
              </button>
            )}
            {product.estado === "PROHIBIDO" && (
              <button
                onClick={() => onAppeal(product)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-all duration-300 border border-red-500/30"
              >
                <AlertTriangle className="w-4 h-4" />
                Apelar
              </button>
            )}
            {product.estado === "APELADO" && (
              <div className="flex-1 flex items-center justify-center px-4 py-2.5 bg-purple-500/10 text-purple-300 rounded-xl font-medium border border-purple-500/30">
                En revisión
              </div>
            )}
            {product.estado === "ELIMINADO" && (
              <div className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gray-500/10 text-gray-400 rounded-xl font-medium border border-gray-500/30">
                Producto eliminado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
