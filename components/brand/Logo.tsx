type LogoProps = {
  size?: number;
  className?: string;
};

/** Brand mark: two interlinked rings forming a heart-like knot ("קשר"). */
export function LogoMark({ size = 40, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="kt-a" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c4dff" />
          <stop offset="1" stopColor="#4a1cae" />
        </linearGradient>
        <linearGradient id="kt-b" x1="48" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffc84a" />
          <stop offset="1" stopColor="#fb7185" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#kt-a)" />
      <circle cx="19" cy="22" r="8.5" stroke="#fff" strokeWidth="3.4" />
      <circle cx="29" cy="22" r="8.5" stroke="url(#kt-b)" strokeWidth="3.4" />
      <path d="M17 33.5c2.2 2.4 4.6 3.6 7 3.6s4.8-1.2 7-3.6" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".85" />
    </svg>
  );
}

export function Logo({ size = 40, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <LogoMark size={size} />
      <span className="leading-none">
        <span className="block text-2xl font-extrabold tracking-tight text-ink-900">קשר טוב</span>
        <span className="block text-xs font-medium text-ink-500 mt-1">עזרה הדדית במציאת עבודה</span>
      </span>
    </span>
  );
}
