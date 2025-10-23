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
    <div className="bg-gradient-to-r from-slate-800/90 to-slate-800/80 backdrop-blur-xl border-t border-slate-700/50 p-5 shadow-2xl">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "Chat no disponible..." : "Escribe un mensaje..."}
              disabled={disabled || sending}
              className="w-full resize-none rounded-2xl bg-slate-700/80 backdrop-blur-sm border border-slate-600/50 text-slate-50 placeholder-slate-400 px-5 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] max-h-[120px] shadow-lg transition-all duration-300 hover:border-slate-500/50"
              rows="1"
            />
            
            {/* Indicador de escritura */}
            <div className="absolute bottom-2 left-4 flex items-center space-x-1 opacity-0 transition-opacity">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
          
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
          className="group flex-shrink-0 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 disabled:hover:scale-100 disabled:hover:shadow-none"
          title={sending ? "Enviando..." : "Enviar mensaje (Enter)"}
        >
          {sending ? (
            <svg
              className="w-6 h-6 animate-spin"
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
              className="h-6 w-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
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
      
      {/* Tips mejorados */}
      <div className="flex justify-between items-center mt-3 px-1">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-xs font-mono">Enter</kbd>
            <span>enviar</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-xs font-mono">Shift+Enter</kbd>
            <span>nueva línea</span>
          </div>
        </div>
        
        {message.length > 500 && (
          <div className={`text-xs font-medium ${message.length > 1000 ? 'text-red-400' : 'text-yellow-400'}`}>
            {1000 - message.length} caracteres restantes
          </div>
        )}
      </div>
    </div>
  );
}