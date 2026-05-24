import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi } from '../../api/chat';
import { getAuth } from '../../state/auth';

export default function ChatButton({ 
  targetUserId, 
  targetUserName, 
  className = "",
  variant = "default" // default, icon, text
}) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleStartChat = async () => {
    const userId = auth?.user?.idUsuario || auth?.user?.id;
    if (!userId) {
      navigate('/login');
      return;
    }

    if (userId === targetUserId) {
      alert('No puedes chatear contigo mismo');
      return;
    }

    setLoading(true);
    try {
      const chat = await chatApi.createOrGetChat(userId, targetUserId);
      
      // Navegar al chat con el ID específico
      navigate(`/chat?chatId=${chat.idChat}`);
    } catch (error) {
      console.error('Error al crear chat:', error);
      alert('Error al iniciar el chat. Verifica que el usuario existe.');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleStartChat}
        disabled={loading}
        className={`p-2 rounded-lg transition-colors ${
          loading 
            ? 'bg-slate-600 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white ${className}`}
        title={`Chatear con ${targetUserName || 'usuario'}`}
      >
        {loading ? (
          <svg
            className="w-5 h-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleStartChat}
        disabled={loading}
        className={`text-blue-400 hover:text-blue-300 transition-colors text-sm underline ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        {loading ? 'Conectando...' : 'Enviar mensaje'}
      </button>
    );
  }

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        loading 
          ? 'bg-slate-600 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700'
      } text-white ${className}`}
    >
      {loading ? (
        <>
          <svg
            className="w-4 h-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Conectando...</span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
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
          <span>Chatear</span>
        </>
      )}
    </button>
  );
}