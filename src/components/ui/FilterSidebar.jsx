// Barra lateral de filtros
import { useState, useEffect, useRef } from "react";

export default function FilterSidebar({ filters, onFilterChange, onApplyFilters, categories = [] }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const debounceRef = useRef(null);
  const DEBOUNCE_MS = 450; // tiempo de espera antes de aplicar cambios de precio

  // Sincronizar cuando cambian los filtros desde el padre
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (e) => {
    const value = Number(e.target.value);
    // Actualizar localmente pero debounced para evitar llamadas continuas
    const updated = { ...localFilters, maxPrice: value };
    setLocalFilters(updated);

    // Debounce: limpiar anterior y crear uno nuevo
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (onFilterChange) onFilterChange(updated);
    }, DEBOUNCE_MS);
  };

  const clearFilters = () => {
    const cleared = {
      searchTerm: "",
      tipo: "",
      idCategoria: "",
      ubicacion: "",
      minPrice: 0,
      maxPrice: 10000,
      disponibilidad: null,
    };
    setLocalFilters(cleared);
    // cancelar debounce en curso
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (onFilterChange) onFilterChange(cleared);
    if (onApplyFilters) onApplyFilters(cleared);
  };

  return (
    <div className="sticky top-4 group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 pointer-events-none" />
      
      <div className="relative rounded-2xl border border-slate-800/50 bg-slate-900/90 backdrop-blur-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-50">Filtros</h2>
          <button
            onClick={clearFilters}
            className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            Limpiar
          </button>
        </div>

        {/* Búsqueda por texto */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Buscar
          </label>
          <input
            type="text"
            placeholder="Nombre o descripción..."
            value={localFilters.searchTerm}
            onChange={(e) => handleChange("searchTerm", e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Categoría/Tipo */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tipo de Producto
          </label>
          <select
            value={localFilters.tipo}
            onChange={(e) => handleChange("tipo", e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/60 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          >
            <option value="">Todos</option>
            <option value="PRODUCTO">Producto</option>
            <option value="SERVICIO">Servicio</option>
          </select>
        </div>

        {/* Categoría */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Categoría
          </label>
          <select
            value={localFilters.idCategoria || ""}
            onChange={(e) => handleChange("idCategoria", e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/60 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          >
            <option value="">Todas</option>
            {categories.map((cat) => (
              <option key={cat.idCategoria ?? cat.id} value={cat.idCategoria ?? cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Rango de precio */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Rango de Precio
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>${localFilters.minPrice}</span>
              <span>${localFilters.maxPrice}+</span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={localFilters.maxPrice}
              onChange={handlePriceChange}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400">Mínimo</label>
                <input
                  type="number"
                  min="0"
                  value={localFilters.minPrice}
                  onChange={(e) => handleChange("minPrice", Number(e.target.value))}
                  className="w-full px-3 py-1 text-sm bg-slate-800/60 border border-slate-700 text-slate-100 rounded focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Máximo</label>
                <input
                  type="number"
                  min="0"
                  value={localFilters.maxPrice}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    // Reuse debounce logic for numeric maxPrice as well
                    const updated = { ...localFilters, maxPrice: value };
                    setLocalFilters(updated);
                    if (debounceRef.current) clearTimeout(debounceRef.current);
                    debounceRef.current = setTimeout(() => {
                      if (onFilterChange) onFilterChange(updated);
                    }, DEBOUNCE_MS);
                  }}
                  className="w-full px-3 py-1 text-sm bg-slate-800/60 border border-slate-700 text-slate-100 rounded focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Ubicación
          </label>
          <input
            type="text"
            placeholder="Ciudad, Estado"
            value={localFilters.ubicacion}
            onChange={(e) => handleChange("ubicacion", e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Disponibilidad */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Disponibilidad
          </label>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="disponibilidad"
                checked={localFilters.disponibilidad === null}
                onChange={() => handleChange("disponibilidad", null)}
                className="w-4 h-4 text-violet-600 focus:ring-violet-500 bg-slate-800 border-slate-700"
              />
              <span className="ml-2 text-slate-300 group-hover:text-slate-100 transition-colors">Todos</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="disponibilidad"
                checked={localFilters.disponibilidad === true}
                onChange={() => handleChange("disponibilidad", true)}
                className="w-4 h-4 text-violet-600 focus:ring-violet-500 bg-slate-800 border-slate-700"
              />
              <span className="ml-2 text-slate-300 group-hover:text-slate-100 transition-colors">Disponible</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="disponibilidad"
                checked={localFilters.disponibilidad === false}
                onChange={() => handleChange("disponibilidad", false)}
                className="w-4 h-4 text-violet-600 focus:ring-violet-500 bg-slate-800 border-slate-700"
              />
              <span className="ml-2 text-slate-300 group-hover:text-slate-100 transition-colors">No disponible</span>
            </label>
          </div>
        </div>

        {/* Botón aplicar 
        <button
          onClick={() => onApplyFilters(localFilters)}
          className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-medium transition-all duration-300"
        >
          Aplicar Filtros
        </button>
        */}
      </div>
    </div>
  );
}
