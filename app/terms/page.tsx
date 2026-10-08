import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream/30 text-ink-900">
      {/* Header */}
      <header className="border-b border-ink-900/10 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/">
            <Logo size={36} />
          </Link>
          <Link
            href="/"
            className="text-sm font-bold text-ink-700 hover:text-brand-700"
          >
            ← חזרה לדף הבית
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8 animate-fade-up">
        <div className="text-center sm:text-start">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-honey-100 px-3 py-1 text-xs font-bold text-honey-900 mb-2">
            📜 אמנת הקהילה ותנאי השימוש
          </span>
          <h1 className="text-4xl font-black text-ink-900">תנאי שימוש ואמנת הקהילה</h1>
          <p className="mt-2 text-ink-600 text-base">
            עודכן לאחרונה: אוקטובר 2026 · פלטפורמת &quot;קשר טוב&quot;
          </p>
        </div>

        <div className="rounded-3xl border border-ink-900/10 bg-white p-8 sm:p-10 shadow-soft space-y-8 leading-relaxed text-ink-800">
          <section className="space-y-3">
            <h2 className="text-xl font-black text-ink-900">1. מטרת הפלטפורמה ועקרון ההזמנה</h2>
            <p>
              &quot;קשר טוב&quot; היא רשת עזרה הדדית קהילתית ללא כוונת רווח הפועלת במתכונת <strong>בהזמנה בלבד</strong> (Invite Only).
              ההצטרפות מבוססת על אמון אישי בין חברות הקהילה במטרה לסייע בהשמה, המלצות פנימיות והכנה לראיונות עבודה.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-ink-900">2. מודל הכרת הטוב (&quot;תודה&quot;)</h2>
            <p>
              מודל התודה מבוסס על ערך של הכרת הטוב ההדדית:
            </p>
            <ul className="list-disc list-inside space-y-2 text-ink-700">
              <li>
                <strong>תשלום מאוחר בלבד:</strong> דמי התודה אינם נגבים מראש, לא בעת פתיחת המשימה ולא בעת הגשת קורות החיים.
              </li>
              <li>
                <strong>התניית משכורת ראשונה:</strong> הזכאות לדמי תודה נכנסת לתוקף אך ורק לאחר שהנעזרת התקבלה בפועל לעבודה וקיבלה את משכורתה הראשונה.
              </li>
              <li>
                <strong>בחירת העוזרת:</strong> העוזרת בוחרת כיצד לקבל את התודה (העברה בנקאית, במזומן/אישי, תרומה לקרן צדקה, או ויתור מלא כחסד).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-ink-900">3. התנהגות הולמת וכבוד הדדי</h2>
            <ul className="list-disc list-inside space-y-2 text-ink-700">
              <li>
                חל איסור מוחלט על שימוש בפלטפורמה לספאם, להפצת הצעות מסחריות או פרסום שאינו קשור לסיוע ישיר במציאת עבודה.
              </li>
              <li>
                חברות קהילה מתחייבות לשמור על סודיות מוחלטת לגבי מידע ופרטי קורות חיים שנחשפו בפניהן.
              </li>
              <li>
                הנהלת הקהילה שומרת לעצמה את הזכות להשעות או לחסום משתמשת שתפר את עקרונות האמון וההגינות הקהילתית.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-ink-900">4. היעדר אחריות להעסקה</h2>
            <p>
              הפלטפורמה נועדה לחיבור ולסיוע קהילתי בלבד. קשר טוב אינה חברת השמה ואינה מתחייבת לקבלת מועמדת לעבודה, אשר נתונה לשיקול דעתם הבלעדי של המעסיקים.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
