import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SignOutButton } from "@/components/nav/SignOutButton";
import { NotificationBell } from "@/components/nav/NotificationBell";

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

          {/* Actions & Bell */}
          <div className="flex items-center gap-3">
            {/* Live Notification Bell */}
            <NotificationBell />

            {/* User Profile Avatar / Link */}
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2 rounded-full border border-ink-900/10 bg-white py-1.5 px-3 text-sm font-semibold text-ink-700 shadow-soft hover:bg-ink-50"
            >
              <span className="grid place-items-center size-7 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
                ש
              </span>
              <span>הפרופיל שלי</span>
            </Link>

            {/* Sign Out Button */}
            <SignOutButton />
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
