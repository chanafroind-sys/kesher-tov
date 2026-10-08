import { IconBuilding, IconCheck, IconGift } from "./icons";

/** Illustrative product preview for the hero: floating task / claim / thanks cards. */
export function HeroVisual() {
  const match = 87;
  const circumference = 2 * Math.PI * 26;

  return (
    <div className="relative mx-auto w-full max-w-[34rem] h-[32rem]" aria-hidden="true">
      {/* glow blobs */}
      <div className="absolute -top-6 start-10 size-72 rounded-full bg-brand-400/40 blur-3xl animate-blob" />
      <div className="absolute bottom-0 end-4 size-64 rounded-full bg-honey-300/50 blur-3xl animate-blob [animation-delay:-6s]" />
      <div className="absolute top-40 end-24 size-48 rounded-full bg-coral-300/40 blur-3xl animate-blob [animation-delay:-12s]" />

      {/* main task card */}
      <div className="absolute top-14 inset-x-0 mx-auto w-[25rem] rounded-3xl bg-white/90 backdrop-blur-xl border border-white shadow-lift p-6 animate-fade-up [animation-delay:300ms]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center size-11 rounded-2xl bg-brand-50 text-brand-600">
              <IconBuilding size={22} />
            </span>
            <div>
              <p className="text-xs font-medium text-ink-500">משימה חדשה</p>
              <p className="font-bold text-ink-900">מטריקס · מפתחת Full Stack</p>
            </div>
          </div>
          <span className="rounded-full bg-mint-50 text-mint-700 text-xs font-bold px-3 py-1">פתוחה</span>
        </div>

        <div className="mt-5 flex items-center gap-5">
          <div className="relative size-16 shrink-0">
            <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="var(--color-brand-100)" strokeWidth="7" fill="none" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="url(#kt-ring)"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - match / 100)}
              />
              <defs>
                <linearGradient id="kt-ring" x1="0" y1="0" x2="64" y2="64">
                  <stop stopColor="#7c4dff" />
                  <stop offset="1" stopColor="#fb7185" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 grid place-items-center text-sm font-extrabold text-ink-900">
              {match}%
            </span>
          </div>
          <ul className="space-y-1.5 text-sm text-ink-700">
            {["React + TypeScript", "3 שנות ניסיון", "עבודה עם ענן"].map((r) => (
              <li key={r} className="flex items-center gap-2">
                <span className="grid place-items-center size-5 rounded-full bg-mint-100 text-mint-600">
                  <IconCheck size={13} strokeWidth={3} />
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 rounded-2xl bg-gradient-to-l from-brand-600 to-brand-500 text-white text-center font-bold py-3 shadow-glow">
          אני יכולה לעזור
        </div>
      </div>

      {/* claimed toast */}
      <div className="absolute top-0 end-0 animate-float">
        <div className="flex items-center gap-3 rounded-2xl bg-white shadow-lift border border-brand-50 ps-3 pe-5 py-3 animate-pop [animation-delay:900ms]">
          <span className="relative grid place-items-center size-10 rounded-full bg-gradient-to-br from-coral-300 to-coral-400 text-white font-bold">
            ר
            <span className="absolute -bottom-0.5 -end-0.5 size-3.5 rounded-full bg-mint-500 border-2 border-white animate-pulse-ring" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink-900">רחל לקחה את המשימה</p>
            <p className="text-xs text-ink-500">עובדת במטריקס · לפני 2 דק׳</p>
          </div>
        </div>
      </div>

      {/* helpers chip */}
      <div className="absolute top-[22rem] start-0 animate-float-slow [animation-delay:-3s]">
        <div className="flex items-center gap-2 rounded-full bg-white shadow-soft border border-brand-50 px-4 py-2 animate-pop [animation-delay:1200ms]">
          <span className="flex -space-x-2 rtl:space-x-reverse">
            {[
              ["מ", "from-brand-400 to-brand-600"],
              ["ש", "from-honey-300 to-honey-500"],
              ["ד", "from-mint-500 to-mint-700"],
            ].map(([l, g]) => (
              <span
                key={l}
                className={`grid place-items-center size-7 rounded-full bg-gradient-to-br ${g} text-white text-xs font-bold border-2 border-white`}
              >
                {l}
              </span>
            ))}
          </span>
          <span className="text-sm font-semibold text-ink-700">7 עוזרות במטריקס</span>
        </div>
      </div>

      {/* thanks card */}
      <div className="absolute bottom-2 end-6 animate-float [animation-delay:-2s]">
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-honey-300 to-honey-500 text-ink-900 shadow-honey px-5 py-3.5 animate-pop [animation-delay:1500ms]">
          <span className="grid place-items-center size-10 rounded-xl bg-white/40">
            <IconGift size={22} />
          </span>
          <div>
            <p className="text-sm font-extrabold">התקבלתי לעבודה!</p>
            <p className="text-xs font-medium text-ink-700">תודה של ₪100 לרחל · אחרי משכורת ראשונה</p>
          </div>
        </div>
      </div>
    </div>
  );
}
