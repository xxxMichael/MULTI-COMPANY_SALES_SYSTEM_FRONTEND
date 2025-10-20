// Modal de detalle del producto
import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { productsApi, interestApi } from "../../api/products";
import { getAuth } from "../../state/auth";
import { favoritesStateAtom, favoritesCountAtom } from "../../state/favorites";

export default function ProductDetailModal({ product, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favoritesState, setFavoritesState] = useAtom(favoritesStateAtom);
  const [favoritesCount, setFavoritesCount] = useAtom(favoritesCountAtom);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState({});
  const auth = getAuth();

  // Obtener estado del producto desde el store global
  const isInterested = favoritesState.get(product.idProducto) || false;
  const interestCount = favoritesCount.get(product.idProducto) || 0;

  const images =
    product.fotos && product.fotos.length > 0
      ? product.fotos.map((foto) => productsApi.getImageUrl(foto.url))
      : [];

  useEffect(() => {
    // Prevenir scroll del body
    document.body.style.overflow = "hidden";

    // Cargar estado inicial SOLO si no está en el store
    if (auth?.user?.id && !favoritesState.has(product.idProducto)) {
      loadInterestState();
    }
    if (!favoritesCount.has(product.idProducto)) {
      loadInterestCount();
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [product.idProducto, auth?.user?.id]);

  const loadInterestState = async () => {
    try {
      const response = await interestApi.exists(auth.user.id, product.idProducto);
      console.log('🔍 [Modal] Estado de interés cargado:', {
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
      console.log('🔢 [Modal] Contador de interés cargado:', {
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

  const toggleInterest = async () => {
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

        console.log("✅ Removido de favoritos:", response.data);
      } else {
        // Agregar a favoritos
        const response = await interestApi.add(auth.user.id, product.idProducto);
        
        // Verificar si el backend dice que ya existe
        if (!response.data.exitoso && response.data.mensaje?.includes("ya está en la lista")) {
          console.warn("⚠️ [Modal] Producto ya estaba en favoritos, sincronizando estado...");
          
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

          console.log("✅ Agregado a favoritos:", response.data);
        }
      }

      // Recargar contador para estar seguros
      await loadInterestCount();
      
    } catch (error) {
      console.error("❌ Error toggling interest:", error);
      
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl border border-slate-800/50 bg-slate-900/90 backdrop-blur-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/90 border-b border-slate-800/40 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-slate-50 flex-1 pr-4 break-words break-all">{product.nombre}</h2>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Galería de imágenes */}
            <div>
              {/* Imagen principal */}
              <div className="relative bg-gradient-to-br from-blue-800 to-purple-800 rounded-lg overflow-hidden mb-4">
                {images.length > 0 && !imageError[currentImageIndex] ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={`${product.nombre} - Imagen ${currentImageIndex + 1}`}
                    className="w-full h-96 object-cover"
                    onError={() => {
                      setImageError(prev => ({ ...prev, [currentImageIndex]: true }));
                    }}
                  />
                ) : (
                  <div className="w-full h-96 flex items-center justify-center text-white">
                    <div className="text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-24 w-24 mx-auto mb-3 opacity-80"
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
                      <p className="text-lg opacity-80">Sin imágenes disponibles</p>
                    </div>
                  </div>
                )}

                {/* Controles de navegación */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-all"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-all"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>

                    {/* Indicador */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Miniaturas */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index
                          ? "border-blue-500 scale-95"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      {!imageError[index] ? (
                        <img
                          src={img}
                          alt={`Miniatura ${index + 1}`}
                          className="w-full h-16 object-cover"
                          onError={() => {
                            setImageError(prev => ({ ...prev, [index]: true }));
                          }}
                        />
                      ) : (
                        <div className="w-full h-16 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-white opacity-60"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Información del producto */}
            <div>
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    product.tipo === "NUEVO"
                      ? "bg-green-500 text-white"
                      : product.tipo === "USADO"
                      ? "bg-blue-500 text-white"
                      : "bg-purple-500 text-white"
                  }`}
                >
                  {product.tipo}
                </span>
                {product.disponibilidad ? (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    Disponible
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                    No disponible
                  </span>
                )}
              </div>

              {/* Precio */}
              <div className="mb-6">
                <p className="text-4xl font-bold text-green-400">
                  ${product.precio.toFixed(2)}
                </p>
              </div>

              {/* Descripción */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-50 mb-2">
                  Descripción
                </h3>
                <p className="text-slate-300 whitespace-pre-line break-words break-all">
                  {product.descripcion || "Sin descripción"}
                </p>
              </div>

              {/* Detalles */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-slate-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-3 text-gray-400"
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
                  <span className="font-medium">Ubicación:</span>
                  <span className="ml-2 break-words break-all max-w-full">{product.ubicacion}</span>
                </div>

                <div className="flex items-center text-slate-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-3 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium">Publicado:</span>
                  <span className="ml-2">{formatDate(product.fechaPublicacion)}</span>
                </div>

                <div className="flex items-center text-slate-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-3 text-gray-400"
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
                  <span className="font-medium">Vendedor:</span>
                  <span className="ml-2 break-words max-w-full">{product.nombreVendedor}</span>
                </div>

                <div className="flex items-center text-slate-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-3 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span className="font-medium">Categoría:</span>
                  <span className="ml-2 break-words max-w-full">{product.nombreCategoria}</span>
                </div>
              </div>

              {/* Botón de favoritos */}
              <button
                onClick={toggleInterest}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  isInterested
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-slate-800/60 hover:bg-slate-800 text-slate-100"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
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
                {isInterested ? "Quitar de favoritos" : "Agregar a favoritos"}
                {interestCount > 0 && <span>({interestCount})</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
