// Componente de tarjeta de producto
import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { productsApi, interestApi } from "../../api/products";
import { getAuth } from "../../state/auth";
import { favoritesStateAtom, favoritesCountAtom } from "../../state/favorites";

export default function ProductCard({ product, onProductClick }) {
  const [favoritesState, setFavoritesState] = useAtom(favoritesStateAtom);
  const [favoritesCount, setFavoritesCount] = useAtom(favoritesCountAtom);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const auth = getAuth();

  const mainPhoto = product.fotos && product.fotos.length > 0 ? product.fotos[0] : null;
  const imageUrl = mainPhoto ? productsApi.getImageUrl(mainPhoto.url) : null;

  // Obtener estado del producto desde el store global
  const isInterested = favoritesState.get(product.idProducto) || false;
  const interestCount = favoritesCount.get(product.idProducto) || 0;

  // Truncar descripción
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Cargar estado inicial SOLO si no está en el store
  useEffect(() => {
    if (auth?.user?.id && !favoritesState.has(product.idProducto)) {
      loadInterestState();
    }
    if (!favoritesCount.has(product.idProducto)) {
      loadInterestCount();
    }
  }, [product.idProducto, auth?.user?.id]);

  const loadInterestState = async () => {
    try {
      const response = await interestApi.exists(auth.user.id, product.idProducto);
      console.log('🔍 Estado de interés cargado:', {
        productoId: product.idProducto,
        response: response.data,
        tieneInteres: response.data.tieneInteres,
        meInteresa: response.data.meInteresa
      });
      
      // Intentar con ambos campos posibles
      const interested = response.data.tieneInteres ?? response.data.meInteresa ?? false;
      
      const newState = new Map(favoritesState);
      newState.set(product.idProducto, interested);
      setFavoritesState(newState);
    } catch (error) {
      console.error("Error loading interest state:", error);
    }
  };

  const loadInterestCount = async () => {
    try {
      const response = await interestApi.getCount(product.idProducto);
      console.log('Contador de interés cargado:', {
        productoId: product.idProducto,
        response: response.data,
        count: response.data.cantidadMeInteresa ?? response.data.count ?? response.data.totalIntereses
      });
      
      // Intentar con los campos posibles
      const count = response.data.cantidadMeInteresa ?? response.data.count ?? response.data.totalIntereses ?? 0;
      
      const newCount = new Map(favoritesCount);
      newCount.set(product.idProducto, count);
      setFavoritesCount(newCount);
    } catch (error) {
      console.error("Error loading interest count:", error);
    }
  };

  const toggleInterest = async (e) => {
    e.stopPropagation();
    
    if (!auth?.user?.id) {
      alert("Debes iniciar sesión para marcar productos como favoritos");
      return;
    }

    setLoading(true);

    try {
      if (isInterested) {
        // Quitar de favoritos
        const response = await interestApi.remove(auth.user.id, product.idProducto);
        
        // Actualizar estado global
        const newState = new Map(favoritesState);
        newState.set(product.idProducto, false);
        setFavoritesState(newState);

        const newCount = new Map(favoritesCount);
        newCount.set(product.idProducto, Math.max(0, (newCount.get(product.idProducto) || 0) - 1));
        setFavoritesCount(newCount);

        console.log("Removido de favoritos:", response.data);
      } else {
        // Agregar a favoritos
        const response = await interestApi.add(auth.user.id, product.idProducto);
        
        // Verificar si el backend dice que ya existe
        if (!response.data.exitoso && response.data.mensaje?.includes("ya está en la lista")) {
          console.warn("Producto ya estaba en favoritos, sincronizando estado...");
          
          // Sincronizar con el servidor
          const existsResponse = await interestApi.exists(auth.user.id, product.idProducto);
          const interested = existsResponse.data.tieneInteres ?? existsResponse.data.meInteresa ?? true;
          
          const newState = new Map(favoritesState);
          newState.set(product.idProducto, interested);
          setFavoritesState(newState);
        } else {
          // Actualizar estado global
          const newState = new Map(favoritesState);
          newState.set(product.idProducto, true);
          setFavoritesState(newState);

          const newCount = new Map(favoritesCount);
          newCount.set(product.idProducto, (newCount.get(product.idProducto) || 0) + 1);
          setFavoritesCount(newCount);

          console.log("Agregado a favoritos:", response.data);
        }
      }

      // Recargar contador para estar seguros
      await loadInterestCount();
      
    } catch (error) {
      console.error(" Error toggling interest:", error);
      
      // Si hay error, resincronizar con el servidor
      if (auth?.user?.id) {
        try {
          const existsResponse = await interestApi.exists(auth.user.id, product.idProducto);
          const interested = existsResponse.data.tieneInteres ?? existsResponse.data.meInteresa ?? false;
          
          const newState = new Map(favoritesState);
          newState.set(product.idProducto, interested);
          setFavoritesState(newState);
          await loadInterestCount();
        } catch (syncError) {
          console.error("Error al sincronizar:", syncError);
        }
      }
      
      const errorMsg = error.response?.data?.mensaje || error.response?.data?.error || "Error al actualizar. Intenta de nuevo.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={() => onProductClick(product)} className="relative group">
      {/* Decorative gradient border (pointer-events-none so card remains clickable) */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-2xl blur opacity-80 pointer-events-none group-hover:opacity-100 transition duration-300" />

      <div className="relative rounded-2xl border border-slate-800/50 bg-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden transition-shadow duration-300 cursor-pointer">
        {/* Botón de favorito */}
        <button
          onClick={toggleInterest}
          disabled={loading}
          className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
            isInterested
              ? "bg-red-500 text-white"
              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-red-500"
          } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}`}
          title={isInterested ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill={isInterested ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Badge de tipo */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              product.tipo === "PRODUCTO"
                ? "bg-blue-500 text-white"
                : product.tipo === "SE"
                ? "bg-blue-500 text-white"
                : "bg-purple-500 text-white"
            }`}
          >
            {product.tipo}
          </span>
        </div>

        {/* Imagen */}
        <div className="relative overflow-hidden h-64 bg-gradient-to-br from-blue-800 border-t-stone-800">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={product.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => {
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto mb-2 opacity-80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm opacity-80">Sin imagen</p>
              </div>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-slate-50 mb-2 line-clamp-1">
            {product.nombre}
          </h3>

          <p className="text-slate-300 text-sm mb-3 line-clamp-2 min-h-[40px]">
            {truncateDescription(product.descripcion, 80)}
          </p>

          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl font-bold text-green-400">
              ${product.precio.toFixed(2)}
            </div>
            {interestCount > 0 && (
              <div className="flex items-center text-slate-400 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {interestCount}
              </div>
            )}
          </div>

          <div className="flex items-center text-slate-400 text-sm mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {product.ubicacion}
          </div>

          <div className="flex items-center text-slate-400 text-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
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
            {product.nombreVendedor}
          </div>
        </div>
      </div>
    </div>
  );
}
