import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAuth } from '../state/auth';
import { chatApi } from '../api/chat';
import webSocketService from '../api/websocket';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import NewChatModal from '../components/chat/NewChatModal';

export default function ChatPage() {
  const auth = getAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedChat, setSelectedChat] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    console.log('Estado de autenticación:', auth);
    console.log('Usuario:', auth?.user);
    
    if (!auth?.user?.idUsuario && !auth?.user?.id) {
      console.error('Usuario no autenticado');
      return;
    }

    const userId = auth?.user?.idUsuario || auth?.user?.id;
    
    // Conectar WebSocket
    connectWebSocket();

    // Verificar si hay un chatId en la URL
    const chatId = searchParams.get('chatId');
    if (chatId) {
      loadSpecificChat(parseInt(chatId));
      // Limpiar el parámetro de la URL
      setSearchParams({});
    }

    // Cleanup al desmontar
    return () => {
      webSocketService.disconnect();
    };
  }, [auth?.user?.idUsuario, auth?.user?.id, searchParams]);

  useEffect(() => {
    // Listener para eventos de notificación de chat
    const handleChatNotification = (event) => {
      console.log('Notificación de chat recibida:', event.detail);
      // Refrescar la lista de chats para mostrar nuevos mensajes
      setRefreshTrigger(prev => prev + 1);
    };

    // Listener para confirmaciones de lectura
    const handleMessagesRead = (event) => {
      console.log('Mensajes marcados como leídos:', event.detail);
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('chatNotification', handleChatNotification);
    window.addEventListener('messagesRead', handleMessagesRead);

    return () => {
      window.removeEventListener('chatNotification', handleChatNotification);
      window.removeEventListener('messagesRead', handleMessagesRead);
    };
  }, []);

  const connectWebSocket = async () => {
    try {
      setConnectionStatus('connecting');
      
      webSocketService.setConnectionChangeHandler((connected) => {
        setConnectionStatus(connected ? 'connected' : 'disconnected');
      });

      const userId = auth.user.idUsuario || auth.user.id;
      await webSocketService.connect(userId);
      console.log('WebSocket conectado exitosamente');
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
      setConnectionStatus('error');
    }
  };

  const loadSpecificChat = async (chatId) => {
    try {
      const userId = auth.user.idUsuario || auth.user.id;
      // Cargar todos los chats del usuario para encontrar el específico
      const chats = await chatApi.getChatsByUser(userId);
      const specificChat = chats.find(chat => chat.idChat === chatId);
      
      if (specificChat) {
        setSelectedChat(specificChat);
        setIsMobileView(true);
      }
    } catch (error) {
      console.error('Error al cargar chat específico:', error);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setIsMobileView(true);
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const handleChatCreated = (newChat) => {
    setSelectedChat(newChat);
    setRefreshTrigger(prev => prev + 1);
    setIsMobileView(true);
  };

  const handleCloseMobileChat = () => {
    setIsMobileView(false);
    setSelectedChat(null);
  };

  if (!auth?.user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="text-lg mb-4">Necesitas iniciar sesión para acceder al chat</p>
          <a 
            href="/login" 
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Ir a login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Status de conexión */}
      {connectionStatus !== 'connected' && (
        <div className={`fixed top-0 left-0 right-0 z-50 p-2 text-center text-sm ${
          connectionStatus === 'connecting' 
            ? 'bg-yellow-600' 
            : connectionStatus === 'error'
            ? 'bg-red-600'
            : 'bg-slate-600'
        }`}>
          {connectionStatus === 'connecting' && 'Conectando al chat...'}
          {connectionStatus === 'error' && 'Error de conexión - Chat no disponible'}
          {connectionStatus === 'disconnected' && 'Desconectado del chat'}
        </div>
      )}

      <div className={`flex h-screen ${connectionStatus !== 'connected' ? 'pt-10' : ''}`}>
        {/* Lista de chats - oculta en mobile cuando hay chat seleccionado */}
        <div className={`${isMobileView && selectedChat ? 'hidden md:flex' : 'flex'}`}>
          <ChatList
            currentUserId={auth.user.idUsuario || auth.user.id}
            selectedChatId={selectedChat?.idChat}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Ventana de chat */}
        <div className={`flex-1 ${!selectedChat && !isMobileView ? 'hidden md:block' : ''}`}>
          <ChatWindow
            chat={selectedChat}
            currentUserId={auth.user.idUsuario || auth.user.id}
            onClose={handleCloseMobileChat}
          />
        </div>

        {/* Placeholder cuando no hay chat seleccionado en desktop */}
        {!selectedChat && (
          <div className="hidden md:flex flex-1 bg-slate-900 items-center justify-center">
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
              <p className="text-lg font-medium mb-2">Bienvenido al Chat</p>
              <p className="text-sm mb-4">Selecciona una conversación o inicia una nueva</p>
              <button
                onClick={handleNewChat}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Nuevo Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para nuevo chat */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        currentUserId={auth.user.idUsuario || auth.user.id}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
}