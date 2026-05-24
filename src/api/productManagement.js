import http from "./http";

export const productManagementApi = {
  changeState: async ({ productoId, nuevoEstado, motivo, usuarioId }) => {
    const payload = { productoId, nuevoEstado, motivo };
    if (usuarioId) {
      payload.usuarioId = usuarioId;
    }
    return http.put("/api/productos/gestion/estado/cambiar", payload);
  },
  createAppeal: async ({ productoId, vendedorId, justificacion, comentarios }) => {
    return http.post("/api/productos/gestion/apelacion/crear", {
      productoId,
      vendedorId,
      justificacion,
      comentarios,
    });
  },
  approveAppeal: async (productoId, motivo) => {
    const config = {};
    if (motivo && motivo.trim()) {
      config.params = { motivo };
    }
    return http.post(`/api/productos/gestion/apelacion/aprobar/${productoId}`, null, config);
  },
  rejectAppeal: async (productoId, motivo) => {
    const config = {};
    if (motivo && motivo.trim()) {
      config.params = { motivo };
    }
    return http.post(`/api/productos/gestion/apelacion/rechazar/${productoId}`, null, config);
  },
};
