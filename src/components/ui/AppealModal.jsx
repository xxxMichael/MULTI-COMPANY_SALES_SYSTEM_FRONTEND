import { useEffect, useState } from "react";
import { X, Send } from "lucide-react";

export default function AppealModal({ open, product, loading, onClose, onSubmit }) {
  const [justification, setJustification] = useState("");
  const [comments, setComments] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setJustification("");
      setComments("");
      setTouched(false);
    }
  }, [open]);

  if (!open || !product) return null;

  const hasError = touched && justification.trim().length === 0;

  const handleSubmit = (evt) => {
    evt.preventDefault();
    setTouched(true);
    if (!justification.trim()) return;
    onSubmit?.({
      justification: justification.trim(),
      comments: comments.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-xl mx-4">
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="flex items-start justify-between px-6 py-5 border-b border-slate-800">
            <div>
              <h2 className="text-2xl font-semibold text-slate-50">Apelar producto</h2>
              <p className="text-sm text-slate-400 mt-1">
                Cuéntanos por qué crees que "{product.nombre}" debería ser revisado nuevamente.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-200 block mb-2">
                Justificación <span className="text-red-400">*</span>
              </label>
              <textarea
                className={`w-full min-h-[120px] rounded-xl bg-slate-800/70 border ${
                  hasError ? "border-red-500" : "border-slate-700"
                } px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y`}
                placeholder="Describe la razón de tu apelación"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                onBlur={() => setTouched(true)}
                maxLength={1000}
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={hasError ? "text-red-400" : "text-transparent"}>
                  La justificación es obligatoria.
                </span>
                <span className="text-slate-500">{justification.length}/1000</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200 block mb-2">
                Comentarios adicionales (opcional)
              </label>
              <textarea
                className="w-full min-h-[80px] rounded-xl bg-slate-800/70 border border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                placeholder="Información que pueda ayudarnos a revisar tu caso"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                maxLength={1000}
              />
              <div className="text-xs text-slate-500 mt-1 text-right">{comments.length}/1000</div>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700/80"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-60"
              disabled={loading}
            >
              <Send className="w-4 h-4" />
              {loading ? "Enviando..." : "Enviar apelación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
