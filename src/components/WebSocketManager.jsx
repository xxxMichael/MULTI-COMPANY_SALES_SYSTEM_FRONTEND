import { useEffect } from 'react';
import webSocketService from '../api/websocket';
import { getAuth } from '../state/auth';

// Mantiene una conexión WebSocket activa para recibir notificaciones en tiempo real
// aun cuando el usuario no esté dentro del módulo de chat.

export default function WebSocketManager() {
  const auth = getAuth();
  const userId = auth?.user?.idUsuario || auth?.user?.id;

  useEffect(() => {
    if (!userId) {
      if (webSocketService.isConnected()) {
        webSocketService.disconnect();
      }
      return;
    }

    const ensureConnection = async () => {
      try {
        await webSocketService.connect(userId);
      } catch (error) {
        console.error('Error al conectar WebSocket global:', error);
      }
    };

    ensureConnection();

    return () => {
      if (
        webSocketService.isConnected() &&
        webSocketService.getConnectedUserId() === userId
      ) {
        webSocketService.disconnect();
      }
    };
  }, [userId]);

  return null;
}
