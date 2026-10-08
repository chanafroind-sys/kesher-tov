"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProfile, updateProfile, setPaymentPreference, deleteAccount, type ProfileData } from "@/lib/actions/profile";
import { Button, Card, Input, Select, Badge, Toast, Avatar } from "@/components/ui";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [field, setField] = useState("");
  const [years, setYears] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  // Payment preference
  const [paymentType, setPaymentType] = useState<"bank" | "cash" | "charity" | "waive">("bank");
  const [paymentDetails, setPaymentDetails] = useState("");

  // CV Upload state
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [cvSuccess, setCvSuccess] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadData() {
      const res = await getProfile();
      if (res.ok) {
        setProfile(res.data);
        setFullName(res.data.fullName);
        setPhone(res.data.phone || "");
        setCity(res.data.city || "");
        setField(res.data.field || "Full Stack");
        setYears(res.data.yearsOfExperience || 0);
        setPaymentType(res.data.paymentPreference.type);
        setPaymentDetails(res.data.paymentPreference.details || "");
      }
    }
    loadData();
  }, []);

  function handleCvChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCvError(null);
    setCvSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: PDF only
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setCvError("ניתן להעלות קבצי PDF בלבד");
      return;
    }

    // Validation: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setCvError("גודל הקובץ חורג מ-5MB (הגודל הנוכחי: " + (file.size / (1024 * 1024)).toFixed(1) + "MB)");
      return;
    }

    setCvFile(file);
    setCvSuccess(true);
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateProfile({
        fullName,
        phone,
        city,
        field,
        yearsOfExperience: Number(years),
      });

      if (res.ok) {
        // Also save payment preference
        await setPaymentPreference({
          type: paymentType,
          details: paymentDetails,
        });

        setToastMessage("הפרופיל עודכן בהצלחה!");
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      {/* Toast notification */}
      {toastMessage && (
        <Toast
          type="success"
          title={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header Profile Summary */}
      <Card variant="highlight" className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-start">
          <Avatar name={fullName || "שרה"} size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-ink-900">{fullName || "פרופיל אישי"}</h1>
              <Badge variant="mint">פעילה בקהילה</Badge>
            </div>
            <p className="mt-1 text-base text-ink-600">
              {field ? `${field} · ` : ""}
              {years ? `${years} שנות ניסיון` : ""}
            </p>
          </div>
        </div>

        <Link
          href="/settings/notifications"
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-ink-900/10 bg-white px-5 py-3 text-sm font-bold text-ink-700 shadow-soft hover:bg-cream"
        >
          <span>🔔 הגדרות התראות</span>
        </Link>
      </Card>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Section 1: Personal Details */}
        <Card variant="default">
          <h2 className="text-2xl font-black text-ink-900 mb-2 text-start">1. פרטים אישיים ותחום עיסוק</h2>
          <p className="text-sm text-ink-500 mb-6 text-start">
            השם שלך נחשף לעוזרת רק לאחר שלקחה את המשימה. שמירה על כבוד ודיסקרטיות.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="שם מלא *"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="שם פרטי ומשפחה"
            />

            <Input
              label="מספר טלפון ליצירת קשר"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="050-0000000"
              helperText="ליצירת קשר במקרה הצורך"
            />

            <Input
              label="עיר מגורים"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="ירושלים / בני ברק / פתח תקווה..."
            />

            <Select
              label="תחום מקצועי עיקרי"
              value={field}
              onChange={(e) => setField(e.target.value)}
              options={[
                { value: "Full Stack Development", label: "פיתוח Full Stack" },
                { value: "Front End Development", label: "פיתוח Front End / React" },
                { value: "Back End Development", label: "פיתוח Back End / Java / Node" },
                { value: "QA & Automation", label: "בדיקות תוכנה / אוטומציה" },
                { value: "DevOps & Cloud", label: "DevOps וענן" },
                { value: "Product & UI/UX", label: "אפיון ועיצוב מוצר" },
                { value: "Data Analysis", label: "ניתוח נתונים / BI" },
                { value: "other", label: "תחום אחר" },
              ]}
            />

            <Input
              label="שנות ניסיון במקצוע"
              type="number"
              min={0}
              max={50}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
            />
          </div>
        </Card>

        {/* Section 2: CV Upload (PDF only, max 5MB, private bucket) */}
        <Card variant="default">
          <h2 className="text-2xl font-black text-ink-900 mb-2 text-start">2. קורות חיים (למחפשות עבודה)</h2>
          <p className="text-sm text-ink-500 mb-6 text-start">
            הקובץ נשמר באחסון פרטי ומוצפן. רק עוזרת שלקחה את המשימה מקבלת גישה זמנית לצפייה.
          </p>

          <div className="rounded-2xl border-2 border-dashed border-ink-900/15 p-8 text-center bg-cream/30 hover:border-brand-400 transition">
            <span className="text-4xl mb-3 block">📄</span>
            <label className="cursor-pointer">
              <span className="inline-block rounded-xl bg-white border-2 border-brand-200 px-6 py-3 font-bold text-brand-700 shadow-soft hover:bg-brand-50 transition">
                {cvFile ? "החלפת קובץ קורות חיים" : "בחירת קובץ קורות חיים (PDF)"}
              </span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleCvChange}
              />
            </label>
            <p className="mt-3 text-xs text-ink-500">
              פורמט PDF בלבד · גודל מירבי: עד 5MB
            </p>

            {cvSuccess && cvFile && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-mint-50 border border-mint-200 px-4 py-2 text-sm font-semibold text-mint-800">
                <span>✓ נבחר קובץ תקין: {cvFile.name} ({(cvFile.size / 1024).toFixed(0)} KB)</span>
              </div>
            )}

            {cvError && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-800">
                <span>✕ {cvError}</span>
              </div>
            )}

            {!cvFile && profile?.cvStoragePath && (
              <p className="mt-3 text-xs text-mint-700 font-medium">
                קיים קובץ קורות חיים מעודכן במערכת ({profile.cvStoragePath})
              </p>
            )}
          </div>
        </Card>

        {/* Section 3: Payment Preferences (No Bit/Paybox, Desktop-first) */}
        <Card variant="default">
          <h2 className="text-2xl font-black text-ink-900 mb-2 text-start">3. העדפת קבלת תודה (לעוזרות)</h2>
          <p className="text-sm text-ink-500 mb-6 text-start">
            כאשר נעזרת תתקבל לעבודה ותקבל משכורת ראשונה, כיצד תרצי לקבל את דמי התודה?
            (רוב החברות בקהילה משתמשות במחשב בלבד, ללא אפליקציות Bit / PayBox).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { id: "bank", title: "העברה בנקאית", desc: "פרטי חשבון בנק" },
              { id: "cash", title: "במזומן / אישי", desc: "מסירה אישית" },
              { id: "charity", title: "תרומה לצדקה", desc: "קישור או קרן" },
              { id: "waive", title: "ויתור כחסד", desc: "סיוע ללא תמורה" },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentType(method.id as "bank" | "cash" | "charity" | "waive")}
                className={`p-4 rounded-2xl border-2 text-start transition duration-150 ${
                  paymentType === method.id
                    ? "border-honey-500 bg-honey-50 text-ink-900 shadow-soft"
                    : "border-ink-900/10 bg-white text-ink-700 hover:border-ink-900/20"
                }`}
              >
                <div className="font-bold text-base mb-1">{method.title}</div>
                <div className="text-xs text-ink-500">{method.desc}</div>
              </button>
            ))}
          </div>

          {paymentType === "bank" && (
            <Input
              label="פרטי חשבון להעברה בנקאית"
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              placeholder="שם בנק, מספר סניף, מספר חשבון ושם בעלת החשבון"
              helperText="הפרטים ייחשפו אך ורק לנעזרת שסייעת לה, ורק לאחר שקיבלה משכורת ראשונה."
            />
          )}

          {paymentType === "charity" && (
            <Input
              label="קישור או שם ארגון הצדקה המועדף"
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              placeholder="לדוגמה: עזר מציון, קופת העיר, יד שרה..."
            />
          )}

          {paymentType === "cash" && (
            <Input
              label="הערות לתיאום"
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              placeholder="למשל: תיאום במייל או בטלפון באזור ירושלים"
            />
          )}

          {paymentType === "waive" && (
            <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-800 font-medium text-start">
              💖 אשריך! סימנת ויתור על דמי התודה כחסד גמור לחברות הקהילה.
            </div>
          )}
        </Card>

        {/* Submit Button */}
        <div className="pt-2 text-start">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isPending}
          >
            שמירת שינויים בפרופיל ←
          </Button>
        </div>
      </form>

      {/* Danger Zone: Delete Account */}
      <Card variant="default" className="border-rose-200 bg-rose-50/30 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-rose-900">אזור מחיקת חשבון</h3>
            <p className="text-xs text-rose-700 mt-1 max-w-lg leading-relaxed">
              רוצה לעזוב את הקהילה? מחיקת החשבון מוחקת לצמיתות את הפרופיל שלך, קובץ קורות החיים, קישורי החברות וכל המידע המשויך. פעולה זו הינה בלתי הפיכה.
            </p>
          </div>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            מחקי את החשבון שלי
          </Button>
        </div>
      </Card>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-up">
          <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 space-y-6 shadow-lift text-center">
            <span className="text-4xl block">⚠️</span>
            <h2 className="text-2xl font-black text-rose-900">האם את בטוחה שברצונך למחוק את החשבון?</h2>
            <p className="text-sm text-ink-600 leading-relaxed">
              פעולה זו תמחק לצמיתות את הפרופיל שלך, את קובץ קורות החיים וכל המידע האישי שלך מהשרתים שלנו, ללא אפשרות שחזור.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                type="button"
                variant="danger"
                size="md"
                fullWidth
                loading={deletePending}
                onClick={async () => {
                  setDeletePending(true);
                  const res = await deleteAccount();
                  setDeletePending(false);
                  if (res.ok) {
                    setShowDeleteModal(false);
                    router.push("/");
                    router.refresh();
                  }
                }}
              >
                כן, למחוק את החשבון לצמיתות
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="md"
                fullWidth
                onClick={() => setShowDeleteModal(false)}
              >
                ביטול וחזרה
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
