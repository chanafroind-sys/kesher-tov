import Link from "next/link";

export default function HiredThanksPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="rounded-3xl border border-ink-900/10 bg-white p-8 sm:p-12 shadow-soft">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-100 px-3 py-1 text-xs font-bold text-mint-800">
          בשעה טובה!
        </span>
        <h1 className="mt-4 text-3xl font-black text-ink-900">התקבלתי לעבודה / משכורת ראשונה / תודות</h1>
        <p className="mt-3 text-ink-600 leading-relaxed">
          שלב 1: סימון קבלה לעבודה. שלב 2: סימון קבלת משכורת ראשונה וחשיפת רשימת התודות לתשלום לפי העדפת העוזרת.
        </p>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
          <p className="font-bold">TODO: J10 (#26)</p>
          <p className="mt-1">מסך זה ייבנה במשימה J10: התקבלתי לעבודה / משכורת ראשונה / תודות.</p>
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
