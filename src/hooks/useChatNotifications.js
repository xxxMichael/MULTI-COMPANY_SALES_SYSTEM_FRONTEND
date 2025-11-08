import { useState, useEffect } from 'react';
import { chatApi } from '../api/chat';
import { getAuth } from '../state/auth';

export function useChatNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const auth = getAuth();

  const loadUnreadCount = async () => {
    const userId = auth?.user?.idUsuario || auth?.user?.id;
    if (!userId) return;

    try {
      const count = await chatApi.getUnreadMessagesCount(userId);
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error al cargar mensajes no leídos:', error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadUnreadCount();

    // Listener para nuevas notificaciones
    const handleChatNotification = () => {
      loadUnreadCount();
    };

    // Listener para mensajes leídos
    const handleMessagesRead = () => {
      loadUnreadCount();
    };

    window.addEventListener('chatNotification', handleChatNotification);
    window.addEventListener('messagesRead', handleMessagesRead);

    // Actualizar cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);

    return () => {
      window.removeEventListener('chatNotification', handleChatNotification);
      window.removeEventListener('messagesRead', handleMessagesRead);
      clearInterval(interval);
    };
  }, [auth?.user?.idUsuario, auth?.user?.id]);

  return {
    unreadCount,
    refresh: loadUnreadCount
  };
}