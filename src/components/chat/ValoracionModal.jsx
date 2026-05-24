import { useState } from 'react';
import { valoracionesApi } from '../../api/valoraciones';

export default function ValoracionModal({ 
  vendedor, 
  onClose, 
  onValoracionCreada 
}) {
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (puntuacion === 0) {
      setError('Por favor selecciona una puntuación');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await valoracionesApi.crearValoracion({
        vendedorId: vendedor.id,
        puntuacion,
        comentario: comentario.trim() || null
      });
      
      onValoracionCreada && onValoracionCreada();
      onClose();
    } catch (err) {
      console.error('Error al crear valoración:', err);
      setError(err.response?.data?.error || 'Error al crear la valoración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700/50">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                Valorar Vendedor
              </h3>
              <p className="text-slate-400 text-sm">
                {vendedor.nombre}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Estrellas */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Puntuación <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPuntuacion(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <svg
                    className={`w-12 h-12 transition-colors ${
                      star <= (hoverRating || puntuacion)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-600 fill-slate-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            {puntuacion > 0 && (
              <p className="text-center text-sm text-slate-400 mt-2">
                {puntuacion === 1 && '⭐ Muy malo'}
                {puntuacion === 2 && '⭐⭐ Malo'}
                {puntuacion === 3 && '⭐⭐⭐ Regular'}
                {puntuacion === 4 && '⭐⭐⭐⭐ Bueno'}
                {puntuacion === 5 && '⭐⭐⭐⭐⭐ Excelente'}
              </p>
            )}
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              maxLength={255}
              rows={4}
              placeholder="Cuéntanos sobre tu experiencia..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={loading}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {comentario.length}/255 caracteres
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || puntuacion === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enviando...
                </span>
              ) : (
                'Enviar Valoración'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
