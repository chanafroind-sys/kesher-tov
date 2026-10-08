import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function PrivacyPage() {
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800 mb-2">
            🔒 פרטיות ואבטחת מידע
          </span>
          <h1 className="text-4xl font-black text-ink-900">מדיניות הפרטיות</h1>
          <p className="mt-2 text-ink-600 text-base">
            עודכן לאחרונה: אוקטובר 2026 · פלטפורמת &quot;קשר טוב&quot;
          </p>
        </div>

        <div className="rounded-3xl border border-ink-900/10 bg-white p-8 sm:p-10 shadow-soft space-y-8 leading-relaxed text-ink-800">
          <section className="space-y-3">
            <h2 className="text-xl font-black text-ink-900">1. מחויבות עליונה לפרטיות וכבוד הדדי</h2>
            <p>
              פלטפורמת &quot;קשר טוב&quot; נבנתה במיוחד עבור הקהילה ומתוך הבנה עמוקה של רגישות חיפוש עבודה.
              איננו מוכרים, משכירים או מוסרים מידע לצדדים שלישיים לצרכים מסחריים או פרסומיים לעולם.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-ink-900">2. מי רואה את הפרטים שלך?</h2>
            <ul className="list-disc list-inside space-y-2 text-ink-700">
              <li>
                <strong>שם וקורות חיים חסויים:</strong> בעת פתיחת משימה, שמך ופרטי הקשר שלך אינם מוצגים. רק עוזרת שבחרה לקחת את המשימה מקבלת גישה לפרטי הקשר ולקובץ קורות החיים שלך.
              </li>
              <li>
                <strong>עוזרות אינן רואות זו את זו:</strong> כל קשר הוא דיסקרטי ואישי. עוזרת אינה יכולה לראות מי עוד עזרה או לקחה את המשימה.
              </li>
              <li>
                <strong>ללא תמונות משתמשים:</strong> המערכת פועלת ללא העלאת תמונות אישיות, מתוך עקרונות צניעות והתאמה מלאה למסנני אינטרנט כשרים (נטפרי, נתיב).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-ink-900">3. אבטחת קבצי קורות חיים</h2>
            <p>
              קבצי קורות החיים מאוחסנים באחסון ענן פרטי ומוצפן (Private Encrypted Storage).
              הגישה לקובץ מתבצעת אך ורק באמצעות קישורים חתומים ומאובטחים (Signed URLs) שתוקפם מוגבל בזמן ופוקע אוטומטית.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-ink-900">4. תקופת שמירה ומחיקה אוטומטית (Data Retention)</h2>
            <p>
              איננו שומרים מידע ישן ללא צורך:
            </p>
            <ul className="list-disc list-inside space-y-2 text-ink-700">
              <li>
                קבצי קורות חיים של משתמשות שלא ביצעו פעילות בחשבונן במשך 12 חודשים רצופים נמחקים אוטומטית לצמיתות.
              </li>
              <li>
                משימות שנסגרו נשמרות באופן אנונימי בלבד לצורכי סטטיסטיקה קהילתית.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-ink-900">5. הזכות למחיקת החשבון והמידע (&quot;הזכות להישכח&quot;)</h2>
            <p>
              בכל עת, כל משתמשת רשאית למחוק את חשבונה בלחיצה אחת מתוך עמוד הפרופיל.
              מחיקת החשבון הינה בלתי הפיכה ומוחקת מיד את כל המידע האישי, קובץ קורות החיים, קישורי החברות וההעדפות.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-black text-ink-900">6. יצירת קשר לבירורי פרטיות</h2>
            <p>
              בכל שאלה או פנייה בנושא אבטחת מידע ופרטיות, ניתן לפנות לצוות הקהילה בכתובת המייל:{" "}
              <a href="mailto:privacy@kesher-tov.community" className="text-brand-700 font-bold underline">
                privacy@kesher-tov.community
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
