import http from "./http";

/**
 * API para manejar reportes de productos (incidencias)
 */
export const reportsApi = {
  /**
   * Crear un reporte de producto
   * @param {Object} reportData - Datos del reporte
   * @param {number} reportData.idProducto - ID del producto a reportar
   * @param {number} reportData.idUsuarioReporta - ID del usuario que reporta
   * @param {string} reportData.motivo - Motivo del reporte (máx 255 caracteres)
   * @param {string} reportData.descripcion - Descripción del reporte (máx 1000 caracteres)
   * @returns {Promise} - Respuesta con datos del reporte creado
   */
  create: async (reportData) => {
    return await http.post("/api/incidencias", reportData);
  },

  /**
   * Crear un reporte usando query parameters (alternativa)
   * @param {number} idProducto - ID del producto
   * @param {number} idUsuarioReporta - ID del usuario
   * @param {string} motivo - Motivo del reporte
   * @param {string} descripcion - Descripción del reporte
   * @returns {Promise} - Respuesta con datos del reporte creado
   */
  createWithParams: async (idProducto, idUsuarioReporta, motivo, descripcion) => {
    const params = new URLSearchParams({
      idProducto: idProducto.toString(),
      idUsuarioReporta: idUsuarioReporta.toString(),
      motivo,
      descripcion
    });
    
    return await http.post(`/api/incidencias/deteccion?${params.toString()}`);
  },

  /**
   * Consultar una incidencia por ID
   * @param {number} incidenciaId - ID de la incidencia
   * @returns {Promise} - Datos de la incidencia
   */
  getById: async (incidenciaId) => {
    return await http.get(`/api/incidencias/${incidenciaId}`);
  },

  /**
   * Listar todas las incidencias
   * @returns {Promise} - Array de incidencias
   */
  getAll: async () => {
    return await http.get("/api/incidencias");
  },

  /**
   * Listar incidencias pendientes
   * @returns {Promise} - Array de incidencias pendientes
   */
  getPending: async () => {
    return await http.get("/api/incidencias/pendientes");
  },

  /**
   * Listar incidencias atendidas
   * @returns {Promise} - Array de incidencias atendidas
   */
  getAttended: async () => {
    return await http.get("/api/incidencias/atendidas");
  },

  /**
   * Listar incidencias descartadas
   * @returns {Promise} - Array de incidencias descartadas
   */
  getDiscarded: async () => {
    return await http.get("/api/incidencias/descartadas");
  },

  /**
   * Marcar una incidencia como atendida (solo moderadores)
   * @param {number} incidenciaId - ID de la incidencia
   * @returns {Promise} - Incidencia actualizada
   */
  markAsAttended: async (incidenciaId) => {
    return await http.put(`/api/incidencias/${incidenciaId}/atender`);
  },

  /**
   * Descartar una incidencia (solo moderadores)
   * @param {number} incidenciaId - ID de la incidencia
   * @returns {Promise} - Incidencia actualizada
   */
  discard: async (incidenciaId) => {
    return await http.put(`/api/incidencias/${incidenciaId}/descartar`);
  }
};

/**
 * API para manejar reportes de moderación
 */
export const moderationReportsApi = {
  /**
   * Crear reporte de moderación
   * @param {Object} reportData - Datos del reporte
   * @param {number} reportData.idIncidencia - ID de la incidencia
   * @param {number} reportData.idModerador - ID del moderador
   * @param {string} reportData.accionTomada - Acción tomada (máx 500 caracteres)
   * @param {string} reportData.comentario - Comentario opcional (máx 1000 caracteres)
   * @returns {Promise} - Respuesta con datos del reporte creado
   */
  create: async (reportData) => {
    return await http.post("/api/reportes", reportData);
  },

  /**
   * Listar todos los reportes de moderación
   * @returns {Promise} - Array de reportes
   */
  getAll: async () => {
    return await http.get("/api/reportes");
  },

  /**
   * Listar reportes por incidencia
   * @param {number} incidenciaId - ID de la incidencia
   * @returns {Promise} - Array de reportes
   */
  getByIncidencia: async (incidenciaId) => {
    return await http.get(`/api/reportes/incidencia/${incidenciaId}`);
  },

  /**
   * Listar reportes por moderador
   * @param {number} moderadorId - ID del moderador
   * @returns {Promise} - Array de reportes
   */
  getByModerador: async (moderadorId) => {
    return await http.get(`/api/reportes/moderador/${moderadorId}`);
  },

  /**
   * Eliminar un reporte
   * @param {number} reporteId - ID del reporte
   * @returns {Promise} - Respuesta 204 No Content
   */
  delete: async (reporteId) => {
    return await http.delete(`/api/reportes/${reporteId}`);
  }
};

/**
 * Motivos predefinidos para reportes
 */
export const REPORT_REASONS = [
  'Producto fraudulento',
  'Información falsa o engañosa',
  'Producto prohibido',
  'Precio sospechoso',
  'Imágenes inapropiadas',
  'Vendedor no confiable',
  'Producto duplicado',
  'Violación de términos de servicio',
  'Otro'
];

/**
 * Validaciones para formularios de reporte
 */
export const validateReportData = (data) => {
  const errors = {};

  if (!data.idProducto || typeof data.idProducto !== 'number') {
    errors.idProducto = 'ID del producto es requerido';
  }

  if (!data.idUsuarioReporta || typeof data.idUsuarioReporta !== 'number') {
    errors.idUsuarioReporta = 'ID del usuario es requerido';
  }

  if (!data.motivo || data.motivo.trim() === '') {
    errors.motivo = 'El motivo es requerido';
  } else if (data.motivo.length > 255) {
    errors.motivo = 'El motivo no puede exceder 255 caracteres';
  }

  if (!data.descripcion || data.descripcion.trim() === '') {
    errors.descripcion = 'La descripción es requerida';
  } else if (data.descripcion.length > 1000) {
    errors.descripcion = 'La descripción no puede exceder 1000 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};