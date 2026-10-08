import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="rounded-3xl border border-ink-900/10 bg-white p-8 sm:p-12 shadow-soft">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
          פרופיל אישי
        </span>
        <h1 className="mt-4 text-3xl font-black text-ink-900">הפרופיל שלי</h1>
        <p className="mt-3 text-ink-600 leading-relaxed">
          פרטים אישיים, תחום עיסוק, שנות ניסיון, העלאת קו&quot;ח (PDF בלבד, עד 5MB), והגדרת העדפת קבלת תודה (העברה בנקאית / מזומן / תרומה / חסד).
        </p>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
          <p className="font-bold">TODO: J4 (#20)</p>
          <p className="mt-1">מסך זה ייבנה במשימה J4: כניסה, התחברות ופרופיל.</p>
        </div>

        <div className="mt-8 pt-6 border-t border-ink-900/5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-900"
          >
            → חזרה לדף הבית
          </Link>

          <Link
            href="/settings/notifications"
            className="inline-flex items-center text-sm font-semibold text-ink-700 hover:text-ink-900"
          >
            הגדרות התראות
          </Link>
        </div>
      </div>
    </div>
  );
}
