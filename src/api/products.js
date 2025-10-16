// API para productos
import http from "./http";
const CATEGORY_URL = "/api/categorias";
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

// Gestión de productos del usuario
export const myProductsApi = {
  // Subir múltiples fotos a un producto
  uploadMultiplePhotos: (productId, files) => {
    const formData = new FormData();
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }
    return http.post(`/api/photos/upload-multiple/${productId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  // Obtener productos del usuario con filtros
  getMyProducts: (vendedorId, params = {}) => {
    const {
      estado,
      tipo,
      searchTerm,
      disponibilidad,
      page = 0,
      size = 12,
      sort = "fechaPublicacion,desc",
    } = params;

    return http.get(`${BASE_URL}/vendedor/${vendedorId}`, {
      params: {
        estado,
        tipo,
        searchTerm,
        disponibilidad,
        page,
        size,
        sort,
      },
    });
  },

  // Actualizar producto
  update: (id, productData) => {
    return http.put(`${BASE_URL}/${id}`, productData);
  },


  // Actualizar producto con nuevas fotos
  updateWithPhotos: (id, productData, files) => {
    const formData = new FormData();
    formData.append("productData", JSON.stringify(productData));

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }

    return http.put(`${PHOTOS_URL}/upload-multiple/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Eliminar lógicamente un producto
  deleteLogically: (id) => {
    return http.patch(`${BASE_URL}/${id}/eliminar-logico`);
  },
  deletePhoto: (photoId) => {
    return http.delete(`${PHOTOS_URL}/${photoId}`);
  },
  // Crear producto sin fotos
  create: (productData) => {
    return http.post(`${BASE_URL}`, productData);
  },

  // Obtener estadísticas de "Me Interesa" del vendedor
  getTotalInterests: (vendedorId) => {
    return http.get(`${INTEREST_URL}/usuario/${vendedorId}/total`);
  },
};


export const interestApi = {
  //recibir intereses totales de un vendedor
  getTotalInterests: (vendedorId) => {
    return http.get(`${INTEREST_URL}/total-por-vendedor/${vendedorId}`);
  },
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
    const { page = 0, size = 12, sort = "fecha_interes,desc" } = params;
    return http.get(`${INTEREST_URL}/usuario/${usuarioId}`, {
      params: { page, size },
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
export const categoriesApi = {
  // Obtener todas las categorías
  getAll: () => {
    return http.get(`${CATEGORY_URL}`);
  }

}
