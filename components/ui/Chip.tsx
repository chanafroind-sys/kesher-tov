import React from "react";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({
  children,
  selected = false,
  className = "",
  type = "button",
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-base font-semibold transition duration-150 border-2 select-none cursor-pointer focus:outline-none focus:ring-4 ${
        selected
          ? "border-brand-600 bg-brand-50 text-brand-900 shadow-soft focus:ring-brand-200"
          : "border-ink-900/10 bg-white text-ink-700 hover:border-ink-900/25 hover:bg-cream/50 focus:ring-ink-100"
      } ${className}`}
      {...props}
    >
      {selected && (
        <span className="grid place-items-center size-4 rounded-full bg-brand-600 text-white text-xs">
          ✓
        </span>
      )}
      {children}
    </button>
  );
}
