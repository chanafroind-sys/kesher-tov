"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  markHired,
  markFirstSalary,
  listThanks,
  markPaid,
  type ThanksItem,
} from "@/lib/actions/thanks";
import { Button, Card, Badge, Toast, Textarea, EmptyState } from "@/components/ui";

export default function HiredThanksPage() {
  const [step, setStep] = useState<"hired" | "salary" | "pay">("pay");
  const [thanksList, setThanksList] = useState<ThanksItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Active modal / dialog for paying thanks
  const [payingThanks, setPayingThanks] = useState<ThanksItem | null>(null);
  const [gratitudeNote, setGratitudeNote] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await listThanks();
      if (res.ok) {
        setThanksList(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  function handleMarkHired() {
    startTransition(async () => {
      const res = await markHired();
      if (res.ok) {
        setStep("salary");
        setToastMessage("קולולו! מזל טוב ענק על הקבלה לעבודה! 🎉");
      }
    });
  }

  function handleMarkSalary() {
    startTransition(async () => {
      const res = await markFirstSalary();
      if (res.ok) {
        setStep("pay");
        setToastMessage("בשעה טובה על המשכורת הראשונה! כעת נחשפו פרטי התודה של העוזרות.");
      }
    });
  }

  function handleConfirmPaid() {
    if (!payingThanks) return;

    startTransition(async () => {
      const res = await markPaid({
        thanksId: payingThanks.id,
        note: gratitudeNote.trim() || undefined,
      });

      if (res.ok) {
        setThanksList((prev) =>
          prev.map((t) =>
            t.id === payingThanks.id
              ? { ...t, status: "paid", paidAt: new Date().toISOString(), note: gratitudeNote }
              : t
          )
        );
        setToastMessage(`התודה ל${payingThanks.helperName} סומנה כשולמה בהצלחה! מכתב התודה נשלח במייל.`);
        setPayingThanks(null);
        setGratitudeNote("");
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-honey-100 px-3.5 py-1 text-xs font-black text-honey-900 mb-2">
            ✨ בשעה טובה ומוצלחת!
          </span>
          <h1 className="text-3xl font-black text-ink-900">התקבלתי לעבודה · הכרת הטוב</h1>
          <p className="mt-1 text-base text-ink-600">
            סגירת מעגל: תודה למי שפתחה לך את הדלת, רק לאחר קבלת המשכורת הראשונה.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              חזרה ללוח הבקרה ←
            </Button>
          </Link>
        </div>
      </Card>

      {/* Progress Steps Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          className={`p-4 rounded-2xl border-2 transition text-start ${
            step === "hired"
              ? "border-honey-500 bg-honey-50 text-ink-900 shadow-soft"
              : "border-ink-900/10 bg-white text-ink-600"
          }`}
        >
          <span className="text-xs font-black text-honey-700 block mb-1">שלב 1</span>
          <h3 className="font-extrabold text-base">התקבלתי לעבודה 🎉</h3>
          <p className="text-xs text-ink-500 mt-1">עדכון הקהילה והקפאת משימות</p>
        </div>

        <div
          className={`p-4 rounded-2xl border-2 transition text-start ${
            step === "salary"
              ? "border-honey-500 bg-honey-50 text-ink-900 shadow-soft"
              : "border-ink-900/10 bg-white text-ink-600"
          }`}
        >
          <span className="text-xs font-black text-honey-700 block mb-1">שלב 2</span>
          <h3 className="font-extrabold text-base">משכורת ראשונה 💳</h3>
          <p className="text-xs text-ink-500 mt-1">רק לאחר שהמשכורת הראשונה נכנסת</p>
        </div>

        <div
          className={`p-4 rounded-2xl border-2 transition text-start ${
            step === "pay"
              ? "border-brand-500 bg-brand-50 text-ink-900 shadow-soft"
              : "border-ink-900/10 bg-white text-ink-600"
          }`}
        >
          <span className="text-xs font-black text-brand-700 block mb-1">שלב 3</span>
          <h3 className="font-extrabold text-base">סגירת מעגל התודה 🎁</h3>
          <p className="text-xs text-ink-500 mt-1">העברת התודה ומכתב הערכה אישי</p>
        </div>
      </div>

      {/* Milestone Actions (If not yet in pay step) */}
      {step === "hired" && (
        <Card variant="default" className="text-center p-8 space-y-4">
          <span className="text-5xl block animate-bounce">🎊</span>
          <h2 className="text-2xl font-black text-ink-900">מצאת עבודה? בשעה טובה ומוצלחת!</h2>
          <p className="text-ink-600 max-w-lg mx-auto text-sm leading-relaxed">
            כשאת מסמנת שהתקבלת, אנחנו עוצרים פתיחת משימות נוספות ושומרים את פרטי העוזרת.
            אין צורך לשלם כעת שום דבר! דמי התודה ייחשפו רק כשתקבלי את המשכורת הראשונה שלך.
          </p>
          <Button
            variant="primary"
            size="lg"
            loading={isPending}
            onClick={handleMarkHired}
          >
            כן, התקבלתי לעבודה! להמשך ←
          </Button>
        </Card>
      )}

      {step === "salary" && (
        <Card variant="default" className="text-center p-8 space-y-4">
          <span className="text-5xl block">🏦</span>
          <h2 className="text-2xl font-black text-ink-900">האם נכנסה המשכורת הראשונה?</h2>
          <p className="text-ink-600 max-w-lg mx-auto text-sm leading-relaxed">
            קשר טוב בנוי על הגינות מוחלטת: משלמים רק כשזה עבד ורק כשיש לך הכנסה מהעבודה החדשה.
            ברגע שתלחצי, תוכלי לראות את פרטי התשלום שהעוזרת שלך בחרה.
          </p>
          <Button
            variant="primary"
            size="lg"
            loading={isPending}
            onClick={handleMarkSalary}
          >
            כן, נכנסה משכורת ראשונה! הצגת התודות לתשלום ←
          </Button>
        </Card>
      )}

      {/* Step 3: Thanks List and Payment Execution */}
      {step === "pay" && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-ink-900">רשימת התודות לעוזרות שלך</h2>
              <p className="text-sm text-ink-600 mt-0.5">
                העבירי את דמי התודה לפי ההעדפה שהעוזרת הגדירה ושלחי לה מכתב תודה אישי.
              </p>
            </div>
            <Badge variant="brand">{thanksList.length} עוזרות</Badge>
          </div>

          {loading ? (
            <div className="py-12 text-center text-ink-500 font-medium">טוען נתונים...</div>
          ) : thanksList.length === 0 ? (
            <EmptyState
              icon={<span>💐</span>}
              title="אין תודות ממתינות לתשלום"
              description="כל התודות כבר שולמו במלואן או שהעוזרות ויתרו עליהן כחסד."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {thanksList.map((t) => {
                const isPaid = t.status === "paid";
                const isWaived = t.status === "waived" || t.paymentMethod.type === "waive";

                return (
                  <Card
                    key={t.id}
                    variant={isPaid ? "default" : "highlight"}
                    className="flex flex-col justify-between space-y-5"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="grid place-items-center size-12 rounded-2xl bg-brand-100 text-brand-800 font-black text-xl">
                            {t.helperName.charAt(0)}
                          </span>
                          <div>
                            <h3 className="text-xl font-black text-ink-900">{t.helperName}</h3>
                            <p className="text-xs text-ink-500">עזרה בהגשה ל{t.companyName}</p>
                          </div>
                        </div>

                        <div className="text-end">
                          <span className="text-2xl font-black text-honey-600">
                            {isWaived ? "חסד" : `₪${t.amount}`}
                          </span>
                        </div>
                      </div>

                      {/* Payment method details box */}
                      <div className="mt-4 rounded-2xl bg-white/90 border border-ink-900/10 p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-ink-700">
                          <span>אופן קבלת התודה שבחרה:</span>
                          <span className="text-brand-700 font-extrabold">
                            {t.paymentMethod.type === "bank"
                              ? "העברה בנקאית"
                              : t.paymentMethod.type === "cash"
                              ? "במזומן / אישי"
                              : t.paymentMethod.type === "charity"
                              ? "תרומה לצדקה"
                              : "ויתור כחסד"}
                          </span>
                        </div>

                        {t.paymentMethod.details && (
                          <div className="text-xs text-ink-900 font-medium bg-cream/40 p-2.5 rounded-xl border border-ink-900/5 select-all">
                            {t.paymentMethod.details}
                          </div>
                        )}
                      </div>

                      {/* If already paid, show note */}
                      {isPaid && t.note && (
                        <div className="mt-3 text-xs text-mint-800 bg-mint-50 p-3 rounded-xl border border-mint-200">
                          <span className="font-bold block mb-1">המכתב ששלחת לה:</span>
                          &quot;{t.note}&quot;
                        </div>
                      )}
                    </div>

                    {/* Bottom Status / Action */}
                    <div className="pt-2 border-t border-ink-900/10 flex items-center justify-between">
                      {isPaid ? (
                        <Badge variant="mint">✓ שולם ונשלח מכתב תודה</Badge>
                      ) : isWaived ? (
                        <div className="text-xs text-honey-800 font-bold">
                          💖 העוזרת ויתרה על התודה כחסד גמור
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => setPayingThanks(t)}
                        >
                          העברתי את התודה + שליחת מכתב ←
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Modal / Dialog for marking thanks as paid */}
      {payingThanks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-up">
          <Card variant="default" className="max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-lift bg-white">
            <div>
              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                סגירת תודה לעוזרת
              </span>
              <h2 className="text-2xl font-black text-ink-900 mt-2">
                הכרת הטוב ל{payingThanks.helperName}
              </h2>
              <p className="text-xs text-ink-600 mt-1">
                סכום תודה: <strong>₪{payingThanks.amount}</strong> עבור סיוע בחברת {payingThanks.companyName}
              </p>
            </div>

            <div className="rounded-2xl bg-cream/40 border border-ink-900/10 p-4 text-xs space-y-1">
              <span className="font-bold text-ink-800 block">פרטי התשלום:</span>
              <p className="text-ink-700 select-all font-mono">
                {payingThanks.paymentMethod.details || "העברה לפי ההעדפה שהוגדרה"}
              </p>
            </div>

            <div>
              <Textarea
                label="מכתב תודה אישי מהלב (יישלח ישירות למייל של העוזרת)"
                maxLength={300}
                value={gratitudeNote}
                onChange={(e) => setGratitudeNote(e.target.value)}
                placeholder="מרים היקרה, אין לי מילים להודות לך על הדלת שפתחת לי! בזכותך התקבלתי ואני מאושרת..."
                helperText={`${gratitudeNote.length}/300 תווים`}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                loading={isPending}
                onClick={handleConfirmPaid}
                fullWidth
              >
                אישור: העברתי את התשלום ושלחתי מכתב ✓
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setPayingThanks(null)}
              >
                ביטול
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
