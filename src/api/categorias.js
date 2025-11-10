import api from './http';

/**
 * Obtiene todas las categorías
 * @returns {Promise<Array>} Lista de categorías
 */
export const obtenerCategorias = async () => {
  const response = await api.get('/api/categorias');
  return response.data;
};

/**
 * Obtiene categorías activas solamente
 * @returns {Promise<Array>} Lista de categorías activas
 */
export const obtenerCategoriasActivas = async () => {
  const response = await api.get('/api/categorias/activas');
  return response.data;
};

/**
 * Obtiene una categoría por ID
 * @param {number} id - ID de la categoría
 * @returns {Promise<Object>} Categoría
 */
export const obtenerCategoriaPorId = async (id) => {
  const response = await api.get(`/api/categorias/${id}`);
  return response.data;
};

/**
 * Crea una nueva categoría
 * @param {Object} categoria - Datos de la categoría {nombre, descripcion}
 * @returns {Promise<Object>} Categoría creada
 */
export const crearCategoria = async (categoria) => {
  const response = await api.post('/api/categorias', categoria);
  return response.data;
};

/**
 * Actualiza una categoría existente
 * @param {number} id - ID de la categoría
 * @param {Object} categoria - Datos actualizados
 * @returns {Promise<Object>} Categoría actualizada
 */
export const actualizarCategoria = async (id, categoria) => {
  const response = await api.put(`/api/categorias/${id}`, categoria);
  return response.data;
};

/**
 * Elimina una categoría
 * @param {number} id - ID de la categoría
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const eliminarCategoria = async (id) => {
  const response = await api.delete(`/api/categorias/${id}`);
  return response.data;
};

/**
 * Activa o desactiva una categoría
 * @param {number} id - ID de la categoría
 * @returns {Promise<Object>} Categoría actualizada
 */
export const toggleActivoCategoria = async (id) => {
  const response = await api.patch(`/api/categorias/${id}/toggle-activo`);
  return response.data;
};

/**
 * Verifica si una categoría tiene productos asociados
 * @param {number} id - ID de la categoría
 * @returns {Promise<Object>} {tieneProductos: boolean, cantidadProductos: number}
 */
export const verificarProductosCategoria = async (id) => {
  const response = await api.get(`/api/categorias/${id}/tiene-productos`);
  return response.data;
};

/**
 * Busca categorías por nombre
 * @param {string} nombre - Texto a buscar
 * @returns {Promise<Array>} Lista de categorías encontradas
 */
export const buscarCategorias = async (nombre) => {
  const response = await api.get(`/api/categorias/buscar`, {
    params: { nombre }
  });
  return response.data;
};
