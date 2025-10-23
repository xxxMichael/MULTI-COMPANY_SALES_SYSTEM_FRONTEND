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
    <div className="flex-1 bg-slate-900/50 backdrop-blur-xl flex flex-col border-l border-slate-800/50">
      {/* Header del chat mejorado */}
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 p-5 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          {/* Avatar con estado */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-400/20">
              <span className="text-white font-bold text-sm">
                {otherUser?.nombre?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            {/* Indicador online */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-800 rounded-full animate-pulse"></div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-slate-50 mb-1">
              {otherUser?.nombre || 'Usuario desconocido'}
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-green-400 font-medium">En línea</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Botones de acción adicionales */}
          <button className="p-2.5 text-slate-400 hover:text-slate-50 hover:bg-slate-700/50 rounded-xl transition-all duration-300 hover:scale-110">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all duration-300 hover:scale-110 md:hidden"
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
      </div>

      {/* Área de mensajes mejorada */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent via-slate-900/20 to-transparent"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.03) 0%, transparent 50%)
          `
        }}
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400 max-w-md">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-full blur-xl"></div>
                <div className="relative bg-gradient-to-br from-slate-800/30 to-slate-700/20 rounded-full p-8 backdrop-blur-sm border border-slate-700/30">
                  <svg className="w-16 h-16 mx-auto text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-slate-300 mb-2">¡Inicia la conversación!</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                No hay mensajes en esta conversación aún. ¡Envía el primer mensaje para romper el hielo!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.idEmisor === currentUserId;
            const showTime = index === 0 || 
              (index > 0 && new Date(message.fechaEnvio) - new Date(messages[index - 1].fechaEnvio) > 5 * 60 * 1000); // 5 minutos

            return (
              <div key={message.idMensaje} className="space-y-2">
                {showTime && (
                  <div className="flex justify-center py-3">
                    <div className="bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-700/50">
                      <span className="text-xs text-slate-400 font-medium">
                        {formatMessageTime(message.fechaEnvio)}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-xl ${
                    isOwn
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
                      : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-50 rounded-bl-md border border-slate-600/50'
                  }`}>
                    {/* Avatar para mensajes recibidos */}
                    {!isOwn && (
                      <div className="absolute -left-3 -top-1 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900">
                        <span className="text-white text-xs font-semibold">
                          {message.nombreEmisor?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-sm break-words leading-relaxed">{message.contenido}</p>
                    
                    <div className={`flex items-center justify-between mt-2 text-xs ${
                      isOwn ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      <span className="opacity-75">
                        {new Date(message.fechaEnvio).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      
                      {isOwn && (
                        <div className="flex items-center ml-2">
                          <span className={`transition-colors ${message.leido ? 'text-blue-200' : 'text-blue-300'}`}>
                            {message.leido ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                        </div>
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