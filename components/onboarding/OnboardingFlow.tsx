"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Chip } from "@/components/ui";

export interface OnboardingFlowProps {
  invitedBy?: string;
  onFinish?: () => void;
}

export function OnboardingFlow({ invitedBy, onFinish }: OnboardingFlowProps) {
  const router = useRouter();
  const [role, setRole] = useState<"helper" | "seeker" | "both">("helper");
  const [loading, setLoading] = useState(false);

  function handleComplete() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onFinish) {
        onFinish();
      } else {
        if (role === "helper") {
          router.push("/companies");
        } else if (role === "seeker") {
          router.push("/tasks/new");
        } else {
          router.push("/profile");
        }
      }
    }, 400);
  }

  return (
    <Card variant="highlight" className="max-w-xl mx-auto text-center animate-fade-up">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-honey-100 px-3.5 py-1 text-sm font-bold text-honey-800 mb-4">
        ברוכה הבאה לקהילת &quot;קשר טוב&quot;!
      </span>

      {invitedBy && (
        <p className="text-base text-ink-600 mb-6 font-medium">
          הוזמנת על ידי <strong className="text-ink-900">{invitedBy}</strong>
        </p>
      )}

      <h2 className="text-3xl font-black text-ink-900 mb-3">איך תרצי לפעול בקהילה?</h2>
      <p className="text-base text-ink-600 mb-8 max-w-md mx-auto leading-relaxed">
        ההרשמה כעוזרת לוקחת פחות מדקה. תמיד תוכלי לשנות ולהוסיף תפקיד בהגדרות הפרופיל שלך.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <Chip
          selected={role === "helper"}
          onClick={() => setRole("helper")}
          className="justify-center py-4 text-center flex-col"
        >
          <span className="text-2xl mb-1">🤝</span>
          <span className="font-bold">אני רוצה לעזור</span>
          <span className="text-xs text-ink-500 font-normal">הגשה ומידע מבפנים</span>
        </Chip>

        <Chip
          selected={role === "seeker"}
          onClick={() => setRole("seeker")}
          className="justify-center py-4 text-center flex-col"
        >
          <span className="text-2xl mb-1">🔍</span>
          <span className="font-bold">אני מחפשת עבודה</span>
          <span className="text-xs text-ink-500 font-normal">סיוע בהגשת קו&quot;ח</span>
        </Chip>

        <Chip
          selected={role === "both"}
          onClick={() => setRole("both")}
          className="justify-center py-4 text-center flex-col"
        >
          <span className="text-2xl mb-1">✨</span>
          <span className="font-bold">גם וגם</span>
          <span className="text-xs text-ink-500 font-normal">עוזרת ונעזרת יחד</span>
        </Chip>
      </div>

      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          onClick={handleComplete}
        >
          {role === "helper" ? "המשך לבחירת החברות שלי ←" : "המשך להשלמת הפרופיל ←"}
        </Button>
      </div>
    </Card>
  );
}
