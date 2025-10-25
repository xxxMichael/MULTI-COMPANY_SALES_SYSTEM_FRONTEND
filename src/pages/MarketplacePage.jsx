// Página principal del marketplace
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productsApi, interestApi, categoriesApi } from "../api/products";
import { getAuth } from "../state/auth";
import Header from "../components/ui/Header";
import ProductCard from "../components/ui/ProductCard";
import ProductDetailModal from "../components/ui/ProductDetailModal";
import FilterSidebar from "../components/ui/FilterSidebar";
import Pagination from "../components/ui/Pagination";
import { Heart } from "lucide-react";

export default function MarketplacePage() {
  const navigate = useNavigate();
  const auth = getAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Tamaño de página (productos por página)
  const [pageSize, setPageSize] = useState(32);

  // Categorías (se cargan desde MarketplacePage y se pasan al FilterSidebar)
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    searchTerm: "",
    tipo: "",
    idCategoria: "",
    ubicacion: "",
    minPrice: 0,
    maxPrice: 10000,
    disponibilidad: null,
  });

  // Ordenamiento
  const [sortBy, setSortBy] = useState("fechaPublicacion,desc");

  // Modal
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Sidebar móvil
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filtro "Productos que me interesan"
  const [showInterests, setShowInterests] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [currentPage, sortBy, filters, showInterests, pageSize]);

  // Cargar categorías una sola vez
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      let response;

      // Si está activo el filtro "Productos que me interesan"
      if (showInterests) {
        if (!auth?.user?.id) {
          navigate("/login");
          return;
        }
        response = await interestApi.getUserInterests(auth.user.id, {
          page: currentPage,
          size: pageSize,
          sort: sortBy,
        });

        // Los productos de intereses vienen con fotos: null, necesitamos cargar los detalles completos
        const productsWithDetails = await Promise.all(
          (response.data.content || []).map(async (product) => {
            try {
              const detailResponse = await productsApi.getById(product.idProducto);
              return detailResponse.data;
            } catch (err) {
              console.error(`Error loading details for product ${product.idProducto}:`, err);
              return product; // Si falla, usar el producto sin detalles
            }
          })
        );

        // Filtrar solo productos ACTIVOS
        const filteredProducts = productsWithDetails.filter(
          (product) => product.estado === "ACTIVO"
        );
        
        setProducts(filteredProducts);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } else {
      const hasFilters =
        filters.searchTerm ||
        filters.tipo ||
        filters.idCategoria ||
        filters.ubicacion ||
        filters.minPrice > 0 ||
        filters.maxPrice < 10000 ||
        filters.disponibilidad !== null;

      // Preparar filtros para la API: convertir idCategoria a número si existe
      const apiFilters = { ...filters };
      if (apiFilters.idCategoria && apiFilters.idCategoria !== "") {
        apiFilters.idCategoria = Number(apiFilters.idCategoria);
      } else {
        delete apiFilters.idCategoria;
      }

      // Eliminar filtros vacíos (""), manteniendo disponibilidad si es null
      Object.keys(apiFilters).forEach((k) => {
        if (apiFilters[k] === "") delete apiFilters[k];
      });

      if (hasFilters) {
        // Cuando hay filtros, pedimos muchos resultados y filtramos en el frontend
        response = await productsApi.filter({
          ...apiFilters,
          page: 0,
          size: 1000,
          sort: sortBy,
        });

        // Manejo flexible de respuesta
        const productsData = response.data.content || [];

        // Aplicar filtrado adicional en frontend (misma lógica que MyProductsPage)
        const normalize = (v) => (v === null || v === undefined ? "" : v);
        const search = (product, term) => {
          if (!term) return true;
          const t = term.toString().toLowerCase();
          return (
            (product.nombre || "").toString().toLowerCase().includes(t) ||
            (product.descripcion || "").toString().toLowerCase().includes(t)
          );
        };

        let filtered = productsData.filter((product) => {
          if (product.estado !== "ACTIVO") return false;

          if (apiFilters.tipo && product.tipo !== apiFilters.tipo) return false;

          if (apiFilters.idCategoria && Number(product.idCategoria) !== Number(apiFilters.idCategoria)) return false;

          if (apiFilters.disponibilidad !== undefined && apiFilters.disponibilidad !== null) {
            if (typeof apiFilters.disponibilidad === "boolean") {
              const isAvailable = (() => {
                if (typeof product.disponible === "boolean") return product.disponible;
                if (typeof product.cantidad === "number") return product.cantidad > 0;
                return true;
              })();
              if (apiFilters.disponibilidad !== isAvailable) return false;
            }
          }

          if (apiFilters.searchTerm && !search(product, apiFilters.searchTerm)) return false;

          if (apiFilters.ubicacion && !product.ubicacion?.toLowerCase()?.includes(apiFilters.ubicacion.toLowerCase())) return false;

          return true;
        });

        // Paginación local
        const total = filtered.length;
        const totalPg = Math.ceil(total / pageSize) || 0;
        setTotalElements(total);
        setTotalPages(totalPg);

        const start = currentPage * pageSize;
        const end = start + pageSize;
        const paged = filtered.slice(start, end);
        setProducts(paged);
      } else {
        // Sin filtros: petición paginada normal
        response = await productsApi.getAll({
          page: currentPage,
          size: pageSize,
          sort: sortBy,
        });

        const filteredProducts = (response.data.content || []).filter(
          (product) => product.estado === "ACTIVO"
        );
        setProducts(filteredProducts);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      }
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Error al cargar los productos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
  setFilters(newFilters);
  setCurrentPage(0);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
    loadProducts();
    setShowMobileFilters(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(0);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header reutilizable */}
      <Header />

      {/* Contenido principal */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtros - Desktop */}
          <aside className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onApplyFilters={handleApplyFilters}
              categories={categories}
            />
          </aside>

          {/* Productos */}
          <main className="lg:col-span-3">
            {/* Header de resultados */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-50">
                  {showInterests ? "Productos que me interesan" : "Productos Disponibles"}
                </h2>
              {/*<p className="text-slate-400 text-sm mt-1">
                  {totalElements} productos encontrados
                </p>*/}  
                
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                {/* Botón "Productos que me interesan" */}
                {auth?.user?.id && (
                  <button
                    onClick={() => {
                      setShowInterests(!showInterests);
                      setCurrentPage(0);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-lg ${
                      showInterests
                        ? "bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-500 hover:to-pink-500"
                        : "bg-slate-800/60 border border-slate-700 text-slate-100 hover:bg-slate-700/60"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${showInterests ? "fill-white" : ""}`} />
                    Me interesan
                  </button>
                )}

                {/* Botón filtros móvil */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:from-blue-500 hover:to-violet-500 transition-colors shadow-lg"
                >
                  Filtros
                </button>

                {/* Ordenamiento */}
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-800/60 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                >
                  <option value="fechaPublicacion,desc">Más recientes</option>
                  <option value="fechaPublicacion,asc">Más antiguos</option>
                  <option value="precio,asc">Menor precio</option>
                  <option value="precio,desc">Mayor precio</option>
                  <option value="nombre,asc">A-Z</option>
                  <option value="nombre,desc">Z-A</option>
                </select>

                {/* pageSize por defecto = 32 (sin selector) */}
              </div>
            </div>

            {/* Grid de productos */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={loadProducts}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-lg transition-colors shadow-lg"
                >
                  Reintentar
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-slate-500 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-slate-50 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-slate-400">
                  Intenta ajustar los filtros o realiza una búsqueda diferente
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.idProducto}
                      product={product}
                      onProductClick={handleProductClick}
                    />
                  ))}
                </div>

                {/* Paginación */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Filtros móvil */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/70 z-50 lg:hidden backdrop-blur-sm">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900 overflow-y-auto border-l border-slate-800">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-50">Filtros</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar
                filters={filters}
                  onFilterChange={handleFilterChange}
                  onApplyFilters={handleApplyFilters}
                  categories={categories}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
