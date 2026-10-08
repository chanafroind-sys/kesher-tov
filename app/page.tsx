import { Logo, LogoMark } from "@/components/brand/Logo";
import { HeroVisual } from "@/components/landing/HeroVisual";
import {
  IconArrow,
  IconBan,
  IconCheck,
  IconEyeOff,
  IconGift,
  IconHandshake,
  IconHeart,
  IconLock,
  IconMail,
  IconSearch,
  IconShield,
  IconSparkles,
  IconTrash,
} from "@/components/landing/icons";

const nav = [
  { href: "#how", label: "איך זה עובד" },
  { href: "#roles", label: "למי זה מתאים" },
  { href: "#thanks", label: "מנגנון התודה" },
  { href: "#privacy", label: "פרטיות" },
];

const trust = [
  { icon: IconMail, text: "בהזמנה בלבד" },
  { icon: IconEyeOff, text: "הפרטים שלך חסויים" },
  { icon: IconBan, text: "בלי תמונות ובלי פרסומות" },
  { icon: IconGift, text: "תודה רק אחרי משכורת ראשונה" },
];

const steps = [
  {
    n: "1",
    icon: IconSearch,
    title: "פותחות משימה",
    text: "בוחרות חברה, מדביקות את המשרה ומסמנות כמה את מתאימה. המערכת מחשבת אחוז התאמה.",
    color: "from-brand-500 to-brand-700",
  },
  {
    n: "2",
    icon: IconHandshake,
    title: "עוזרת מהחברה לוקחת",
    text: "נשים שעובדות שם מקבלות מייל, ואחת לוחצת “אני יכולה לעזור” — מגישה, מייעצת או מכינה לראיון.",
    color: "from-coral-400 to-coral-500",
  },
  {
    n: "3",
    icon: IconSparkles,
    title: "מתקבלות ואומרות תודה",
    text: "אחרי שהתקבלת ושקיבלת משכורת ראשונה — את סוגרת מעגל עם תודה למי שפתחה לך את הדלת.",
    color: "from-honey-400 to-honey-600",
  },
];

