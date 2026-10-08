"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  getNotificationPrefs,
  setNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/actions/notifications";
import { Button, Card, Toast, Select } from "@/components/ui";

const FREQUENCY_OPTIONS = [
  {
    id: "instant",
    title: "התראות מיידיות",
    desc: "מייל נשלח מיד כשמישהי פותחת משימה מתאימה (עד 3 מיילים ביום).",
  },
  {
    id: "daily_digest",
    title: "סיכום יומי מרוכז",
    desc: "מייל מרוכז אחד ביום עם כל המשימות החדשות, בשעה שנוחה לך.",
  },
  {
    id: "weekly",
    title: "סיכום שבועי",
    desc: "מייל אחד בימי חמישי לקראת סוף השבוע.",
  },
  {
    id: "paused",
    title: "השהיית התראות (חופשה)",
    desc: "ללא מיילים למשך 30 יום. תמיד תוכלי להפעיל מחדש.",
  },
];

const DIGEST_HOURS = [
  { value: "8", label: "08:00 בבוקר" },
  { value: "12", label: "12:00 בצהריים" },
  { value: "16", label: "16:00 אחה\"צ" },
  { value: "18", label: "18:00 בערב (מומלץ)" },
  { value: "20", label: "20:00 בערב" },
  { value: "21", label: "21:00 בלילה" },
];

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    frequency: "daily_digest",
    digestHour: 18,
    mutedCompanyIds: [],
  });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getNotificationPrefs();
      if (res.ok) {
        setPrefs(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  function handleSave() {
    startTransition(async () => {
      const res = await setNotificationPrefs(prefs);
      if (res.ok) {
        setToastMessage("הגדרות ההתראות עודכנו בהצלחה!");
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
            🔔 הגדרות חשבון
          </span>
          <h1 className="text-3xl font-black text-ink-900">הגדרות התראות ומיילים</h1>
          <p className="mt-1 text-base text-ink-600">
            התאימי את קצב ההודעות והשעות שבהן נוח לך לקבל עדכונים מהקהילה.
          </p>
        </div>

        <Link href="/profile">
          <Button variant="ghost" size="sm">
            ← חזרה לפרופיל
          </Button>
        </Link>
      </Card>

      {/* Main Settings Form */}
      <Card variant="default" className="space-y-8">
        {/* Section 1: Frequency */}
        <div>
          <h2 className="text-xl font-black text-ink-900 mb-2">תדירות קבלת עדכונים</h2>
          <p className="text-sm text-ink-500 mb-4">
            כיצד תרצי שנעדכן אותך כשנשים מחפשות עזרה בחברות שלך?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  setPrefs({
                    ...prefs,
                    frequency: opt.id as NotificationPrefs["frequency"],
                  })
                }
                className={`p-4 rounded-2xl border-2 text-start transition ${
                  prefs.frequency === opt.id
                    ? "border-brand-600 bg-brand-50/70 text-ink-900 shadow-soft"
                    : "border-ink-900/10 bg-white text-ink-700 hover:border-ink-900/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-base">{opt.title}</span>
                  {prefs.frequency === opt.id && (
                    <span className="text-brand-600 font-bold">✓</span>
                  )}
                </div>
                <p className="text-xs text-ink-500 leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Hour picker if Daily Digest */}
        {prefs.frequency === "daily_digest" && (
          <div className="p-4 bg-cream/40 rounded-2xl border border-ink-900/10 space-y-3">
            <h3 className="font-bold text-sm text-ink-900">באיזו שעה לשלוח את הסיכום היומי?</h3>
            <div className="max-w-xs">
              <Select
                value={String(prefs.digestHour)}
                onChange={(e) =>
                  setPrefs({ ...prefs, digestHour: Number(e.target.value) })
                }
                options={DIGEST_HOURS}
              />
            </div>
            <p className="text-xs text-ink-500">
              אם לא תהיה פעילות חדשה באותו יום בחברות שלך — לא יישלח מייל מיותר.
            </p>
          </div>
        )}

        {/* Section 3: Shabbat & Holidays Policy */}
        <div className="rounded-2xl border border-honey-200 bg-honey-50/70 p-5 space-y-2">
          <div className="flex items-center gap-2 text-honey-900 font-bold text-base">
            <span>🕯️🕯️</span>
            <span>שקט מוחלט בשבתות ומועדי ישראל</span>
          </div>
          <p className="text-xs text-honey-800 leading-relaxed">
            כל ההתראות והמיילים מושהים אוטומטית שעה וחצי לפני כניסת השבת והחג.
            כל הפעילות שהתרחשה נאספת ונשלחת בסיכום מרוכז רק לאחר צאת השבת והחג.
          </p>
        </div>

        {/* Section 4: Muted companies shortcut */}
        <div className="border-t border-ink-900/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-ink-900">השתקת התראות לפי חברה ספציפית</h3>
            <p className="text-xs text-ink-500">
              רוצה לקבל עדכונים רק מחברות מסוימות? תוכלי להשתיק כל חברה ישירות בדף החברות שלי.
            </p>
          </div>

          <Link href="/companies">
            <Button variant="secondary" size="sm">
              לניהול החברות שלי ←
            </Button>
          </Link>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-ink-900/10 flex justify-end">
          <Button
            variant="primary"
            size="lg"
            loading={isPending}
            onClick={handleSave}
          >
            שמירת הגדרות התראות ←
          </Button>
        </div>
      </Card>
    </div>
  );
}
