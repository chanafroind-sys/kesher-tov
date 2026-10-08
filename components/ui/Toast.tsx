import React from "react";

export interface ToastProps {
  type?: "success" | "error" | "info";
  title: string;
  message?: string;
  onClose?: () => void;
}

export function Toast({ type = "info", title, message, onClose }: ToastProps) {
  const typeStyles = {
    success: "border-mint-500 bg-mint-50 text-mint-900",
    error: "border-rose-400 bg-rose-50 text-rose-900",
    info: "border-brand-300 bg-brand-50 text-brand-900",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-2xl border-2 p-4 shadow-soft transition duration-200 text-start ${typeStyles[type]}`}
    >
      <span className="grid place-items-center size-6 rounded-full bg-white/80 font-bold text-sm shrink-0 mt-0.5">
        {icons[type]}
      </span>
      <div className="flex-1">
        <h4 className="font-bold text-base leading-tight">{title}</h4>
        {message && <p className="mt-1 text-sm opacity-90 leading-relaxed">{message}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="סגירה"
          className="text-current opacity-60 hover:opacity-100 p-1 rounded-lg transition"
        >
          ✕
        </button>
      )}
    </div>
  );
}
