import Link from "next/link";

interface TaskDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailsPage({ params }: TaskDetailsPageProps) {
  const { id } = await params;

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="rounded-3xl border border-ink-900/10 bg-white p-8 sm:p-12 shadow-soft">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
          פרטי משימה
        </span>
        <h1 className="mt-4 text-3xl font-black text-ink-900">פרטי משימה</h1>
        <p className="mt-2 text-xs font-mono text-ink-500">מזהה: {id}</p>
        <p className="mt-3 text-ink-600 leading-relaxed">
          דף משימה לפי תפקיד (עוזרת / נעזרת) וסטטוס: לקיחת משימה, צפייה בפרטי הנעזרת ובקו&quot;ח, סימון &quot;עשיתי את שלי&quot;, וסגירת משימה.
        </p>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900">
          <p className="font-bold">TODO: J8 (#24)</p>
          <p className="mt-1">מסך זה ייבנה במשימה J8: מסך הבית + דף משימה.</p>
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
