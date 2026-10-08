"use client";

import { useState, useEffect, useTransition, use } from "react";
import Link from "next/link";
import {
  getTask,
  claimTask,
  markDone,
  closeTask,
  type TaskDetails,
} from "@/lib/actions/tasks";
import { rateMatch, flagNotClosed, flagNoReply } from "@/lib/actions/ratings";
import {
  Button,
  Card,
  Badge,
  Toast,
  Dialog,
  Avatar,
  Select,
} from "@/components/ui";

interface TaskPageProps {
  params: Promise<{ id: string }>;
}

export default function TaskDetailsPage({ params }: TaskPageProps) {
  const resolvedParams = use(params);
  const taskId = resolvedParams.id;

  const [task, setTask] = useState<TaskDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [selectedHelperToCredit, setSelectedHelperToCredit] = useState<string>("");
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [rateScore, setRateScore] = useState<number>(100);

  // Celebration state (CSS effect)
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    async function loadTaskData() {
      setLoading(true);
      const res = await getTask(taskId);
      if (res.ok) {
        setTask(res.data);
        if (res.data.claims.length > 0) {
          setSelectedHelperToCredit(res.data.claims[0].helperId);
        }
      }
      setLoading(false);
    }
    loadTaskData();
  }, [taskId]);

  function triggerCelebration() {
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 3000);
  }

  function handleClaim() {
    startTransition(async () => {
      const res = await claimTask(taskId);
      if (res.ok) {
        setToastMessage("לקחת את המשימה בהצלחה! פרטי הנעזרת גלויים כעת.");
        triggerCelebration();
        // Refresh local task state
        const refreshed = await getTask(taskId);
        if (refreshed.ok) setTask(refreshed.data);
      }
    });
  }

  function handleMarkDone() {
    startTransition(async () => {
      const res = await markDone(taskId);
      if (res.ok) {
        setToastMessage("סימנת בהצלחה שסיימת את חלקך במשימה!");
        triggerCelebration();
      }
    });
  }

  function handleCloseTaskConfirm() {
    startTransition(async () => {
      const res = await closeTask(taskId, selectedHelperToCredit || null);
      if (res.ok) {
        setCloseDialogOpen(false);
        setToastMessage("המשימה נסגרה בהצלחה! תודה רבה.");
        triggerCelebration();
        const refreshed = await getTask(taskId);
        if (refreshed.ok) setTask(refreshed.data);
      }
    });
  }

  function handleRateMatchConfirm() {
    startTransition(async () => {
      const res = await rateMatch({
        taskId,
        score: Number(rateScore),
      });
      if (res.ok) {
        setRateDialogOpen(false);
        setToastMessage("הדירוג נשלח בהצלחה! תודה על המשוב.");
      }
    });
  }

  function handleFlagNoReply(helperId: string) {
    startTransition(async () => {
      const res = await flagNoReply({
        taskId,
        targetUserId: helperId,
        reason: "עוזרת לקחה משימה ולא יצרה קשר",
      });
      if (res.ok) {
        setToastMessage("הדיווח נרשם במערכת.");
      }
    });
  }

  function handleFlagNotClosed() {
    startTransition(async () => {
      if (!task) return;
      const res = await flagNotClosed({
        taskId,
        targetUserId: task.seekerId,
        reason: "עזרתי והנעזרת לא סגרה את המשימה עלי",
      });
      if (res.ok) {
        setToastMessage("הדיווח נרשם במערכת.");
      }
    });
  }

  if (loading) {
    return (
      <div className="py-20 text-center font-bold text-ink-700">טוען פרטי משימה...</div>
    );
  }

  if (!task) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-black text-rose-700">המשימה לא נמצאה</h2>
        <Link href="/" className="mt-4 inline-block text-brand-700 font-semibold underline">
          חזרה לדף הבית
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up text-start">
      {/* Toast */}
      {toastMessage && (
        <Toast
          type="success"
          title={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Celebration CSS Banner */}
      {celebrating && (
        <div className="rounded-3xl bg-gradient-to-r from-honey-300 via-brand-500 to-coral-400 p-4 text-center text-white font-extrabold shadow-glow animate-pulse">
          🎉 כל הכבוד! הפעולה עודכנה בהצלחה במערכת הקהילה!
        </div>
      )}

      {/* Header Info Card */}
      <Card variant="highlight">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-ink-900">{task.companyName}</span>
              <Badge variant={task.status === "open" ? "brand" : "honey"}>
                {task.status === "open" ? "פתוחה לעזרה" : "בתהליך"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-ink-600">
              פורסמה בתאריך {new Date(task.createdAt).toLocaleDateString("he-IL")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white border border-ink-900/10 px-4 py-2 text-center shadow-soft">
              <span className="block text-xl font-bold text-brand-700">{task.matchScore}%</span>
              <span className="text-xs text-ink-500">התאמה מחושבת</span>
            </div>
            <div className="rounded-2xl bg-white border border-ink-900/10 px-4 py-2 text-center shadow-soft">
              <span className="block text-xl font-bold text-honey-600">₪{task.thanksAmount}</span>
              <span className="text-xs text-ink-500">תודה לאחר משכורת</span>
            </div>
          </div>
        </div>

        {/* Requirements Box */}
        <div className="mt-6 pt-6 border-t border-ink-900/10">
          <h3 className="font-bold text-base text-ink-900 mb-3">דרישות המשרה והתאמת הנעזרת:</h3>
          <div className="space-y-2">
            {task.requirements.map((req, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 rounded-xl bg-white/70 p-3 border border-ink-900/5 text-sm"
              >
                <div>
                  <span className="font-semibold text-ink-900">{req.text}</span>
                  {req.required && (
                    <span className="ms-2 text-xs font-bold text-rose-600">(חובה)</span>
                  )}
                  {req.cvEvidence && (
                    <span className="block text-xs text-ink-500 mt-0.5">ניסיון: {req.cvEvidence}</span>
                  )}
                </div>
                <Badge variant={req.match === "full" ? "mint" : "honey"}>
                  {req.match === "full" ? "התאמה מלאה" : "חלקית"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {task.freeText && (
          <div className="mt-6 rounded-2xl bg-white/60 p-4 border border-ink-900/5">
            <span className="text-xs font-bold text-ink-500 block mb-1">הודעה מהנעזרת:</span>
            <p className="text-sm text-ink-700 leading-relaxed">{task.freeText}</p>
          </div>
        )}
      </Card>

      {/* Role 1: Helper View (פעולות עוזרת) */}
      <Card variant="default">
        <h2 className="text-2xl font-black text-ink-900 mb-2">אזור העוזרת (עובדת בחברה)</h2>
        <p className="text-sm text-ink-500 mb-6">
          באפשרותך לקחת את המשימה, להגיש את קורות החיים מבפנים, או לייעץ לנעזרת לקראת הראיון.
        </p>

        {task.seekerName ? (
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar name={task.seekerName} size="lg" />
                <div>
                  <span className="text-xs font-bold text-brand-700 block">לקחת את המשימה! פרטי הנעזרת:</span>
                  <h4 className="text-xl font-black text-ink-900">{task.seekerName}</h4>
                  <p className="text-xs text-ink-600">טלפון ומייל גלויים עבורך לסיוע ישיר</p>
                </div>
              </div>

              <a
                href="#cv-download"
                onClick={(e) => {
                  e.preventDefault();
                  alert("קורות החיים של הנעזרת נפתחים לצפייה מאובטחת.");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white shadow-soft hover:bg-brand-800"
              >
                📄 צפייה בקורות חיים (PDF)
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={handleMarkDone}
                loading={isPending}
              >
                ✓ סימנתי: עשיתי את שלי (הגשתי / סייעתי)
              </Button>

              <Button
                variant="secondary"
                onClick={() => setRateDialogOpen(true)}
              >
                ⭐ האם ההתאמה הייתה מדויקת?
              </Button>

              <Button
                variant="ghost"
                onClick={handleFlagNotClosed}
                className="text-xs text-ink-500"
              >
                עזרתי והיא לא סגרה עליי
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <p className="text-base text-ink-700 font-medium max-w-md mx-auto leading-relaxed">
              הנעזרת מחכה לעזרה בחברה שלך. עד 3 עוזרות יכולות לקחת כל משימה.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleClaim}
              loading={isPending}
            >
              🤝 אני יכולה לעזור (לקיחת משימה)
            </Button>
          </div>
        )}
      </Card>

      {/* Role 2: Seeker View (פעולות נעזרת - מי לקחה + סגירת משימה) */}
      <Card variant="default">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-black text-ink-900">אזור הנעזרת (המשימה שלי)</h2>
            <p className="text-sm text-ink-500">עקבי אחרי עוזרות שלקחו את המשימה וסגרי מעגל.</p>
          </div>

          <Button
            variant="primary"
            onClick={() => setCloseDialogOpen(true)}
          >
            🏁 סגירת משימה
          </Button>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-sm text-ink-700">עוזרות שלקחו את המשימה עד כה:</h4>
          {task.claims.length === 0 ? (
            <p className="text-sm text-ink-500 py-3">עדיין לא נלקחה משימה ע&quot;י עוזרת. עדכונים יישלחו במייל.</p>
          ) : (
            task.claims.map((claim) => (
              <div
                key={claim.helperId}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-cream/50 border border-ink-900/10"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={claim.helperName} size="md" />
                  <div>
                    <h5 className="font-bold text-base text-ink-900">{claim.helperName}</h5>
                    <span className="text-xs text-ink-500">
                      לקחה בתאריך: {new Date(claim.claimedAt).toLocaleDateString("he-IL")}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFlagNoReply(claim.helperId)}
                  className="text-xs text-rose-700 hover:bg-rose-50"
                >
                  לקחה ולא חזרה אליי
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Dialog 1: Close Task */}
      <Dialog
        open={closeDialogOpen}
        onClose={() => setCloseDialogOpen(false)}
        title="סגירת משימה"
        description="סמני מי מהעוזרות סייעה לך כדי ליצור עבורה את דמי התודה (שישולמו רק לאחר משכורת ראשונה)."
      >
        <div className="space-y-4">
          <Select
            label="בחרי את העוזרת שסייעה לך:"
            value={selectedHelperToCredit}
            onChange={(e) => setSelectedHelperToCredit(e.target.value)}
            options={[
              ...task.claims.map((c) => ({
                value: c.helperId,
                label: `${c.helperName} (עוזרת)`,
              })),
              { value: "", label: "אף אחת לא סייעה / סגירה ללא עוזרת" },
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-ink-900/10">
            <Button variant="ghost" onClick={() => setCloseDialogOpen(false)}>
              ביטול
            </Button>
            <Button
              variant="primary"
              onClick={handleCloseTaskConfirm}
              loading={isPending}
            >
              אישור וסגירת משימה
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Dialog 2: Rate Match */}
      <Dialog
        open={rateDialogOpen}
        onClose={() => setRateDialogOpen(false)}
        title="דירוג התאמת המשרה"
        description="כעוזרת, עד כמה קורות החיים והניסיון של הנעזרת תאמו בפועל את דרישות המשרה?"
      >
        <div className="space-y-4">
          <Select
            label="ציון התאמה:"
            value={String(rateScore)}
            onChange={(e) => setRateScore(Number(e.target.value))}
            options={[
              { value: "100", label: "100% - התאמה מצוינת ומדויקת" },
              { value: "75", label: "75% - התאמה טובה עם פערים קלים" },
              { value: "50", label: "50% - התאמה חלקית בלבד" },
              { value: "25", label: "25% - פער משמעותי מדרישות המשרה" },
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-ink-900/10">
            <Button variant="ghost" onClick={() => setRateDialogOpen(false)}>
              ביטול
            </Button>
            <Button
              variant="primary"
              onClick={handleRateMatchConfirm}
              loading={isPending}
            >
              שליחת דירוג
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
