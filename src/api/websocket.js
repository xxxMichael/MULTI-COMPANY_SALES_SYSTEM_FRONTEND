import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.onConnectionChange = null;
    this.userId = null;
    this.connectPromise = null;
  }

  connect(userId) {
    if (this.connected && this.userId === userId) {
      if (this.onConnectionChange) {
        this.onConnectionChange(true);
      }
      return Promise.resolve({ reused: true });
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = new Promise((resolve, reject) => {
      try {
        // Crear conexión SockJS
        const socket = new SockJS(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/ws-chat`
        );

        // Crear cliente STOMP
        this.client = Stomp.over(socket);

        // Deshabilitar debug en producción
        this.client.debug = (str) => {
          if (import.meta.env.DEV) {
            console.log('STOMP: ' + str);
          }
        };

        // Configurar callbacks de conexión
        this.client.connect(
          {}, // headers (puede incluir auth si es necesario)
          (frame) => {
            console.log('WebSocket conectado:', frame);
            this.connected = true;
            this.userId = userId;

            if (this.onConnectionChange) {
              this.onConnectionChange(true);
            }

            // Suscribirse a notificaciones personales del usuario
            this.subscribeToUserNotifications(userId);

            resolve(frame);
          },
          (error) => {
            console.error('Error de conexión WebSocket:', error);
            this.connected = false;

            if (this.onConnectionChange) {
              this.onConnectionChange(false);
            }

            reject(error);
          }
        );
      } catch (error) {
        console.error('Error al crear conexión WebSocket:', error);
        reject(error);
      }
    }).finally(() => {
      this.connectPromise = null;
    });

    return this.connectPromise;
  }

  disconnect() {
    if (this.client && this.connected) {
      // Cancelar todas las suscripciones
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.messageHandlers.clear();
      
      this.client.disconnect(() => {
        console.log('WebSocket desconectado');
        this.connected = false;
        this.userId = null;
        this.connectPromise = null;
        if (this.onConnectionChange) {
          this.onConnectionChange(false);
        }
      });
    }
  }

  // Suscribirse a un chat específico
  subscribeToChat(chatId, onMessageReceived) {
    if (!this.client || !this.connected) {
      throw new Error('WebSocket no está conectado');
    }

    const destination = `/topic/chat.${chatId}`;
    
    // Si ya existe una suscripción para este chat, cancelarla
    if (this.subscriptions.has(destination)) {
      this.subscriptions.get(destination).unsubscribe();
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const messageData = JSON.parse(message.body);
        console.log('Mensaje recibido en chat', chatId, ':', messageData);
        
        if (onMessageReceived) {
          onMessageReceived(messageData);
        }
      } catch (error) {
        console.error('Error al procesar mensaje recibido:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    this.messageHandlers.set(chatId, onMessageReceived);
    
    return subscription;
  }

  // Suscribirse a notificaciones personales del usuario
  subscribeToUserNotifications(userId) {
    if (!this.client || !this.connected) {
      throw new Error('WebSocket no está conectado');
    }

    const queueDestination = `/queue/chat.${userId}`;
    const readDestination = `/queue/mensajes-leidos.${userId}`;

  // Suscripción para mensajes personales
    const queueSubscription = this.client.subscribe(queueDestination, (message) => {
      try {
        const messageData = JSON.parse(message.body);
        console.log('Notificación personal recibida:', messageData);
        
        // Emitir evento personalizado para notificaciones
        window.dispatchEvent(new CustomEvent('chatNotification', {
          detail: messageData
        }));
        
        // Log adicional para debugging
        console.log('Evento chatNotification emitido:', messageData);
      } catch (error) {
        console.error('Error al procesar notificación personal:', error);
      }
    });

    // Suscripción para confirmaciones de lectura
    const readSubscription = this.client.subscribe(readDestination, (message) => {
      try {
        const readData = JSON.parse(message.body);
        console.log('Confirmación de lectura recibida:', readData);
        
        window.dispatchEvent(new CustomEvent('messagesRead', {
          detail: readData
        }));
        
        // Log adicional para debugging
        console.log('Evento messagesRead emitido:', readData);
      } catch (error) {
        console.error('Error al procesar confirmación de lectura:', error);
      }
    });

    this.subscriptions.set(queueDestination, queueSubscription);
    this.subscriptions.set(readDestination, readSubscription);
  }

  // Cancelar suscripción a un chat
  unsubscribeFromChat(chatId) {
    const destination = `/topic/chat.${chatId}`;
    
    if (this.subscriptions.has(destination)) {
      this.subscriptions.get(destination).unsubscribe();
      this.subscriptions.delete(destination);
      this.messageHandlers.delete(chatId);
    }
  }

  // Enviar mensaje
  sendMessage(chatId, emisorId, contenido) {
    if (!this.client || !this.connected) {
      throw new Error('WebSocket no está conectado');
    }

    const messageData = {
      idChat: chatId,
      idEmisor: emisorId,
      contenido: contenido
    };

    this.client.send('/app/chat.enviar', {}, JSON.stringify(messageData));
  }

  // Marcar mensajes como leídos
  markMessagesAsRead(chatId, userId) {
    if (!this.client || !this.connected) {
      throw new Error('WebSocket no está conectado');
    }

    const readData = {
      idChat: chatId,
      idUsuario: userId
    };

    this.client.send('/app/chat.marcar-leido', {}, JSON.stringify(readData));
  }

  // Verificar estado de conexión
  isConnected() {
    return this.connected;
  }

  getConnectedUserId() {
    return this.userId;
  }

  // Configurar callback para cambios de conexión
  setConnectionChangeHandler(handler) {
    this.onConnectionChange = handler;
  }
}

// Singleton para uso global
export const webSocketService = new WebSocketService();
export default webSocketService;