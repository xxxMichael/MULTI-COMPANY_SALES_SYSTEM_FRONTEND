import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '../../api/chat';

export default function ChatList({ 
  currentUserId, 
  selectedChatId, 
  onChatSelect, 
  refreshTrigger 
}) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState(new Map());

  // Función de carga de chats como callback para evitar recreaciones
  const loadChats = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      const chatsData = await chatApi.getChatsByUser(currentUserId);
      setChats(chatsData || []);
      
      // Obtener conteo de mensajes no leídos
      try {
        const unreadCount = await chatApi.getUnreadMessagesCount(currentUserId);
        // Actualizar contador total si es necesario
        console.log('Mensajes no leídos:', unreadCount);
      } catch (unreadError) {
        console.warn('Error al obtener mensajes no leídos:', unreadError);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar chats:', err);
      setError('Error al cargar los chats');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadChats();
  }, [loadChats, refreshTrigger]);

  // Efecto para escuchar notificaciones de chat en tiempo real
  useEffect(() => {
    const handleChatNotification = (event) => {
      const messageData = event.detail;
      console.log('ChatList - Notificación recibida:', messageData);
      
      // Recargar chats para mostrar el nuevo mensaje
      loadChats();
    };

    const handleMessagesRead = (event) => {
      const readData = event.detail;
      console.log('ChatList - Mensajes marcados como leídos:', readData);
      
      // Recargar chats para actualizar contadores
      loadChats();
    };

    // Agregar listeners para eventos de WebSocket
    window.addEventListener('chatNotification', handleChatNotification);
    window.addEventListener('messagesRead', handleMessagesRead);

    return () => {
      window.removeEventListener('chatNotification', handleChatNotification);
      window.removeEventListener('messagesRead', handleMessagesRead);
    };
  }, [loadChats]);

  const getOtherUser = (chat) => {
    if (!chat || !currentUserId) return null;
    
    return chat.idUsuario1 === currentUserId
      ? { id: chat.idUsuario2, nombre: chat.nombreUsuario2 }
      : { id: chat.idUsuario1, nombre: chat.nombreUsuario1 };
  };

  const getLastMessage = (chat) => {
    if (!chat.mensajes || chat.mensajes.length === 0) {
      return 'No hay mensajes';
    }
    
    const lastMessage = chat.mensajes[chat.mensajes.length - 1];
    return lastMessage.contenido.length > 50 
      ? lastMessage.contenido.substring(0, 50) + '...'
      : lastMessage.contenido;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        return date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit' 
        });
      }
    } catch (error) {
      return '';
    }
  };

  const getUnreadMessagesCount = (chat) => {
    if (!chat.mensajes) return 0;
    
    return chat.mensajes.filter(mensaje => 
      !mensaje.leido && mensaje.idEmisor !== currentUserId
    ).length;
  };

  if (loading) {
    return (
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex items-center justify-center">
        <div className="text-slate-400">Cargando chats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col items-center justify-center p-4">
        <div className="text-red-400 text-center mb-4">{error}</div>
        <button 
          onClick={loadChats}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 flex flex-col shadow-2xl h-full">
      {/* Header mejorado - ESTÁTICO */}
      <div className="p-5 border-b border-slate-800/50 bg-gradient-to-r from-slate-800/50 to-slate-800/30 sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
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
          </div>
          <h2 className="text-xl font-bold text-slate-50">Chats</h2>
        </div>
        
        {chats.length > 0 && (
          <div className="text-sm text-slate-400">
            {chats.length} conversación{chats.length !== 1 ? 'es' : ''}
          </div>
        )}
      </div>

      {/* Lista de chats - SOLO ESTA PARTE ES SCROLLEABLE */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {chats.length === 0 ? (
          <div className="flex items-center justify-center p-6 min-h-[400px]">
            <div className="text-center text-slate-400 max-w-sm">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-full blur-xl"></div>
                <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-full p-6 backdrop-blur-sm border border-slate-700/50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-slate-300 mb-2">No tienes chats aún</h3>
            </div>
          </div>
        ) : (
          chats.map((chat) => {
            const otherUser = getOtherUser(chat);
            const unreadCount = getUnreadMessagesCount(chat);
            const isSelected = chat.idChat === selectedChatId;
            const lastMessage = chat.mensajes && chat.mensajes.length > 0 
              ? chat.mensajes[chat.mensajes.length - 1] 
              : null;

            return (
              <div
                key={chat.idChat}
                onClick={() => onChatSelect(chat)}
                className={`group relative p-4 cursor-pointer transition-all duration-300 border-b border-slate-800/30 ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600/20 to-violet-600/20 border-l-4 border-l-blue-500 shadow-lg'
                    : 'hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-700/30 hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar mejorado */}
                  <div className="flex-shrink-0 relative">
                    <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                      isSelected ? 'ring-2 ring-blue-400/50 ring-offset-2 ring-offset-slate-900' : ''
                    }`}>
                      <span className="text-white font-semibold text-sm">
                        {otherUser?.nombre?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    
                    {/* Indicador de estado online */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                  </div>

                  {/* Información del chat */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-semibold truncate transition-colors ${
                        isSelected ? 'text-blue-300' : 'text-slate-50 group-hover:text-slate-100'
                      }`}>
                        {otherUser?.nombre || 'Usuario desconocido'}
                      </h4>
                      
                      {lastMessage && (
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-slate-500 font-medium">
                            {formatTime(lastMessage.fechaEnvio)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate transition-colors ${
                        isSelected ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-300'
                      }`}>
                        {getLastMessage(chat)}
                      </p>
                      
                      {unreadCount > 0 && (
                        <div className="relative">
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full ml-2 shadow-lg animate-pulse">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Indicador de selección */}
                {isSelected && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}