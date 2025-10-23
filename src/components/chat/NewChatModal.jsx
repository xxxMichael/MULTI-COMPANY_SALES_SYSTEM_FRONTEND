import { useState } from 'react';
import { chatApi } from '../../api/chat';

export default function NewChatModal({ 
  isOpen, 
  onClose, 
  currentUserId, 
  onChatCreated 
}) {
  const [recipientId, setRecipientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const id = parseInt(recipientId.trim());
    if (!id || id === currentUserId) {
      setError('Por favor ingresa un ID de usuario válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const chat = await chatApi.createOrGetChat(currentUserId, id);
      onChatCreated(chat);
      handleClose();
    } catch (err) {
      console.error('Error al crear chat:', err);
      setError(
        err.response?.status === 404 
          ? 'Usuario no encontrado'
          : 'Error al crear el chat. Verifica el ID del usuario.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRecipientId('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 w-full max-w-md shadow-2xl shadow-blue-500/10 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-50">Nuevo Chat</h2>
          </div>
          
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-50 hover:bg-red-500/20 p-2 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label 
              htmlFor="recipientId" 
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              ID del usuario destinatario
            </label>
            <div className="relative">
              <input
                type="number"
                id="recipientId"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                placeholder="Ej: 123"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-slate-50 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-slate-700 transition-all duration-300"
                disabled={loading}
                required
                min="1"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ingresa el ID numérico del usuario con quien quieres chatear
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-slate-400 hover:text-slate-50 hover:bg-slate-700/50 rounded-xl transition-all duration-300 font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !recipientId.trim()}
              className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center space-x-2"
            >
              {loading && (
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
              )}
              <span>{loading ? 'Creando...' : 'Crear Chat'}</span>
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-xl p-4 border border-blue-500/20">
            <h3 className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ¿Cómo encontrar el ID de un usuario?
            </h3>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Puedes encontrarlo en el perfil del usuario
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                También en la URL cuando visitas su perfil
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Pregúntale directamente al usuario
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}