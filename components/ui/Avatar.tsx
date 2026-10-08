import React from "react";

export interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  // Extract up to 2 initial letters in Hebrew/English
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("") || "ק";

  const sizeStyles = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-14 text-lg",
    xl: "size-18 text-2xl",
  };

  // Deterministic pastel color palette based on name hash
  const colors = [
    "bg-brand-100 text-brand-800 border-brand-200",
    "bg-honey-100 text-honey-800 border-honey-300",
    "bg-coral-100 text-coral-800 border-coral-200",
    "bg-mint-100 text-mint-800 border-mint-200",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const colorStyle = colors[colorIndex];

  return (
    <div
      aria-label={`אוואטר עבור ${name}`}
      className={`inline-grid place-items-center rounded-full font-bold border select-none shrink-0 ${sizeStyles[size]} ${colorStyle} ${className}`}
    >
      {initials}
    </div>
  );
}
