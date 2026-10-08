"use client";

import { useState, useRef, useEffect, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { sendOtp, verifyOtp } from "@/lib/actions/auth";
import { Button, Card, Input } from "@/components/ui";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { Logo } from "@/components/brand/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitedByParam = searchParams.get("invitedBy");
  const returnUrlParam = searchParams.get("returnUrl") || "/";

  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"email" | "otp" | "welcome_choice">("email");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const digitInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first digit input when transitioning to OTP
  useEffect(() => {
    if (step === "otp") {
      digitInputsRef.current[0]?.focus();
    }
  }, [step]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await sendOtp(email);
        if (res.ok) {
          setStep("otp");
          setInfo(`קוד אימות בן 6 ספרות נשלח לכתובת ${email}`);
        } else {
          setError(res.error);
        }
      } catch {
        setError("שגיאה בתקשורת עם השרת");
      }
    });
  }

  function handleDigitChange(index: number, val: string) {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    // Single digit or pasted code
    if (clean.length === 1) {
      const next = [...otpDigits];
      next[index] = clean;
      setOtpDigits(next);

      // Auto-advance to next input
      if (index < 5) {
        digitInputsRef.current[index + 1]?.focus();
      }

      // If full 6 digits completed, auto-trigger verify
      if (next.every((d) => d.length === 1)) {
        triggerVerification(next.join(""));
      }
    } else if (clean.length === 6) {
      // Pasted full OTP
      const parts = clean.split("");
      setOtpDigits(parts);
      digitInputsRef.current[5]?.focus();
      triggerVerification(clean);
    }
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      digitInputsRef.current[index - 1]?.focus();
    }
  }

  function triggerVerification(fullToken: string) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await verifyOtp(email, fullToken);
        if (res.ok) {
          if (res.data.isNewUser) {
            setStep("welcome_choice");
          } else {
            router.push(returnUrlParam);
            router.refresh();
          }
        } else {
          setError(res.error);
        }
      } catch {
        setError("שגיאה באימות הקוד");
      }
    });
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = otpDigits.join("");
    if (token.length !== 6) {
      setError("נא להזין קוד בן 6 ספרות במלואו");
      return;
    }
    triggerVerification(token);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-cream/40">
      <div className="w-full max-w-lg">
        {step === "welcome_choice" ? (
          <OnboardingFlow invitedBy={invitedByParam || undefined} />
        ) : (
          <Card variant="default" className="shadow-lift p-8 sm:p-10 text-center">
            <div className="flex justify-center mb-6">
              <Link href="/" aria-label="לדף הבית">
                <Logo size={46} />
              </Link>
            </div>

            {invitedByParam && (
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-honey-300 bg-honey-50 px-4 py-1.5 text-sm font-semibold text-honey-800">
                <span>💌 הוזמנת על ידי {invitedByParam}</span>
              </div>
            )}

            <h1 className="text-3xl font-black text-ink-900 mb-2">
              {step === "email" ? "כניסה והרשמה לקשר טוב" : "הזנת קוד אימות"}
            </h1>
            <p className="text-base text-ink-600 mb-8 max-w-sm mx-auto leading-relaxed">
              {step === "email"
                ? "הזיני את כתובת האימייל שלך לקבלת קוד אימות חד-פעמי (ללא צורך בסיסמה)."
                : info}
            </p>

            {error && (
              <div
                role="alert"
                className="p-4 mb-6 text-sm font-medium text-rose-800 bg-rose-50 border border-rose-200 rounded-2xl leading-relaxed text-start"
              >
                {error}
              </div>
            )}

            {step === "email" ? (
              <form onSubmit={handleSendOtp} className="space-y-6 text-start">
                <Input
                  label="כתובת אימייל"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoFocus
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isPending}
                >
                  שליחת קוד אימות למייל ←
                </Button>
              </form>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div>
                  <label className="block text-base font-bold text-ink-900 mb-3 text-center">
                    קוד אימות בן 6 ספרות
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          digitInputsRef.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        className="size-12 sm:size-14 text-center text-2xl font-bold font-mono rounded-2xl border-2 border-ink-900/15 bg-white text-ink-900 focus:border-brand-600 focus:ring-4 focus:ring-brand-100 focus:outline-none shadow-soft transition"
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isPending}
                >
                  אימות והמשך ←
                </Button>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep("email");
                      setError(null);
                      setOtpDigits(["", "", "", "", "", ""]);
                    }}
                  >
                    שינוי כתובת אימייל
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-ink-900/5 text-xs text-ink-500">
              הכניסה מאובטחת וללא סיסמאות · בהזמנה בלבד
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center p-6 bg-cream/40">
          <div className="text-center font-bold text-ink-700">טוען...</div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