const privacy = [
  { icon: IconEyeOff, title: "זהות חסויה", text: "השם שלך נחשף רק לעוזרת שלקחה את המשימה — לא לפני." },
  { icon: IconShield, title: "עוזרות לא רואות זו את זו", text: "אין רשימות פומביות, אין חשיפה מיותרת. כל קשר הוא אישי." },
  { icon: IconLock, title: "קורות חיים במקום נעול", text: "הקבצים נשמרים באחסון פרטי ומוצפן, ונמחקים אוטומטית אחרי שנה בלי פעילות." },
  { icon: IconTrash, title: "מחיקה בלחיצה", text: "רוצה לעזוב? מוחקים את החשבון וכל המידע שלך נעלם. לגמרי." },
];

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/70 backdrop-blur px-4 py-1.5 text-sm font-semibold text-brand-700 shadow-soft ${className}`}
    >
      {children}
    </span>
  );
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: React.ReactNode; text?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Pill>{eyebrow}</Pill>
      <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-ink-900 leading-tight">{title}</h2>
      {text && <p className="mt-4 text-lg text-ink-600 leading-relaxed">{text}</p>}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative overflow-x-clip">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-cream/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <a href="#" aria-label="קשר טוב — לראש העמוד">
            <Logo size={42} />
          </a>
          <nav className="hidden lg:flex items-center gap-1" aria-label="ניווט ראשי">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-base font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href="#join"
            className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-base font-bold text-white shadow-soft transition hover:bg-brand-700 hover:shadow-glow"
          >
            הצטרפות
            <IconArrow size={18} className="transition group-hover:-translate-x-1" />
          </a>
        </div>
      </header>

      <main>
        {/* ===== Hero ===== */}
        <section className="relative">
          <div className="absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-8 pt-16 pb-24 lg:grid-cols-2 lg:pt-24">
            <div>
              <div className="animate-fade-up">
                <Pill>
                  <span className="size-2 rounded-full bg-mint-500 animate-pulse-ring" />
                  רשת עזרה קהילתית · מכל הלב
                </Pill>
              </div>
              <h1 className="mt-7 text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] text-ink-900 animate-fade-up [animation-delay:120ms]">
                מישהי כבר עובדת שם.
                <br />
                <span className="text-gradient">והיא רוצה לעזור לך.</span>
              </h1>
              <p className="mt-7 max-w-xl text-xl leading-relaxed text-ink-600 animate-fade-up [animation-delay:240ms]">
                קשר טוב מחבר בין נשים שמחפשות עבודה לבין נשים מהקהילה שכבר עובדות בחברות —
                להגשת קורות חיים מבפנים, מידע אמיתי והכנה לראיון. בכבוד, בדיסקרטיות, ובלב טוב.
              </p>
              <div className="mt-10 flex flex-wrap gap-4 animate-fade-up [animation-delay:360ms]">
                <a
                  href="#roles"
                  className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-l from-brand-700 to-brand-500 px-8 py-4 text-lg font-bold text-white shadow-glow transition hover:-translate-y-0.5 hover:shadow-lift"
                >
                  אני מחפשת עבודה
                  <IconArrow size={20} className="transition group-hover:-translate-x-1" />
                </a>
                <a
                  href="#roles"
                  className="group inline-flex items-center gap-3 rounded-2xl border-2 border-ink-900/10 bg-white px-8 py-4 text-lg font-bold text-ink-900 shadow-soft transition hover:-translate-y-0.5 hover:border-honey-300 hover:shadow-honey"
                >
                  <IconHeart size={20} className="text-coral-400" />
                  אני רוצה לעזור
                </a>
              </div>
              <ul className="mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 animate-fade-up [animation-delay:480ms]">
                {trust.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-base font-medium text-ink-700">
                    <span className="grid place-items-center size-9 rounded-xl bg-white shadow-soft text-brand-600">
                      <Icon size={18} />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <HeroVisual />
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section id="how" className="relative scroll-mt-24 py-28">
          <div className="mx-auto max-w-7xl px-8">
            <SectionTitle
              eyebrow="איך זה עובד"
              title={
                <>
                  שלושה צעדים <span className="text-gradient">מהבקשה ועד העבודה</span>
                </>
              }
              text="בלי טפסים מסובכים ובלי להכיר אף אחד מראש. רוב הפעולות אפשר לעשות ישר מהמייל, בלחיצה אחת."
            />
            <div className="relative mt-16 grid gap-8 lg:grid-cols-3">
              <div className="absolute top-16 inset-x-[16%] hidden h-0.5 bg-gradient-to-l from-brand-200 via-coral-300 to-honey-300 lg:block" />
              {steps.map(({ n, icon: Icon, title, text, color }) => (
                <article
                  key={n}
                  className="group relative rounded-3xl border border-white bg-white/80 p-8 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-2 hover:shadow-lift"
                >
                  <div className="relative flex items-center gap-4">
                    <span
                      className={`grid place-items-center size-16 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lift transition duration-300 group-hover:rotate-6 group-hover:scale-110`}
                    >
                      <Icon size={28} />
                    </span>
                    <span className="text-6xl font-black text-ink-900/5">{n}</span>
                  </div>
                  <h3 className="mt-6 text-2xl font-extrabold text-ink-900">{title}</h3>
                  <p className="mt-3 text-lg leading-relaxed text-ink-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Roles ===== */}
        <section id="roles" className="relative scroll-mt-24 pb-28">
          <div className="mx-auto max-w-7xl px-8">
            <SectionTitle eyebrow="למי זה מתאים" title="יש כאן מקום לכל אחת" />
            <div className="mt-14 grid gap-8 lg:grid-cols-2">
              {/* seeker */}
              <article className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-10 text-white shadow-lift">
                <div className="absolute -top-20 -end-20 size-72 rounded-full bg-brand-400/40 blur-3xl transition duration-700 group-hover:scale-125" />
                <div className="relative">
                  <span className="grid place-items-center size-16 rounded-2xl bg-white/15 backdrop-blur">
                    <IconSearch size={30} />
                  </span>
                  <h3 className="mt-6 text-3xl font-extrabold">אני מחפשת עבודה</h3>
                  <p className="mt-3 text-lg text-brand-100 leading-relaxed">
                    במקום לשלוח קורות חיים לחלל — מישהי מבפנים מגישה אותם, מספרת לך מה באמת מחפשים ועוזרת לך להתכונן.
                  </p>
                  <ul className="mt-7 space-y-3.5">
                    {[
                      "בדיקת התאמה למשרה עוד לפני שמגישים",
                      "עד 3 עוזרות יכולות לקחת כל משימה",
                      "השם שלך חסוי עד שעוזרת לוקחת",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-3 text-lg">
                        <span className="grid place-items-center size-7 rounded-full bg-white/20">
                          <IconCheck size={16} strokeWidth={3} />
                        </span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              {/* helper */}
              <article className="group relative overflow-hidden rounded-[2rem] border-2 border-honey-200 bg-gradient-to-br from-honey-50 via-white to-coral-100/60 p-10 shadow-lift">
                <div className="absolute -bottom-24 -start-16 size-72 rounded-full bg-honey-300/40 blur-3xl transition duration-700 group-hover:scale-125" />
                <div className="relative">
                  <span className="grid place-items-center size-16 rounded-2xl bg-gradient-to-br from-honey-300 to-honey-500 text-ink-900 shadow-honey">
                    <IconHeart size={30} />
                  </span>
                  <h3 className="mt-6 text-3xl font-extrabold text-ink-900">אני רוצה לעזור</h3>
                  <p className="mt-3 text-lg text-ink-600 leading-relaxed">
                    עובדת בחברה? ההרשמה לוקחת פחות מדקה. בוחרות חברות, ומקבלות מייל רק כשמישהי צריכה בדיוק אותך.
                  </p>
                  <ul className="mt-7 space-y-3.5 text-ink-700">
                    {[
                      "את מחליטה במה לעזור: הגשה, מידע או הכנה לראיון",
                      "עד 3 מיילים ביום — וכלום בשבת וחג",
                      "תודה אישית אחרי שהיא מתקבלת",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-3 text-lg">
                        <span className="grid place-items-center size-7 rounded-full bg-honey-200 text-honey-600">
                          <IconCheck size={16} strokeWidth={3} />
                        </span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ===== Thanks ===== */}
        <section id="thanks" className="relative scroll-mt-24 px-8 pb-28">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-ink-900 px-10 py-20 text-white shadow-lift lg:px-20">
            <div className="absolute -top-32 start-1/4 size-96 rounded-full bg-brand-600/50 blur-3xl animate-blob" />
            <div className="absolute -bottom-32 end-1/4 size-96 rounded-full bg-honey-500/30 blur-3xl animate-blob [animation-delay:-9s]" />
            <div className="relative grid items-center gap-14 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-honey-200">
                  <IconGift size={16} /> מנגנון התודה
                </span>
                <h2 className="mt-6 text-4xl font-extrabold leading-tight">
                  משלמות רק כשזה עבד.
                  <br />
                  <span className="text-honey-300">ורק אחרי משכורת ראשונה.</span>
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-white/75">
                  כשפותחות משימה בוחרות סכום תודה. הוא לא משולם מראש, לא כשמגישים ולא כשמתקבלים — אלא רק אחרי
                  שהמשכורת הראשונה נכנסת. העוזרת בוחרת איך לקבל: העברה בנקאית, במזומן, תרומה לצדקה — או לוותר
                  לגמרי, כחסד.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { a: "₪20", s: "תודה קטנה" },
                  { a: "₪50", s: "תודה חמה" },
                  { a: "₪100", s: "תודה גדולה", hot: true },
                  { a: "חסד", s: "העוזרת ויתרה" },
                ].map(({ a, s, hot }) => (
                  <div
                    key={a}
                    className={`rounded-3xl p-7 text-center transition duration-300 hover:-translate-y-1 ${
                      hot
                        ? "bg-gradient-to-br from-honey-300 to-honey-500 text-ink-900 shadow-honey"
                        : "border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10"
                    }`}
                  >
                    <p className="text-4xl font-black">{a}</p>
                    <p className={`mt-2 text-base font-medium ${hot ? "text-ink-700" : "text-white/60"}`}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== Privacy ===== */}
        <section id="privacy" className="relative scroll-mt-24 pb-28">
          <div className="mx-auto max-w-7xl px-8">
            <SectionTitle
              eyebrow="פרטיות ואמון"
              title={
                <>
                  הפרטים שלך <span className="text-gradient">שמורים איתך</span>
                </>
              }
              text="בנינו את קשר טוב כך שהפרטיות נאכפת במסד הנתונים עצמו — לא רק בהבטחות."
            />
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {privacy.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-3xl border border-white bg-white/80 p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="grid place-items-center size-14 rounded-2xl bg-brand-50 text-brand-600">
                    <Icon size={26} />
                  </span>
                  <h3 className="mt-5 text-xl font-extrabold text-ink-900">{title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-ink-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Join ===== */}
        <section id="join" className="relative scroll-mt-24 px-8 pb-28">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 via-brand-700 to-coral-500 p-14 text-center text-white shadow-lift">
            <div className="absolute inset-0 bg-dots opacity-30" />
            <div className="relative">
              <LogoMark size={64} className="mx-auto animate-float" />
              <h2 className="mt-6 text-4xl font-extrabold">קשר טוב פועל בהזמנה בלבד</h2>
              <p className="mx-auto mt-4 max-w-2xl text-xl leading-relaxed text-white/85">
                כך הקהילה נשארת בטוחה ואמינה. קיבלת קישור הזמנה ממכרה? פתחי אותו — ותוך דקה את בפנים.
              </p>
              <div className="mt-9 inline-flex items-center gap-3 rounded-2xl bg-white/15 px-6 py-4 text-lg font-semibold backdrop-blur">
                <IconMail size={22} />
                אין לך הזמנה? בקשי מחברה שכבר רשומה לשלוח לך קישור
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-ink-900/5 bg-white/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-8 py-10">
          <Logo size={36} />
          <p className="text-base text-ink-500">נבנה באהבה, בשביל הקהילה · © 2026 קשר טוב</p>
        </div>
      </footer>
    </div>
  );
}
