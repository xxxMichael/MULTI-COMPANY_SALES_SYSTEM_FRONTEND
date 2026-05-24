// src/components/ui/MyProductsFilter.jsx
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { categoriesApi } from "../../api/products";

export default function MyProductsFilter({ filters, onFilterChange, onApplyFilters }) {
  const [categories, setCategories] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };
    fetchCategories();
  }, []);
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (name, value) => {
    const updated = { ...localFilters, [name]: value };
    setLocalFilters(updated);
    if (onFilterChange) onFilterChange(updated);
  };

  return (
    <div className="relative group mb-6">
      {/* Decorative border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 pointer-events-none" />
      
      <div className="relative rounded-2xl border border-slate-800/50 bg-slate-900/90 backdrop-blur-xl shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-50 mb-4">Filtros</h3>
        
        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={localFilters?.searchTerm || ""}
              onChange={(e) => handleChange("searchTerm", e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Estado
            </label>
            <select
              value={localFilters?.estado || ""}
              onChange={(e) => handleChange("estado", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            >
              <option value="">Todos</option>
              <option value="ACTIVO">Activo</option>
              <option value="OCULTO">Oculto</option>
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipo
            </label>
            <select
              value={localFilters?.tipo || ""}
              onChange={(e) => handleChange("tipo", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            >
              <option value="">Todos</option>
              <option value="PRODUCTO">Producto</option>
              <option value="SERVICIO">Servicio</option>

            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Categoría</label>
            <select
              value={localFilters?.idCategoria || ""}
              onChange={(e) => handleChange("idCategoria", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          {/* Disponibilidad */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Disponibilidad
            </label>
            <select
              value={typeof localFilters?.disponibilidad === 'boolean' ? String(localFilters.disponibilidad) : ""}
              onChange={(e) => {
                const value = e.target.value;
                handleChange(
                  "disponibilidad",
                  value === "" ? null : value === "true"
                );
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            >
              <option value="">Todos</option>
              <option value="true">Disponible</option>
              <option value="false">No disponible</option>
            </select>
          </div>

          {/* Botón limpiar filtros */}
          <button
            onClick={() => {
              const cleared = {
                searchTerm: "",
                estado: "",
                tipo: "",
                idCategoria: "",
                disponibilidad: null,
              };
              setLocalFilters(cleared);
              if (onFilterChange) onFilterChange(cleared);
              if (onApplyFilters) onApplyFilters(cleared);
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-medium transition-all"
          >
            Limpiar Filtros
          </button>

          {/* Botón aplicar filtros
          <button
            onClick={() => {
              if (onApplyFilters) onApplyFilters(localFilters);
            }}
            className="w-full mt-2 px-4 py-3 rounded-xl border border-transparent bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all"
          >
            Aplicar Filtros
            
          </button>
           */}
        </div>
      </div>
    </div>
  );
}
