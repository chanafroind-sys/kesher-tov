"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtp, verifyOtp } from "@/lib/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await verifyOtp(email, token);
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(res.error);
      }
    } catch {
      setError("שגיאה באימות הקוד");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {step === "email" ? "התחברות לקשר טוב" : "הזנת קוד אימות"}
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          {step === "email"
            ? "הזיני את כתובת האימייל שלך לקבלת קוד אימות חד-פעמי"
            : info}
        </p>

        {error && (
          <div className="p-4 mb-6 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl leading-relaxed">
            {error}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                כתובת אימייל
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl transition"
            >
              {loading ? "שולח קוד..." : "שליחת קוד אימות"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-slate-700 mb-1">
                קוד אימות בן 6 ספרות
              </label>
              <input
                id="token"
                type="text"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full px-4 py-3 text-center tracking-widest text-xl font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl transition"
            >
              {loading ? "מאמת..." : "כניסה למערכת"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError(null);
              }}
              className="w-full text-sm text-slate-600 hover:underline pt-2"
            >
              שינוי כתובת אימייל
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
