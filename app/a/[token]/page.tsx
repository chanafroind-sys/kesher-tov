import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

interface ActionTokenPageProps {
  params: Promise<{ token: string }>;
}

export default async function ActionTokenPage({ params }: ActionTokenPageProps) {
  const { token } = await params;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-cream/40">
      <div className="w-full max-w-lg p-8 sm:p-10 bg-white border border-ink-900/10 rounded-3xl shadow-soft text-center">
        <div className="flex justify-center mb-6">
          <Logo size={42} />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
          פעולה בלחיצה אחת
        </span>

        <h1 className="mt-4 text-2xl sm:text-3xl font-black text-ink-900">אישור פעולה מהמייל</h1>
        <p className="mt-2 text-xs font-mono text-ink-500">טוקן פעולה: {token}</p>
        <p className="mt-4 text-sm sm:text-base text-ink-600 leading-relaxed">
          טעינת עמוד זה (GET) אינה מבצעת אף פעולה כדי להגן עליך מפני סורקי מיילים ומסנני אינטרנט.
          רק לחיצה מאשרת על הכפתור תבצע את הפעולה ישירות ללא צורך בהתחברות.
        </p>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900 text-start">
          <p className="font-bold">TODO: O9 (#17)</p>
          <p className="mt-1">מסך זה והשרת הייעודי ייבנו במשימה O9: כפתורי פעולה במייל (טוקנים חתומים).</p>
        </div>

        <div className="mt-8 pt-6 border-t border-ink-900/5">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-900"
          >
            → חזרה לדף הבית
          </Link>
        </div>
      </div>
    </main>
  );
}
