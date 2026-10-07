export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-sky-700">קשר טוב</span>
            <span className="text-xs bg-sky-100 text-sky-800 font-medium px-2.5 py-0.5 rounded-full">
              פלטפורמת עזרה הדדית
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <span>בס״ד</span>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-6 leading-tight">
            פותחות דלתות זו לזו <br />
            <span className="text-sky-600">עזרה הדדית במציאת עבודה</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed">
            חיבורים אישיים, המלצות לחברות וליווי מקצועי בין חברות הקהילה — מכל הלב,
            בכבוד ובדיסקרטיות מלאה.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="text-sky-600 text-xl font-bold mb-2">אני רוצה לעזור</div>
              <p className="text-slate-600 text-sm leading-relaxed">
                עובדת בחברה ומעוניינת לסייע בהגשת קורות חיים, מידע פנימי או הכנה לראיון?
                הצטרפי למעגל העוזרות.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="text-emerald-600 text-xl font-bold mb-2">אני מחפשת עבודה</div>
              <p className="text-slate-600 text-sm leading-relaxed">
                מחפשת את התפקיד הבא שלך? התחברי לעוזרות מהחברות המובילות ובדקי התאמה מדויקת
                למשרות פתוחות.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 קשר טוב — רשת עזרה הדדית מקצועית</p>
          <p className="text-xs text-slate-400">תשתית Next.js, TypeScript, Tailwind CSS, Supabase</p>
        </div>
      </footer>
    </div>
  );
}
