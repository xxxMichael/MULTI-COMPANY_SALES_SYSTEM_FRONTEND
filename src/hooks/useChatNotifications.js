import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '../api/chat';
import { getAuth } from '../state/auth';

export function useChatNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const auth = getAuth();

  const loadUnreadCount = useCallback(async () => {
    const userId = auth?.user?.idUsuario || auth?.user?.id;
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await chatApi.getUnreadMessagesCount(userId);
      const finalCount = count || 0;
      setUnreadCount(finalCount);
      console.log('Hook - Mensajes no leídos cargados:', finalCount);
    } catch (error) {
      console.error('Error al cargar mensajes no leídos:', error);
      setUnreadCount(0);
    }
  }, [auth?.user?.idUsuario, auth?.user?.id]);

  useEffect(() => {
    loadUnreadCount();

    // Listener para nuevas notificaciones
    const handleChatNotification = (event) => {
      console.log('Hook - Nueva notificación de chat:', event.detail);
      // Recargar contador inmediatamente
      loadUnreadCount();
    };

    // Listener para mensajes leídos
    const handleMessagesRead = (event) => {
      console.log('Hook - Mensajes marcados como leídos:', event.detail);
      // Recargar contador inmediatamente
      loadUnreadCount();
    };

    window.addEventListener('chatNotification', handleChatNotification);
    window.addEventListener('messagesRead', handleMessagesRead);

    // Actualizar cada 60 segundos como respaldo
    const interval = setInterval(loadUnreadCount, 60000);

    return () => {
      window.removeEventListener('chatNotification', handleChatNotification);
      window.removeEventListener('messagesRead', handleMessagesRead);
      clearInterval(interval);
    };
  }, [loadUnreadCount]);

  return {
    unreadCount,
    refresh: loadUnreadCount
  };
}