import React, { useEffect } from "react";
import Portal from "./Portal";

export default function ConfirmModal({
  open,
  title = "Confirmar",
  description = "¿Estás seguro?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  loading = false,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) {
        onCancel && onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => onCancel && onCancel()}
        />

        {/* Modal panel - absolutamente centrado en la pantalla */}
        <div className="relative w-full max-w-lg z-[10000]">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl transform transition-all">
            <h3 className="text-lg font-semibold text-slate-50 mb-2">{title}</h3>
            <p className="text-sm text-slate-400 mb-6 whitespace-pre-line">{description}</p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => onCancel && onCancel()}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                disabled={loading}
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={() => onConfirm && onConfirm()}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold shadow-sm disabled:opacity-60 transition-colors"
                disabled={loading}
              >
                {loading ? "Eliminando..." : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
