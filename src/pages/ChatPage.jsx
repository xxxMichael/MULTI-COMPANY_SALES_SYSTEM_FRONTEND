import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAuth } from '../state/auth';
import { chatApi } from '../api/chat';
import webSocketService from '../api/websocket';
import Header from '../components/ui/Header';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';

export default function ChatPage() {
  const auth = getAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedChat, setSelectedChat] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isMobileView, setIsMobileView] = useState(false);

  // Función de conexión como callback
  const connectWebSocket = useCallback(async () => {
    const userId = auth?.user?.idUsuario || auth?.user?.id;
    if (!userId) return;

    try {
      setConnectionStatus('connecting');
      
      webSocketService.setConnectionChangeHandler((connected) => {
        setConnectionStatus(connected ? 'connected' : 'disconnected');
        console.log('Estado de conexión WebSocket:', connected ? 'conectado' : 'desconectado');
      });

      await webSocketService.connect(userId);
      console.log('WebSocket conectado exitosamente para usuario:', userId);
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
      setConnectionStatus('error');
    }
  }, [auth?.user?.idUsuario, auth?.user?.id]);

  useEffect(() => {
    console.log('Estado de autenticación:', auth);
    console.log('Usuario:', auth?.user);
    
    if (!auth?.user?.idUsuario && !auth?.user?.id) {
      console.error('Usuario no autenticado');
      return;
    }

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
      console.log('Desconectando WebSocket al desmontar ChatPage');
      webSocketService.disconnect();
    };
  }, [connectWebSocket, searchParams, setSearchParams]);

  // Efecto separado para manejar eventos de WebSocket
  useEffect(() => {
    // Función para refrescar la lista de chats
    const refreshChats = () => {
      console.log('Refrescando lista de chats...');
      setRefreshTrigger(prev => prev + 1);
    };

    // Listener para eventos de notificación de chat
    const handleChatNotification = (event) => {
      const messageData = event.detail;
      console.log('ChatPage - Notificación de chat recibida:', messageData);
      
      // Refrescar la lista de chats para mostrar nuevos mensajes
      refreshChats();
      
      // Si el mensaje es para el chat actual, no necesitamos hacer nada más
      // porque ChatWindow ya se encarga de actualizar los mensajes
    };

    // Listener para confirmaciones de lectura
    const handleMessagesRead = (event) => {
      const readData = event.detail;
      console.log('ChatPage - Mensajes marcados como leídos:', readData);
      
      // Refrescar la lista para actualizar contadores de mensajes no leídos
      refreshChats();
    };

    // Agregar listeners
    window.addEventListener('chatNotification', handleChatNotification);
    window.addEventListener('messagesRead', handleMessagesRead);

    return () => {
      window.removeEventListener('chatNotification', handleChatNotification);
      window.removeEventListener('messagesRead', handleMessagesRead);
    };
  }, []);

  const loadSpecificChat = useCallback(async (chatId) => {
    const userId = auth?.user?.idUsuario || auth?.user?.id;
    if (!userId) return;

    try {
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
  }, [auth?.user?.idUsuario, auth?.user?.id]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setIsMobileView(true);
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

  const handleCloseChat = () => {
    setSelectedChat(null);
    setIsMobileView(false);
  };

  if (!auth?.user) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <Header />
      
      {/* Status de conexión mejorado */}
      {connectionStatus !== 'connected' && (
        <div className={`fixed top-16 left-0 right-0 z-40 p-3 text-center text-sm font-medium shadow-lg backdrop-blur-sm ${
          connectionStatus === 'connecting' 
            ? 'bg-yellow-500/90 text-yellow-100 border-b border-yellow-400/20' 
            : connectionStatus === 'error'
            ? 'bg-red-500/90 text-red-100 border-b border-red-400/20'
            : 'bg-slate-600/90 text-slate-100 border-b border-slate-400/20'
        }`}>
          <div className="flex items-center justify-center gap-2">
            {connectionStatus === 'connecting' && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            )}
            {connectionStatus === 'connecting' && 'Conectando al chat...'}
            {connectionStatus === 'error' && (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Error de conexión - Chat no disponible
              </>
            )}
            {connectionStatus === 'disconnected' && 'Desconectado del chat'}
          </div>
        </div>
      )}

      <div 
        className={`relative flex ${connectionStatus !== 'connected' ? 'pt-12' : ''}`} 
        style={{ height: 'calc(100vh - 64px)' }}
      >
        {/* Lista de chats - siempre visible */}
        <div className={`${isMobileView && selectedChat ? 'hidden md:flex' : 'flex'}`}>
          <ChatList
            currentUserId={auth.user.idUsuario || auth.user.id}
            selectedChatId={selectedChat?.idChat}
            onChatSelect={handleChatSelect}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Ventana de chat o empty state */}
        <div className={`flex-1 ${!selectedChat && !isMobileView ? 'hidden md:block' : ''}`}>
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              currentUserId={auth.user.idUsuario || auth.user.id}
              onClose={handleCloseChat}
            />
          ) : (
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl flex items-center justify-center relative overflow-hidden h-full border-l border-slate-800/50">
              {/* Efectos de fondo */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5"></div>
              <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"></div>
              
              <div className="text-center text-slate-400 max-w-lg px-8 relative z-10">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-full blur-2xl"></div>
                  <div className="relative bg-gradient-to-br from-blue-600/20 to-violet-600/20 rounded-full p-8 backdrop-blur-sm border border-blue-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto text-blue-400"
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
                
                <h3 className="text-3xl font-bold text-slate-50 mb-4">¡Bienvenido al Chat!</h3>
                <p className="text-slate-400 mb-8 leading-relaxed text-lg">
                  Selecciona una conversación de la lista para comunicarte con otros usuarios
                </p>
                
               
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}