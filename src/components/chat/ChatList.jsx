import { useState, useEffect } from 'react';
import { chatApi } from '../../api/chat';

export default function ChatList({ 
  currentUserId, 
  selectedChatId, 
  onChatSelect, 
  onNewChat, 
  refreshTrigger 
}) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState(new Map());

  useEffect(() => {
    loadChats();
  }, [currentUserId, refreshTrigger]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const chatsData = await chatApi.getChatsByUser(currentUserId);
      setChats(chatsData || []);
      
      // Obtener conteo de mensajes no leídos
      const unreadCount = await chatApi.getUnreadMessagesCount(currentUserId);
      // Esto podría necesitar ajuste dependiendo de la estructura de respuesta del backend
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar chats:', err);
      setError('Error al cargar los chats');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-50">Chats</h2>
        <button
          onClick={onNewChat}
          className="p-2 text-slate-400 hover:text-slate-50 hover:bg-slate-700 rounded-lg transition-colors"
          title="Nuevo chat"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* Lista de chats */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-slate-400">
            <div className="mb-4">
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
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p>No tienes chats aún</p>
            <button
              onClick={onNewChat}
              className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Iniciar una conversación
            </button>
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
                className={`p-4 cursor-pointer transition-colors border-b border-slate-700/50 ${
                  isSelected
                    ? 'bg-slate-700'
                    : 'hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {otherUser?.nombre?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  </div>

                  {/* Información del chat */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-slate-50 truncate">
                        {otherUser?.nombre || 'Usuario desconocido'}
                      </p>
                      {lastMessage && (
                        <span className="text-xs text-slate-400 ml-2">
                          {formatTime(lastMessage.fechaEnvio)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-slate-400 truncate">
                        {getLastMessage(chat)}
                      </p>
                      {unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full ml-2">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}