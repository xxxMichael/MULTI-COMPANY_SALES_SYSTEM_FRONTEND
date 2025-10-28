// src/pages/MyProductsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Heart, TrendingUp, History } from "lucide-react";
import Header from "../components/ui/Header";
import MyProductCard from "../components/ui/MyProductCard";
import EditProductModal from "../components/ui/EditProductModal";
import MyProductsFilter from "../components/ui/MyProductsFilter";
import Pagination from "../components/ui/Pagination";
import ConfirmModal from "../components/ui/ConfirmModal";
import { myProductsApi, interestApi, productsApi } from "../api/products";
import { getAuth } from "../state/auth";

export default function MyProductsPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const userId = auth?.user?.id;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 6;
  
  // Filtros
  const [filters, setFilters] = useState({
    searchTerm: "",
    estado: "",
    tipo: "",
    idCategoria: "",
    disponibilidad: null,
  });

  // Modales
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  // Confirm delete modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Estadísticas
  const [totalInterests, setTotalInterests] = useState(0);

  // Historial de productos
  const [showHistory, setShowHistory] = useState(false);

  // Cargar productos
  useEffect(() => {
    loadProducts();
    loadTotalInterests();
  }, [currentPage, filters, showHistory]);
  const loadProducts = async (overrideFilters) => {
    if (!userId) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const usedFilters = overrideFilters ?? filters;
      const apiFilters = { ...usedFilters };
      
      if (!showHistory && !apiFilters.estado) {

      }
      
      // Convertir idCategoria a número si existe y no es vacío
      if (apiFilters.idCategoria && apiFilters.idCategoria !== "") {
        apiFilters.idCategoria = Number(apiFilters.idCategoria);
      } else {
        delete apiFilters.idCategoria;
      }
      
      // Eliminar filtros vacíos (pero no disponibilidad si es null)
      Object.keys(apiFilters).forEach((key) => {
        if (apiFilters[key] === "") {
          delete apiFilters[key];
        }
      });

      // Si hay filtros, solicitamos más elementos y filtramos en el frontend
      const hasFilters =
        apiFilters.searchTerm ||
        apiFilters.tipo ||
        apiFilters.idCategoria ||
        apiFilters.disponibilidad !== null ||
        apiFilters.estado;

      let response;
      if (hasFilters) {
        // Pedimos un tamaño grande para poder filtrar del lado del cliente
        response = await myProductsApi.getMyProducts(userId, {
          ...apiFilters,
          page: 0,
          size: 1000,
        });
      } else {
        response = await myProductsApi.getMyProducts(userId, {
          ...apiFilters,
          page: currentPage,
          size: PAGE_SIZE,
        });
      }

      console.log("Respuesta de API:", response.data);

      // Manejo flexible de respuesta
      let productsData = [];
      let totalPages = 0;
      let totalElements = 0;

      if (Array.isArray(response.data)) {
      
        productsData = response.data;
        totalElements = productsData.length;
        totalPages = Math.ceil(totalElements / PAGE_SIZE) || 0;
        console.log("Formato: Array directo (no paginado)");
      } else if (response.data.content) {
        // Si es un objeto con content (paginado)
        productsData = response.data.content;
        totalPages = response.data.totalPages || 0;
        totalElements = response.data.totalElements || 0;
        console.log("Formato: Objeto con content");
      }
      
      console.log("Productos antes de filtrar:", productsData);
      
      // Filtrado adicional en frontend si es necesario (o si el backend no aplica algunos filtros)
      if (hasFilters) {
        const normalize = (v) => (v === null || v === undefined ? "" : v);
        const search = (product, term) => {
          if (!term) return true;
          const t = term.toString().toLowerCase();
          return (
            (product.nombre || "").toString().toLowerCase().includes(t) ||
            (product.descripcion || "").toString().toLowerCase().includes(t)
          );
        };

        productsData = productsData.filter((product) => {
          // Estado: si estamos viendo historial, dejamos ELIMINADO, sino solo ACTIVO/OCULTO
          if (showHistory) {
            if (product.estado !== "ELIMINADO") return false;
          } else {
            if (!(product.estado === "ACTIVO" || product.estado === "OCULTO")) return false;
          }

          if (apiFilters.tipo && product.tipo !== apiFilters.tipo) return false;

          if (apiFilters.idCategoria && Number(product.idCategoria) !== Number(apiFilters.idCategoria)) return false;

          if (apiFilters.disponibilidad !== undefined && apiFilters.disponibilidad !== null) {
            if (typeof apiFilters.disponibilidad === "boolean") {
              const isAvailable = (() => {
                if (typeof product.disponible === "boolean") return product.disponible;
                if (typeof product.cantidad === "number") return product.cantidad > 0;
                return true; // si no sabemos, no filtrar
              })();
              if (apiFilters.disponibilidad !== isAvailable) return false;
            }
          }

          if (apiFilters.searchTerm && !search(product, apiFilters.searchTerm)) return false;

          if (apiFilters.estado && product.estado !== apiFilters.estado) return false;

          return true;
        });

        // Calcular paginación local
        const total = productsData.length;
        const totalPg = Math.ceil(total / PAGE_SIZE) || 0;
        setTotalElements(total);
        setTotalPages(totalPg);

        // Slice para la página actual
        const start = currentPage * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const paged = productsData.slice(start, end);
        setProducts(paged);
        // Ya hemos asignado pagination y productos, salir de la función
        return;
      }


      if (!showHistory) {
        productsData = productsData.filter(
          (product) => product.estado === "ACTIVO" || product.estado === "OCULTO"
        );
      }

      console.log("Productos después de filtrar:", productsData);


  const recalculatedTotal = productsData.length;
  const recalculatedPages = Math.ceil(recalculatedTotal / PAGE_SIZE) || 0;


  const start = currentPage * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const paged = productsData.slice(start, end);

  setProducts(paged);
  setTotalPages(recalculatedPages);
  setTotalElements(recalculatedTotal);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("Error al cargar tus productos");
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros desde el componente MyProductsFilter
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
    // Llamamos a loadProducts con los filtros proporcionados para asegurar que se apliquen inmediatamente
    loadProducts(newFilters);
  };

  const loadTotalInterests = async () => {
    if (!userId) return;

    try {
      // Usar interestApi.getTotalInterests que retorna { vendedorId, totalIntereses }
      const response = await interestApi.getTotalInterests(userId);
      setTotalInterests(response.data?.totalIntereses ?? 0);
    } catch (err) {
      console.error("Error al cargar total de intereses:", err);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    try {
      await myProductsApi.deleteLogically(productToDelete.idProducto);
      // cerrar modal y recargar
      setConfirmOpen(false);
      setProductToDelete(null);
      await loadProducts(); // Recargar lista
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      alert("Error al eliminar el producto");
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setProductToDelete(null);
  };

  const handleAppeal = (product) => {
    // TODO: Implementar sistema de apelación
    alert(
      `Funcionalidad de apelación para "${product.nombre}" en desarrollo.\n\nEste producto está en estado: ${product.estado}`
    );
  };

  const handleSaveEdit = (updatedProduct) => {
    loadProducts(); // Recargar lista
    loadTotalInterests(); // Actualizar estadísticas
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset a primera página
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <Header />

      {/* Decorative background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative container mx-auto px-4 py-8">
        {/* Header de página con estadísticas */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-slate-50">
              {showHistory ? "Historial de Productos" : "Mis Productos"}
            </h1>
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                setCurrentPage(0);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-lg ${
                showHistory
                  ? "bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-500"
                  : "bg-slate-800/60 border border-slate-700 text-slate-100 hover:bg-slate-700/60"
              }`}
            >
              <History className="w-5 h-5" />
              {showHistory ? "Ver Productos" : "Ver Historial"}
            </button>
          </div>
          <p className="text-slate-400 mb-6">
            {showHistory 
              ? "Visualiza el historial completo de tus productos eliminados" 
              : "Gestiona tus productos y servicios publicados"}
          </p>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total productos */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300 pointer-events-none" />
              <div className="relative p-4 rounded-xl border border-slate-800/50 bg-slate-900/90 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Productos</p>
                    <p className="text-2xl font-bold text-slate-50">
                      {totalElements}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Total "Me Interesa" */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300 pointer-events-none" />
              <div className="relative p-4 rounded-xl border border-slate-800/50 bg-slate-900/90 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Interesados</p>
                    <p className="text-2xl font-bold text-slate-50">
                      {totalInterests}
                    </p>
                  </div>
                  <Heart className="w-8 h-8 text-red-400 fill-red-400" />
                </div>
              </div>
            </div>

            {/* Botón crear producto */}
            <button
              onClick={() => navigate("/create-product")}
              className="relative group p-4 rounded-xl border border-slate-800/50 bg-blue-600 hover:bg-blue-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-6 h-6 text-white" />
                <span className="text-white font-semibold">
                  Crear Producto
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Layout con filtros y productos */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de filtros */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <MyProductsFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onApplyFilters={handleApplyFilters}
              />
            </div>
          </div>

          {/* Grid de productos */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-400">Cargando productos...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={loadProducts}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium transition-all"
                >
                  Reintentar
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-slate-50 mb-2">
                  No tienes productos
                </h3>
                <p className="text-slate-400 mb-6">
                  Comienza creando tu primer producto o servicio
                </p>
                <button
                  onClick={() => navigate("/create-product")}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Crear Producto
                </button>
              </div>
            ) : (
              <>
                {showHistory ? (
                  // Vista de tabla para historial
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-2xl blur opacity-75 pointer-events-none" />
                    <div className="relative overflow-x-auto rounded-2xl border border-slate-800/50 bg-slate-900/90 backdrop-blur-xl">
                      <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
                          <tr>
                            <th scope="col" className="px-6 py-4">Producto</th>
                            <th scope="col" className="px-6 py-4">Tipo</th>
                            <th scope="col" className="px-6 py-4">Precio</th>
                            <th scope="col" className="px-6 py-4">Ubicación</th>
                            <th scope="col" className="px-6 py-4">Fecha Publicación</th>
                            <th scope="col" className="px-6 py-4">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products
                            .filter((product) => product.estado === "ELIMINADO")
                            .map((product) => (
                              <tr key={product.idProducto} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-xl overflow-hidden">
                                      {product.fotos?.[0] ? (
                                        <img
                                          src={productsApi.getImageUrl(product.fotos[0].url)}
                                          alt={product.nombre}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        "📦"
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-50">{product.nombre}</p>
                                      <p className="text-xs text-slate-500 line-clamp-1">{product.descripcion}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-1 rounded-lg bg-slate-800/60 text-xs">
                                    {product.tipo}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-semibold text-blue-400">
                                  ${product.precio?.toLocaleString("es-CO")}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="flex items-center gap-1 text-xs">
                                    📍 {product.ubicacion}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-400">
                                  {new Date(product.fechaPublicacion).toLocaleDateString("es-ES")}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-1 rounded-lg bg-gray-500/20 text-gray-400 text-xs border border-gray-500/30">
                                    Eliminado
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  // Vista de grid para productos activos
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <MyProductCard
                        key={product.idProducto}
                        product={product}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAppeal={handleAppeal}
                        onUpdate={loadProducts}
                      />
                    ))}
                  </div>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveEdit}
        />
      )}

      {/* Confirmación reutilizable para eliminar */}
      <ConfirmModal
        open={confirmOpen}
        title="Confirmar eliminación"
        description={
          productToDelete
            ? `¿Estás seguro de eliminar "${productToDelete.nombre}"?`
            : "¿Estás seguro?"
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
