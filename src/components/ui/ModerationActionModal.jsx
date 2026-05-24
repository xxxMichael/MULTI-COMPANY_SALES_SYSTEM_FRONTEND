import { useEffect, useState } from "react";
import { X, Check, Ban } from "lucide-react";

const ICONS = {
  approve: Check,
  accept: Check,
  reject: Ban,
  deny: Ban,
};

export default function ModerationActionModal({
  open,
  mode = "accept",
  title,
  description,
  confirmLabel,
  reasonLabel = "Motivo interno",
  commentLabel = "Comentario (opcional)",
  reasonPlaceholder,
  commentPlaceholder,
  defaultReason = "",
  defaultComment = "",
  requireReason = false,
  loading = false,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState(defaultReason);
  const [comment, setComment] = useState(defaultComment);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (open) {
      setReason(defaultReason || "");
      setComment(defaultComment || "");
      setShowError(false);
    }
  }, [open, defaultReason, defaultComment]);

  if (!open) return null;

  const Icon = ICONS[mode] || Check;
  const reasonIsEmpty = !reason.trim();

  const handleConfirm = () => {
    if (requireReason && reasonIsEmpty) {
      setShowError(true);
      return;
    }
    onConfirm?.({
      reason: reason.trim(),
      comment: comment.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-start justify-between px-6 py-5 border-b border-slate-800">
            <div>
              <h2 className="text-2xl font-semibold text-slate-50 flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-blue-600/20 text-blue-400">
                  <Icon className="w-5 h-5" />
                </span>
                {title}
              </h2>
              {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
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
                {reasonLabel}
                {requireReason && <span className="text-red-400"> *</span>}
              </label>
              <textarea
                className={`w-full min-h-[96px] rounded-xl bg-slate-800/70 border ${
                  showError && requireReason && reasonIsEmpty
                    ? "border-red-500"
                    : "border-slate-700"
                } px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y`}
                placeholder={reasonPlaceholder}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => setShowError(true)}
                maxLength={500}
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={showError && requireReason && reasonIsEmpty ? "text-red-400" : "text-transparent"}>
                  Este campo es obligatorio.
                </span>
                <span className="text-slate-500">{reason.length}/500</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200 block mb-2">
                {commentLabel}
              </label>
              <textarea
                className="w-full min-h-[80px] rounded-xl bg-slate-800/70 border border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                placeholder={commentPlaceholder}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
              />
              <div className="text-xs text-slate-500 mt-1 text-right">{comment.length}/1000</div>
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
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Guardando..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
