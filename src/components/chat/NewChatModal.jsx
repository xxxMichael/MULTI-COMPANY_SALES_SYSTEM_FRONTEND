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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-50">Nuevo Chat</h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-50 transition-colors"
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
            <input
              type="number"
              id="recipientId"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              placeholder="Ej: 123"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              required
              min="1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Ingresa el ID numérico del usuario con quien quieres chatear
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !recipientId.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
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

        <div className="mt-6 pt-4 border-t border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-2">¿Cómo encontrar el ID de un usuario?</h3>
          <ul className="text-xs text-slate-500 space-y-1">
            <li>• Puedes encontrarlo en el perfil del usuario</li>
            <li>• También en la URL cuando visitas su perfil</li>
            <li>• Pregúntale directamente al usuario</li>
          </ul>
        </div>
      </div>
    </div>
  );
}