import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/", label: "בית" },
  { href: "/tasks/new", label: "משימה חדשה" },
  { href: "/companies", label: "החברות שלי" },
  { href: "/profile", label: "פרופיל" },
];

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-cream/30 text-ink-900">
      {/* Top Desktop-First Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-ink-900/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" aria-label="קשר טוב - דף הבית" className="flex items-center">
              <Logo size={36} />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="flex items-center gap-1 sm:gap-2" aria-label="תפריט ניווט ראשי">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3.5 py-2 text-sm sm:text-base font-semibold text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Actions & Bell Placeholder */}
          <div className="flex items-center gap-3">
            {/* Bell placeholder for J11 */}
            <button
              type="button"
              aria-label="התראות"
              title="התראות (ימומש במשימה J11)"
              className="relative grid place-items-center size-10 rounded-full border border-ink-900/10 bg-white text-ink-700 shadow-soft transition hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {/* Unread indicator dot */}
              <span className="absolute top-2 start-2 size-2 rounded-full bg-brand-500 ring-2 ring-white" />
            </button>

            {/* User Profile Avatar / Link */}
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2 rounded-full border border-ink-900/10 bg-white py-1.5 px-3 text-sm font-semibold text-ink-700 shadow-soft hover:bg-ink-50"
            >
              <span className="grid place-items-center size-7 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
                ק
              </span>
              <span>הפרופיל שלי</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Compact Clean App Footer */}
      <footer className="border-t border-ink-900/5 bg-white/50 py-6 text-center text-xs text-ink-500">
        <p>קשר טוב · פלטפורמת עזרה הדדית בקהילה · © 2026</p>
      </footer>
    </div>
  );
}
