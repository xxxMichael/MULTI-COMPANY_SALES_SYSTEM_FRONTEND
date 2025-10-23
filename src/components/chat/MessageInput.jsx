import { useState, useRef } from 'react';

export default function MessageInput({ onSendMessage, disabled = false }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || sending || disabled) return;

    setSending(true);
    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <div className="bg-slate-800 border-t border-slate-700 p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Chat no disponible..." : "Escribe un mensaje..."}
            disabled={disabled || sending}
            className="w-full resize-none rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] max-h-[120px]"
            rows="1"
          />
          
          {/* Contador de caracteres */}
          {message.length > 800 && (
            <div className={`absolute bottom-2 right-2 text-xs ${
              message.length > 1000 ? 'text-red-400' : 'text-slate-400'
            }`}>
              {message.length}/1000
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!message.trim() || sending || disabled || message.length > 1000}
          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          title={sending ? "Enviando..." : "Enviar mensaje (Enter)"}
        >
          {sending ? (
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </form>
      
      {/* Tips */}
      <div className="text-xs text-slate-500 mt-2 flex justify-between">
        <span>Presiona Enter para enviar, Shift+Enter para nueva línea</span>
        {message.length > 500 && (
          <span className={message.length > 1000 ? 'text-red-400' : 'text-yellow-400'}>
            {1000 - message.length} caracteres restantes
          </span>
        )}
      </div>
    </div>
  );
}