"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTask, type TaskRequirement } from "@/lib/actions/tasks";
import { type CompanySearchResult } from "@/lib/actions/companies";
import { Button, Card, Input, Textarea, Toast, Badge } from "@/components/ui";
import { CompanyPicker } from "@/components/company";

const HELP_TYPES = [
  { id: "הגשת קו\"ח", label: "הגשת קו\"ח מבפנים", desc: "הכי מומלץ - עוקף את הסינון האוטומטי" },
  { id: "מידע על החברה", label: "מידע פנימי", desc: "פרטים על התפקיד, התרבות והדרישות" },
  { id: "הכנה לראיון", label: "הכנה לראיון", desc: "טיפים ספציפיים לראיונות בחברה זו" },
];

const THANKS_PRESETS = [
  { amount: 20, title: "₪20", subtitle: "תודה קטנה" },
  { amount: 50, title: "₪50", subtitle: "תודה חמה" },
  { amount: 100, title: "₪100", subtitle: "תודה גדולה", popular: true },
  { amount: 0, title: "חסד", subtitle: "סיוע ללא תמורה" },
];

export default function NewTaskPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedCompany, setSelectedCompany] = useState<CompanySearchResult | null>(null);
  const [helpTypes, setHelpTypes] = useState<string[]>(["הגשת קו\"ח"]);
  const [jobUrl, setJobUrl] = useState("");
  const [freeText, setFreeText] = useState("");
  const [thanksAmount, setThanksAmount] = useState<number>(100);

  // Requirements & Match scoring
  const [requirements, setRequirements] = useState<TaskRequirement[]>([
    { text: "ניסיון מעשי בתחום המשרה", required: true, match: "full" },
    { text: "שליטה בכלים ובשפות הרלוונטיות", required: true, match: "full" },
    { text: "המלצות או תיק עבודות / קורות חיים מעודכנים", required: false, match: "full" },
  ]);
  const [newReqText, setNewReqText] = useState("");
  const [newReqRequired, setNewReqRequired] = useState(false);

  // Calculate Match Score based on architecture formula
  const matchScore = calculateMatchScore(requirements);

  function calculateMatchScore(reqs: TaskRequirement[]): number {
    if (reqs.length === 0) return 100;
    let totalWeight = 0;
    let weightedPoints = 0;

    for (const r of reqs) {
      const weight = r.required ? 2 : 1;
      const points = r.match === "full" ? 100 : r.match === "partial" ? 50 : 0;
      totalWeight += weight;
      weightedPoints += weight * points;
    }

    if (totalWeight === 0) return 100;
    return Math.round((weightedPoints / (totalWeight * 100)) * 100);
  }

  function handleToggleHelpType(type: string) {
    if (helpTypes.includes(type)) {
      if (helpTypes.length === 1) {
        setError("חובה לבחור לפחות סוג עזרה אחד");
        return;
      }
      setHelpTypes(helpTypes.filter((t) => t !== type));
    } else {
      setHelpTypes([...helpTypes, type]);
    }
    setError(null);
  }

  function handleAddRequirement(e: React.FormEvent) {
    e.preventDefault();
    if (!newReqText.trim()) return;

    setRequirements([
      ...requirements,
      {
        text: newReqText.trim(),
        required: newReqRequired,
        match: "full",
      },
    ]);
    setNewReqText("");
    setNewReqRequired(false);
  }

  function handleRemoveRequirement(index: number) {
    setRequirements(requirements.filter((_, i) => i !== index));
  }

  function handleUpdateReqMatch(index: number, match: "full" | "partial" | "no") {
    setRequirements(
      requirements.map((r, i) => (i === index ? { ...r, match } : r))
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedCompany) {
      setError("נא לבחור חברה מהרשימה");
      return;
    }

    if (helpTypes.length === 0) {
      setError("נא לבחור לפחות סוג עזרה אחד");
      return;
    }

    startTransition(async () => {
      const res = await createTask({
        companyId: selectedCompany.id,
        helpTypes,
        jobUrl: jobUrl.trim() || undefined,
        freeText: freeText.trim() || undefined,
        thanksAmount,
        requirements,
      });

      if (res.ok) {
        setToastMessage("המשימה נפתחה בהצלחה! עוזרות מהחברה יקבלו על כך עדכון.");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1200);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          type="success"
          title={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header Banner */}
      <Card variant="highlight" className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800 mb-2">
            🔍 פתיחת בקשת עזרה
          </span>
          <h1 className="text-3xl font-black text-ink-900">פתיחת משימה חדשה</h1>
          <p className="mt-1 text-base text-ink-600">
            בחרי חברה ומשרה. עובדת מהחברה תוכל להגיש את קורות החיים שלך מבפנים ולסייע לך.
          </p>
        </div>

        <div className="text-center sm:text-end">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ביטול וחזרה ←
            </Button>
          </Link>
        </div>
      </Card>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold text-start"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Choose Company & Job */}
        <Card variant="default" className="space-y-6">
          <div className="border-b border-ink-900/10 pb-4">
            <h2 className="text-2xl font-black text-ink-900">1. החברה והמשרה המבוקשת</h2>
            <p className="text-sm text-ink-500 mt-1">
              איפה ראית משרה שמתאימה לך?
            </p>
          </div>

          {/* Company Picker */}
          <div>
            <CompanyPicker
              value={selectedCompany}
              onChange={setSelectedCompany}
              label="חברה *"
              placeholder="חפשי חברה (למשל: צ'ק פוינט, רפאל, אלתא...)"
            />
          </div>

          {/* Job URL */}
          <div>
            <Input
              label="קישור למודעת הדרושים (אופציונלי)"
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://company.com/careers/job-123"
              helperText="העוזרת תוכל לראות בדיוק לאיזה תקן את מגישה"
            />
          </div>

          {/* Help Types */}
          <div>
            <label className="block text-sm font-bold text-ink-900 mb-2">
              במה תרצי שהעוזרת תסייע? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {HELP_TYPES.map((ht) => {
                const isSelected = helpTypes.includes(ht.id);
                return (
                  <button
                    key={ht.id}
                    type="button"
                    onClick={() => handleToggleHelpType(ht.id)}
                    className={`p-4 rounded-2xl border-2 text-start transition ${
                      isSelected
                        ? "border-brand-600 bg-brand-50/70 text-ink-900 shadow-soft"
                        : "border-ink-900/10 bg-white text-ink-700 hover:border-ink-900/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm">{ht.label}</span>
                      {isSelected && <span className="text-brand-600 font-bold">✓</span>}
                    </div>
                    <p className="text-xs text-ink-500">{ht.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Step 2: Match Checking & Requirements */}
        <Card variant="default" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-900/10 pb-4">
            <div>
              <h2 className="text-2xl font-black text-ink-900">2. בדיקת התאמה לדרישות</h2>
              <p className="text-sm text-ink-500 mt-1">
                כדי שהעוזרת תמליץ עליך בביטחון, בדקי את התאמתך לדרישות המרכזיות.
              </p>
            </div>

            {/* Live Match Score Gauge */}
            <div className="flex items-center gap-3 bg-cream/80 border border-ink-900/10 rounded-2xl px-5 py-3 self-start sm:self-auto">
              <div className="text-center">
                <span className="block text-2xl font-black text-brand-700">
                  {matchScore}%
                </span>
                <span className="text-xs font-bold text-ink-600">ציון התאמה</span>
              </div>
              <Badge variant={matchScore >= 80 ? "mint" : matchScore >= 50 ? "honey" : "coral"}>
                {matchScore >= 80 ? "התאמה גבוהה" : matchScore >= 50 ? "התאמה בינונית" : "התאמה נמוכה"}
              </Badge>
            </div>
          </div>

          {/* Requirements List */}
          <div className="space-y-3">
            {requirements.map((req, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-ink-900/10 bg-white shadow-soft"
              >
                <div className="flex items-center gap-2 flex-1">
                  {req.required && (
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      חובה
                    </span>
                  )}
                  <span className="text-sm font-semibold text-ink-900">{req.text}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-ink-50 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleUpdateReqMatch(idx, "full")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                        req.match === "full"
                          ? "bg-mint-600 text-white shadow-soft"
                          : "text-ink-600 hover:text-ink-900"
                      }`}
                    >
                      מלאה (100%)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateReqMatch(idx, "partial")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                        req.match === "partial"
                          ? "bg-honey-500 text-ink-900 shadow-soft"
                          : "text-ink-600 hover:text-ink-900"
                      }`}
                    >
                      חלקית (50%)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateReqMatch(idx, "no")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                        req.match === "no"
                          ? "bg-rose-500 text-white shadow-soft"
                          : "text-ink-600 hover:text-ink-900"
                      }`}
                    >
                      אין (0%)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    className="size-8 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 grid place-items-center transition"
                    title="מחיקת דרישה"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add custom requirement */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <input
              type="text"
              value={newReqText}
              onChange={(e) => setNewReqText(e.target.value)}
              placeholder="הוסיפי דרישה נוספת מהמודעה (למשל: 3 שנות ניסיון ב-Python)..."
              className="flex-1 rounded-xl border border-ink-900/15 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
            />
            <label className="flex items-center gap-2 text-xs font-bold text-ink-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newReqRequired}
                onChange={(e) => setNewReqRequired(e.target.checked)}
                className="size-4 rounded border-ink-900/20 text-brand-600"
              />
              דרישת חובה
            </label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddRequirement}
            >
              + הוספת דרישה
            </Button>
          </div>
        </Card>

        {/* Step 3: Note & Thanks Mechanism */}
        <Card variant="default" className="space-y-6">
          <div className="border-b border-ink-900/10 pb-4">
            <h2 className="text-2xl font-black text-ink-900">3. מילים אישיות ומנגנון התודה</h2>
            <p className="text-sm text-ink-500 mt-1">
              הכרת הטוב קהילתית — משלמות רק אחרי שמתקבלים ורק אחרי משכורת ראשונה.
            </p>
          </div>

          {/* Free Text */}
          <div>
            <Textarea
              label="כמה מילים אישיות לעוזרת (אופציונלי)"
              maxLength={280}
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="למשל: כבר עברתי על קורות החיים שלי עם מנטורית, אשמח למידע על צוות הפיתוח הספציפי..."
              helperText={`${freeText.length}/280 תווים · השם שלך ייחשף רק לאחר שהעוזרת תיקח את המשימה`}
            />
          </div>

          {/* Thanks Amount Presets */}
          <div>
            <label className="block text-sm font-bold text-ink-900 mb-2">
              דמי תודה להכרת הטוב (משולם רק אחרי משכורת ראשונה!)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {THANKS_PRESETS.map((preset) => {
                const isSelected = thanksAmount === preset.amount;
                return (
                  <button
                    key={preset.amount}
                    type="button"
                    onClick={() => setThanksAmount(preset.amount)}
                    className={`p-4 rounded-2xl border-2 text-center transition ${
                      isSelected
                        ? "border-honey-500 bg-honey-50/80 text-ink-900 shadow-soft"
                        : "border-ink-900/10 bg-white text-ink-700 hover:border-ink-900/20"
                    }`}
                  >
                    <div className="text-2xl font-black">{preset.title}</div>
                    <div className="text-xs text-ink-600 mt-1 font-semibold">{preset.subtitle}</div>
                    {preset.popular && (
                      <span className="mt-1 inline-block text-[10px] font-bold text-honey-800 bg-honey-200 px-2 py-0.5 rounded-full">
                        מומלץ
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-honey-50/80 border border-honey-200 p-4 text-xs text-honey-900 leading-relaxed">
            💡 <strong>איך זה עובד?</strong> דמי התודה אינם נגבים עכשיו, לא כשמגישים ולא כשמתקבלים. רק לאחר
            שהתקבלת ונכנסה משכורת ראשונה, תיפתח לך אפשרות להודות לעוזרת (בהעברה בנקאית, במזומן, או בתרומה לצדקה
            לפי בחירתה).
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4">
          <Link href="/">
            <Button variant="ghost" size="md">
              ביטול
            </Button>
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isPending}
          >
            פתיחת המשימה ושליחה לעוזרות ←
          </Button>
        </div>
      </form>
    </div>
  );
}
