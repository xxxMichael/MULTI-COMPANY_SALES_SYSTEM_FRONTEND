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
    <div className="w-80 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 flex flex-col shadow-2xl">
      {/* Header mejorado */}
      <div className="p-5 border-b border-slate-800/50 bg-gradient-to-r from-slate-800/50 to-slate-800/30">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
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
          
          <button
            onClick={onNewChat}
            className="group p-2.5 text-slate-400 hover:text-white hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-violet-500/20 rounded-xl transition-all duration-300 hover:scale-110 border border-transparent hover:border-blue-500/20 backdrop-blur-sm"
            title="Nuevo chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300"
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
        
        {chats.length > 0 && (
          <div className="text-sm text-slate-400">
            {chats.length} conversación{chats.length !== 1 ? 'es' : ''}
          </div>
        )}
      </div>

      {/* Lista de chats */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
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
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                Inicia una conversación desde el marketplace o crea un nuevo chat
              </p>
              
              <button
                onClick={onNewChat}
                className="px-4 py-2 bg-gradient-to-r from-blue-600/80 to-violet-600/80 hover:from-blue-500 hover:to-violet-500 text-white text-sm rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Iniciar conversación
              </button>
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