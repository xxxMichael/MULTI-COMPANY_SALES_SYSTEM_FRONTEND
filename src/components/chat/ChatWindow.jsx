import { useState, useEffect, useRef } from 'react';
import webSocketService from '../../api/websocket';
import { chatApi } from '../../api/chat';
import MessageInput from './MessageInput';

export default function ChatWindow({ 
  chat, 
  currentUserId, 
  onClose 
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chat) {
      loadMessages();
      subscribeToChat();
      markMessagesAsRead();
    }

    return () => {
      if (chat) {
        webSocketService.unsubscribeFromChat(chat.idChat);
      }
    };
  }, [chat?.idChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messagesData = await chatApi.getMessagesByChat(chat.idChat);
      setMessages(messagesData || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
      setError('Error al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChat = () => {
    try {
      webSocketService.subscribeToChat(chat.idChat, (newMessage) => {
        setMessages(prev => {
          // Verificar si el mensaje ya existe para evitar duplicados
          const exists = prev.some(msg => msg.idMensaje === newMessage.idMensaje);
          if (exists) return prev;
          
          return [...prev, newMessage];
        });

        // Si el mensaje no es del usuario actual, marcarlo como leído automáticamente
        if (newMessage.idEmisor !== currentUserId) {
          setTimeout(() => {
            markMessagesAsRead();
          }, 1000);
        }
      });
    } catch (err) {
      console.error('Error al suscribirse al chat:', err);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await chatApi.markMessagesAsRead(chat.idChat, currentUserId);
      webSocketService.markMessagesAsRead(chat.idChat, currentUserId);
    } catch (err) {
      console.error('Error al marcar mensajes como leídos:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (contenido) => {
    try {
      // Enviar mensaje via WebSocket
      webSocketService.sendMessage(chat.idChat, currentUserId, contenido);
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      // Aquí podrías mostrar una notificación de error al usuario
    }
  };

  const getOtherUser = () => {
    if (!chat || !currentUserId) return null;
    
    return chat.idUsuario1 === currentUserId
      ? { id: chat.idUsuario2, nombre: chat.nombreUsuario2 }
      : { id: chat.idUsuario1, nombre: chat.nombreUsuario1 };
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) {
        return date.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else if (diffInDays === 1) {
        return 'Ayer ' + date.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        return date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit',
          year: '2-digit'
        }) + ' ' + date.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
    } catch (error) {
      return '';
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 bg-slate-900 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto mb-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-lg font-medium">Selecciona un chat</p>
          <p className="text-sm">Elige una conversación para comenzar a chatear</p>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="flex-1 bg-slate-900 flex flex-col">
      {/* Header del chat */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {otherUser?.nombre?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-50">
              {otherUser?.nombre || 'Usuario desconocido'}
            </h3>
            <p className="text-sm text-slate-400">En línea</p>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-50 hover:bg-slate-700 rounded-lg transition-colors md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Área de mensajes */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-slate-400">Cargando mensajes...</div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 p-4">
            <p>{error}</p>
            <button 
              onClick={loadMessages}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              Reintentar
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-400 p-8">
            <p>No hay mensajes en esta conversación</p>
            <p className="text-sm mt-2">¡Envía el primer mensaje!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.idEmisor === currentUserId;
            const showTime = index === 0 || 
              (index > 0 && new Date(message.fechaEnvio) - new Date(messages[index - 1].fechaEnvio) > 5 * 60 * 1000); // 5 minutos

            return (
              <div key={message.idMensaje} className="space-y-1">
                {showTime && (
                  <div className="text-center text-xs text-slate-500 py-2">
                    {formatMessageTime(message.fechaEnvio)}
                  </div>
                )}
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-50'
                  }`}>
                    <p className="text-sm break-words">{message.contenido}</p>
                    <div className={`text-xs mt-1 ${
                      isOwn ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      <span>{formatMessageTime(message.fechaEnvio)}</span>
                      {isOwn && (
                        <span className="ml-2">
                          {message.leido ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <MessageInput 
        onSendMessage={handleSendMessage}
        disabled={loading || !!error}
      />
    </div>
  );
}