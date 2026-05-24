import http from "./http";

export const valoracionesApi = {
  // Crear una valoración
  crearValoracion: async (valoracionData) => {
    const response = await http.post('/api/valoraciones', valoracionData);
    return response.data;
  },

  // Obtener valoraciones de un vendedor
  obtenerValoracionesVendedor: async (vendedorId) => {
    const response = await http.get(`/api/valoraciones/vendedor/${vendedorId}`);
    return response.data;
  },

  // Obtener estadísticas de un vendedor
  obtenerEstadisticasVendedor: async (vendedorId) => {
    const response = await http.get(`/api/valoraciones/vendedor/${vendedorId}/estadisticas`);
    return response.data;
  },

  // Verificar si ya se valoró a un vendedor
  verificarSiYaValorado: async (vendedorId) => {
    const response = await http.get(`/api/valoraciones/verificar/${vendedorId}`);
    return response.data;
  },

  // Obtener mis valoraciones
  obtenerMisValoraciones: async () => {
    const response = await http.get('/api/valoraciones/mis-valoraciones');
    return response.data;
  },

  // Obtener últimas valoraciones de un vendedor
  obtenerUltimasValoraciones: async (vendedorId, limit = 5) => {
    const response = await http.get(`/api/valoraciones/vendedor/${vendedorId}/ultimas?limit=${limit}`);
    return response.data;
  }
};
