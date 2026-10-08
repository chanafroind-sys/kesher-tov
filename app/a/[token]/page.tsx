"use client";

import { useState, useTransition, use } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button, Card } from "@/components/ui";

interface ActionTokenPageProps {
  params: Promise<{ token: string }>;
}

export default function ActionTokenPage({ params }: ActionTokenPageProps) {
  const { token } = use(params);
  const [isPending, startTransition] = useTransition();
  const [executed, setExecuted] = useState(false);

  function handleExecute() {
    startTransition(async () => {
      // Simulate verifying signed action token
      await new Promise((r) => setTimeout(r, 600));
      setExecuted(true);
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-cream/40 animate-fade-up">
      <div className="w-full max-w-lg">
        <Card variant="default" className="p-8 sm:p-10 shadow-lift text-center">
          <div className="flex justify-center mb-6">
            <Link href="/" aria-label="לדף הבית">
              <Logo size={46} />
            </Link>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3.5 py-1 text-xs font-bold text-brand-800 mb-4">
            פעולה ישירה מהמייל
          </span>

          <h1 className="text-3xl font-black text-ink-900 mb-2">
            {executed ? "הפעולה בוצעה בהצלחה!" : "אישור ביצוע פעולה"}
          </h1>

          <p className="text-base text-ink-600 mb-6 leading-relaxed max-w-sm mx-auto">
            {executed
              ? "תודה רבה! הפעולה עודכנה במערכת ונשלח עדכון לחברת הקהילה."
              : "הגעת לכאן מקישור במייל. כדי להגן עליך מפני סורקי מיילים אוטומטיים, נדרשת לחיצה אחת לאישור."}
          </p>

          {!executed ? (
            <div className="space-y-4">
              <div className="p-4 bg-cream/50 rounded-2xl border border-ink-900/10 text-xs text-ink-600 font-mono select-all">
                מזהה פעולה: {token}
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={isPending}
                onClick={handleExecute}
              >
                אישור וביצוע הפעולה עכשיו ←
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-mint-50 rounded-2xl border border-mint-200 text-sm font-bold text-mint-800">
                ✓ הפעולה נרשמה בהצלחה במערכת
              </div>

              <Link href="/">
                <Button variant="primary" size="lg" fullWidth>
                  מעבר ללוח הבקרה הראשי ←
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-ink-900/5 text-xs text-ink-500">
            קשר טוב · מאובטח ומותאם לסינון אינטרנט כשר
          </div>
        </Card>
      </div>
    </main>
  );
}
