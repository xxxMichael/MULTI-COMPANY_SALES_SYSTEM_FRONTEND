import http from "./http";

// API REST para Chat
export const chatApi = {
  // Obtener todos los chats de un usuario
  getChatsByUser: async (userId) => {
    const response = await http.get(`/api/chat/usuario/${userId}`);
    return response.data;
  },

  // Crear o obtener un chat entre dos usuarios
  createOrGetChat: async (userId1, userId2) => {
    const response = await http.get(`/api/chat/${userId1}/${userId2}`);
    return response.data;
  },

  // Obtener mensajes de un chat
  getMessagesByChat: async (chatId) => {
    const response = await http.get(`/api/chat/${chatId}/mensajes`);
    return response.data;
  },

  // Contar mensajes no leídos de un usuario
  getUnreadMessagesCount: async (userId) => {
    const response = await http.get(`/api/chat/usuario/${userId}/mensajes-no-leidos`);
    return response.data;
  },

  // Marcar mensajes como leídos
  markMessagesAsRead: async (chatId, userId) => {
    const response = await http.put(`/api/chat/${chatId}/marcar-leido?usuarioId=${userId}`);
    return response.data;
  }
};