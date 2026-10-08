import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-2xl transition duration-150 focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-4 py-2 text-sm gap-2",
    md: "px-6 py-3 text-base gap-2.5",
    lg: "px-8 py-4 text-lg gap-3",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-l from-brand-700 to-brand-600 text-white shadow-soft hover:from-brand-800 hover:to-brand-700 hover:shadow-glow focus:ring-brand-200 active:scale-[0.99]",
    secondary:
      "border-2 border-ink-900/10 bg-white text-ink-900 shadow-soft hover:bg-cream hover:border-honey-300 focus:ring-honey-200 active:scale-[0.99]",
    ghost:
      "bg-transparent text-ink-700 hover:bg-brand-50 hover:text-brand-700 focus:ring-brand-100",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-200 active:scale-[0.99]",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin size-5 text-current me-2"
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
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
