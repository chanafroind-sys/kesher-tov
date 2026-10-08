import Link from "next/link";

export default function CompaniesPage() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="rounded-3xl border border-ink-900/10 bg-white p-8 sm:p-12 shadow-soft">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-honey-100 px-3 py-1 text-xs font-bold text-ink-900">
          אזור עוזרות
        </span>
        <h1 className="mt-4 text-3xl font-black text-ink-900">החברות שלי</h1>
        <p className="mt-3 text-ink-600 leading-relaxed">
          ניהול החברות שאני יכולה לעזור בהן, סוגי הסיוע (הגשת קו&quot;ח, מידע, הכנה לראיון), והשתקת התראות.
        </p>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
          <p className="font-bold">TODO: J6 (#22)</p>
          <p className="mt-1">מסך זה ייבנה במשימה J6: מסך החברות שלי.</p>
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
    </div>
  );
}
