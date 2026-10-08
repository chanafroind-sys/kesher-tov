import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "brand" | "honey" | "mint" | "coral" | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "brand",
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  const baseStyles = "inline-flex items-center font-bold rounded-full border";

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs gap-1",
    md: "px-3.5 py-1 text-sm gap-1.5",
  };

  const variantStyles = {
    brand: "bg-brand-50 border-brand-200 text-brand-800",
    honey: "bg-honey-100 border-honey-300 text-honey-800",
    mint: "bg-mint-50 border-mint-200 text-mint-800",
    coral: "bg-coral-100 border-coral-300 text-coral-800",
    neutral: "bg-ink-500/10 border-ink-900/10 text-ink-700",
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
