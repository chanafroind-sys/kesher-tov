import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className = "", id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full text-start">
        {label && (
          <label htmlFor={inputId} className="block text-base font-bold text-ink-900 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-2xl border-2 px-4 py-3.5 text-base text-ink-900 placeholder:text-ink-500/60 bg-white shadow-soft transition duration-150 focus:outline-none focus:ring-4 ${
            error
              ? "border-rose-400 focus:border-rose-600 focus:ring-rose-100"
              : "border-ink-900/15 focus:border-brand-600 focus:ring-brand-100"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-sm font-medium text-rose-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-sm text-ink-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
