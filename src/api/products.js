// API para productos
import http from "./http";

const BASE_URL = "/api/products";
const PHOTOS_URL = "/api/photos";
const INTEREST_URL = "/api/productos/gestion/interes";

export const productsApi = {
  // Obtener todos los productos con paginación
  getAll: (params = {}) => {
    const { page = 0, size = 12, sort = "fechaPublicacion,desc" } = params;
    return http.get(`${BASE_URL}`, {
      params: { page, size, sort },
    });
  },

  // Obtener producto por ID
  getById: (id) => {
    return http.get(`${BASE_URL}/${id}`);
  },

  // Buscar productos por texto
  search: (searchTerm) => {
    return http.get(`${BASE_URL}/search`, {
      params: { searchTerm },
    });
  },

  // Filtrar productos con múltiples criterios
  filter: (params = {}) => {
    const {
      minPrice,
      maxPrice,
      tipo,
      searchTerm,
      ubicacion,
      disponibilidad,
      page = 0,
      size = 12,
      sort = "fechaPublicacion,desc",
    } = params;

    return http.get(`${BASE_URL}/filter`, {
      params: {
        minPrice,
        maxPrice,
        tipo,
        searchTerm,
        ubicacion,
        disponibilidad,
        page,
        size,
        sort,
      },
    });
  },

  // Obtener URL de imagen
  getImageUrl: (filename) => {
    if (!filename) return null;
    return `${http.defaults.baseURL}${PHOTOS_URL}/image/${filename}`;
  },

  // Crear producto con fotos
  createWithPhotos: (productData, files) => {
    const formData = new FormData();
    formData.append("productData", JSON.stringify(productData));

    files.forEach((file) => {
      formData.append("files", file);
    });

    return http.post(`${BASE_URL}/with-photos`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export const interestApi = {
  // Marcar producto como "Me Interesa"
  add: (usuarioId, productoId) => {
    return http.post(`${INTEREST_URL}/agregar`, {
      usuarioId,
      productoId,
    });
  },

  // Quitar "Me Interesa"
  remove: (usuarioId, productoId) => {
    return http.delete(`${INTEREST_URL}/quitar`, {
      data: {
        usuarioId,
        productoId,
      },
    });
  },

  // Verificar si está en "Me Interesa"
  exists: (usuarioId, productoId) => {
    return http.get(`${INTEREST_URL}/verificar`, {
      params: { usuarioId, productoId },
    });
  },

  // Obtener productos de "Me Interesa"
  getUserInterests: (usuarioId, params = {}) => {
    const { page = 0, size = 12, sort = "fechaAgregado,desc" } = params;
    return http.get(`${INTEREST_URL}/usuario/${usuarioId}`, {
      params: { page, size, sort },
    });
  },

  // Contar "Me Interesa" de un producto
  getCount: (productoId) => {
    return http.get(`${INTEREST_URL}/producto/${productoId}/count`);
  },

  // Obtener productos más populares
  getPopular: (params = {}) => {
    const { page = 0, size = 12 } = params;
    return http.get(`${INTEREST_URL}/populares`, {
      params: { page, size },
    });
  },
};
