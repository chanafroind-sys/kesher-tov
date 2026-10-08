import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "highlight" | "dashed";
}

export function Card({
  children,
  variant = "default",
  className = "",
  ...props
}: CardProps) {
  const baseStyles = "rounded-3xl p-6 sm:p-8 transition duration-200";

  const variantStyles = {
    default: "bg-white border border-ink-900/10 shadow-soft",
    muted: "bg-cream/60 border border-ink-900/5",
    highlight: "bg-gradient-to-br from-honey-50 via-white to-coral-100/40 border-2 border-honey-200 shadow-lift",
    dashed: "bg-white/50 border-2 border-dashed border-ink-900/15 hover:border-brand-400",
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
