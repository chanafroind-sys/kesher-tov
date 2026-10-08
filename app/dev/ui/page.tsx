"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Input,
  Textarea,
  Select,
  Chip,
  Badge,
  Toast,
  EmptyState,
  Dialog,
  Avatar,
} from "@/components/ui";

export default function UIDemoPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedChips, setSelectedChips] = useState<string[]>(["הגשת קו\"ח"]);
  const [showToast, setShowToast] = useState(true);

  function toggleChip(name: string) {
    setSelectedChips((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  return (
    <div className="min-h-screen bg-cream/40 p-6 sm:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="border-b border-ink-900/10 pb-6">
          <Badge variant="brand">J2 · ספריית רכיבים (UI Kit)</Badge>
          <h1 className="mt-4 text-4xl font-black text-ink-900">
            תצוגת רכיבי מערכת &quot;קשר טוב&quot;
          </h1>
          <p className="mt-2 text-lg text-ink-600">
            רכיבים בעברית RTL, מבוססי Tailwind, מותאמים לשימוש במחשב שולחני, קריאים ומזמינים.
          </p>
        </header>

        {/* 1. Buttons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-ink-900">1. כפתורים (Buttons)</h2>
          <Card>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary" size="lg">
                ראשי גדול (Primary LG)
              </Button>
              <Button variant="primary" size="md">
                ראשי רגיל (Primary MD)
              </Button>
              <Button variant="primary" size="sm">
                ראשי קטן (Primary SM)
              </Button>
              <Button variant="secondary">משני (Secondary)</Button>
              <Button variant="ghost">רוח (Ghost)</Button>
              <Button variant="danger">אזהרה (Danger)</Button>
              <Button variant="primary" loading>
                טוען...
              </Button>
              <Button variant="secondary" disabled>
                מושבת (Disabled)
              </Button>
            </div>
          </Card>
        </section>

        {/* 2. Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-ink-900">2. כרטיסים (Cards)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default">
              <h3 className="font-bold text-xl text-ink-900 mb-2">כרטיס רגיל (Default)</h3>
              <p className="text-ink-600">רקע לבן עם צל רך ומסגרת עדינה.</p>
            </Card>
            <Card variant="highlight">
              <h3 className="font-bold text-xl text-ink-900 mb-2">כרטיס מודגש (Highlight)</h3>
              <p className="text-ink-600">גרדיאנט חם עבור משימות חדשות או תודות.</p>
            </Card>
            <Card variant="dashed">
              <h3 className="font-bold text-xl text-ink-900 mb-2">כרטיס מקווקו (Dashed)</h3>
              <p className="text-ink-600">להוספת פריט חדש או העלאת קבצים.</p>
            </Card>
          </div>
        </section>

        {/* 3. Form Inputs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-ink-900">3. שדות קלט (Forms)</h2>
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="שם מלא"
                placeholder="לדוגמה: שרה כהן"
                helperText="השם ייחשף רק לעוזרת שלוקחת את המשימה"
              />
              <Input
                label="אימייל"
                defaultValue="invalid-email"
                error="כתובת אימייל לא תקינה"
              />
              <Select
                label="תחום מקצועי"
                options={[
                  { value: "frontend", label: "פיתוח Front End / React" },
                  { value: "backend", label: "פיתוח Back End / Node / Java" },
                  { value: "qa", label: "בדיקות תוכנה / QA" },
                  { value: "design", label: "עיצוב UI/UX ומוצר" },
                ]}
              />
              <div className="md:col-span-2">
                <Textarea
                  label="תיאור חופשי / הודעה אישית"
                  placeholder="כתבי כאן כמה מילים על הניסיון שלך או מה תרצי לבקש..."
                />
              </div>
            </div>
          </Card>
        </section>

        {/* 4. Chips & Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-ink-900">4. תגים וצ&apos;יפים (Chips & Badges)</h2>
          <Card>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-ink-700 mb-3">צ&apos;יפים לבחירה (Selectable Chips):</h4>
                <div className="flex flex-wrap gap-3">
                  {["הגשת קו\"ח", "מידע על החברה", "הכנה לראיון", "חיבור למגייסת"].map((chip) => (
                    <Chip
                      key={chip}
                      selected={selectedChips.includes(chip)}
                      onClick={() => toggleChip(chip)}
                    >
                      {chip}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-ink-700 mb-3">תגיות סטטוס (Badges):</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="brand">פתוחה לעזרה</Badge>
                  <Badge variant="honey">ממתינה למשכורת ראשונה</Badge>
                  <Badge variant="mint">התקבלה לעבודה!</Badge>
                  <Badge variant="coral">דחופה</Badge>
                  <Badge variant="neutral">סגורה</Badge>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* 5. Avatars (Letter Initials Only - Strictly No Photos) */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-ink-900">5. אוואטרים מבוססי אותיות (Avatars)</h2>
          <Card>
            <p className="text-ink-600 mb-6">
              תואם 100% סינון נטפרי ונתיב — ללא תמונות פנים אנושיות, מבוסס ראשי תיבות בצבעי פסטל.
            </p>
            <div className="flex items-center gap-6">
              <Avatar name="חנה פרוינד" size="xl" />
              <Avatar name="בת שבע שוורץ" size="lg" />
              <Avatar name="רבקה לוי" size="md" />
              <Avatar name="מרים כהן" size="sm" />
            </div>
          </Card>
        </section>

        {/* 6. Notifications & Toasts */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-ink-900">6. הודעות צפות (Toasts)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {showToast && (
              <Toast
                type="success"
                title="המשימה נפתחה בהצלחה!"
                message="עוזרות שעובדות בחברה קיבלו עדכון במייל."
                onClose={() => setShowToast(false)}
              />
            )}
            <Toast
              type="info"
              title="נמצאו 3 עוזרות"
              message="ישנן חברות קהילה פעילות בחברה זו."
            />
            <Toast
              type="error"
              title="קובץ לא תקין"
              message="נא להעלות קובץ מסוג PDF בלבד עד 5MB."
            />
          </div>
        </section>

        {/* 7. Dialog & EmptyState */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-ink-900">7. מודאל ומצב ריק (Dialog & EmptyState)</h2>
          <Card>
            <div className="space-y-6">
              <Button variant="primary" onClick={() => setDialogOpen(true)}>
                פתיחת חלונית מודאל (Open Dialog)
              </Button>

              <EmptyState
                icon={<span>📂</span>}
                title="עדיין לא פתחת אף משימה"
                description="מצאת משרה שמתאימה לך? פתחי משימה וחברה מהקהילה שעובדת שם תגיש את קורות החיים שלך מבפנים."
                action={
                  <Button variant="primary" onClick={() => setDialogOpen(true)}>
                    פתיחת משימה ראשונה
                  </Button>
                }
              />
            </div>
          </Card>
        </section>

        {/* Modal Instance */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="לקיחת משימה לעזרה"
          description="את עומדת לסייע לחברת קהילה בהגשת קו&quot;ח. לאחר האישור תוכלי לצפות בפרטיה ובקובץ."
        >
          <div className="space-y-4">
            <p className="text-ink-700 leading-relaxed text-base">
              האם את בטוחה שתרצי לקחת משימה זו? כל משימה מוגבלת לעד 3 עוזרות.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-ink-900/10">
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                ביטול
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  alert("המשימה נלקחה!");
                  setDialogOpen(false);
                }}
              >
                אישור ולקיחת משימה
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
