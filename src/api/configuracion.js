import api from './http';

/**
 * API para gestionar las palabras prohibidas del sistema
 */

/**
 * Obtiene la lista completa de palabras prohibidas
 * @returns {Promise<Object>} Respuesta con { palabras: string[], mensaje: string }
 */
export const obtenerPalabrasProhibidas = async () => {
  try {
    const response = await api.get('/api/configuracion/palabras-prohibidas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener palabras prohibidas:', error);
    throw error;
  }
};

/**
 * Agrega una nueva palabra al filtro de palabras prohibidas
 * @param {string} palabra - Palabra a agregar
 * @returns {Promise<Object>} Respuesta con { palabras: string[], mensaje: string }
 */
export const agregarPalabraProhibida = async (palabra) => {
  try {
    const response = await api.post('/api/configuracion/palabras-prohibidas', { palabra });
    return response.data;
  } catch (error) {
    console.error('Error al agregar palabra prohibida:', error);
    throw error;
  }
};

/**
 * Elimina una palabra del filtro de palabras prohibidas
 * @param {string} palabra - Palabra a eliminar
 * @returns {Promise<Object>} Respuesta con { palabras: string[], mensaje: string }
 */
export const eliminarPalabraProhibida = async (palabra) => {
  try {
    const response = await api.delete('/api/configuracion/palabras-prohibidas', {
      data: { palabra }
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar palabra prohibida:', error);
    throw error;
  }
};

/**
 * Obtiene los días de expiración configurados
 * @returns {Promise<Object>} Respuesta con { dias: number, mensaje: string }
 */
export const obtenerDiasExpiracion = async () => {
  try {
    const response = await api.get('/api/configuracion/dias-expiracion');
    return response.data;
  } catch (error) {
    console.error('Error al obtener días de expiración:', error);
    throw error;
  }
};

/**
 * Actualiza los días de expiración de productos
 * @param {number} dias - Cantidad de días
 * @returns {Promise<Object>} Respuesta con { dias: number, mensaje: string }
 */
export const actualizarDiasExpiracion = async (dias) => {
  try {
    const response = await api.put('/api/configuracion/dias-expiracion', { dias });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar días de expiración:', error);
    throw error;
  }
};
