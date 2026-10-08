"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  getHelperLinks,
  setHelperLinks,
  type HelperCompanyLink,
} from "@/lib/actions/helperLinks";
import { type CompanySearchResult } from "@/lib/actions/companies";
import { Button, Card, Toast, Badge, EmptyState } from "@/components/ui";
import { CompanyPicker } from "@/components/company";
import type { HelperRelation } from "@/types/database";

const HELP_TYPE_OPTIONS = [
  { id: "cv_submission", label: "הגשת קו\"ח מבפנים", desc: "חבר מביא חבר" },
  { id: "internal_info", label: "מידע פנימי", desc: "דרישות, שכר ואווירה" },
  { id: "interview_prep", label: "הכנה לראיון", desc: "טיפים וסימולציה" },
];

const RELATION_OPTIONS: { id: HelperRelation; label: string }[] = [
  { id: "current_employee", label: "עובדת נוכחית" },
  { id: "past_employee", label: "עבדתי בעבר" },
  { id: "close_connection", label: "קשר קרוב / מכירה טוב" },
];

export default function CompaniesPage() {
  const [links, setLinks] = useState<HelperCompanyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Additional preference: see tasks from all companies
  const [seeAllCompanies, setSeeAllCompanies] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getHelperLinks();
      if (res.ok) {
        setLinks(res.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  function handleAddCompany(company: CompanySearchResult | null) {
    if (!company) return;

    // Check if already in list
    if (links.some((l) => l.companyId === company.id)) {
      setToastMessage(`החברה "${company.nameHe}" כבר נמצאת ברשימה שלך`);
      return;
    }

    const newLink: HelperCompanyLink = {
      id: `new-${Date.now()}`,
      companyId: company.id,
      companyName: company.nameHe,
      relation: "current_employee",
      helpTypes: ["הגשת קו\"ח מבפנים", "מידע פנימי"],
      isMuted: false,
    };

    setLinks((prev) => [newLink, ...prev]);
    setToastMessage(`החברה "${company.nameHe}" נוספה לרשימה`);
  }

  function handleRemoveCompany(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  function handleRelationChange(id: string, relation: HelperRelation) {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, relation } : l))
    );
  }

  function handleToggleHelpType(id: string, helpTypeLabel: string) {
    setLinks((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const exists = l.helpTypes.includes(helpTypeLabel);
        const updated = exists
          ? l.helpTypes.filter((t) => t !== helpTypeLabel)
          : [...l.helpTypes, helpTypeLabel];
        return { ...l, helpTypes: updated };
      })
    );
  }

  function handleToggleMute(id: string) {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isMuted: !l.isMuted } : l))
    );
  }

  function handleSaveAll() {
    startTransition(async () => {
      const res = await setHelperLinks({
        links: links.map((l) => ({
          companyId: l.companyId,
          relation: l.relation,
          helpTypes: l.helpTypes,
          isMuted: l.isMuted,
        })),
        seeTasksFromAllCompanies: seeAllCompanies,
      });

      if (res.ok) {
        setToastMessage("החברות והגדרות הסיוע נשמרו בהצלחה!");
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-honey-100 px-3 py-1 text-xs font-bold text-ink-900 mb-2">
            🤝 אזור עוזרות בקהילה
          </span>
          <h1 className="text-3xl font-black text-ink-900">החברות שלי</h1>
          <p className="mt-1 text-base text-ink-600">
            הגדירי באילו חברות את עובדת או מכירה, ובאילו דרכים תוכלי לעזור לנשים מהקהילה.
          </p>
        </div>

        <div className="text-center sm:text-end">
          <Button
            variant="primary"
            size="lg"
            loading={isPending}
            onClick={handleSaveAll}
          >
            שמירת שינויים ✓
          </Button>
        </div>
      </Card>

      {/* Add New Company Card */}
      <Card variant="default">
        <h2 className="text-xl font-black text-ink-900 mb-2">הוספת חברה חדשה לרשימה</h2>
        <p className="text-sm text-ink-500 mb-4">
          חפשי חברה בקטלוג ובחרי אותה כדי לקבל עליה בקשות סיוע מהקהילה:
        </p>
        <CompanyPicker
          value={null}
          onChange={handleAddCompany}
          placeholder="חפשי חברה להוספה (למשל: אינטל, אלביט, בנק לאומי...)"
        />
      </Card>

      {/* Connected Companies List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-ink-900">חברות מחוברות ({links.length})</h2>
          </div>
          <span className="text-xs text-ink-500">
            תקבלי עדכונים רק כשתפתח משימה מתאימה
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-ink-500 font-medium">טוען חברות...</div>
        ) : links.length === 0 ? (
          <EmptyState
            icon={<span>🏢</span>}
            title="עדיין לא הוספת אף חברה"
            description="בחרי למעלה את החברה שבה את עובדת או שיש לך בה קשרים, כדי שנשים מהקהילה יוכלו לבקש את עזרתך."
          />
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <Card
                key={link.id}
                variant="default"
                className={`transition ${link.isMuted ? "opacity-60 bg-ink-50/50" : ""}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-900/10">
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center size-12 rounded-2xl bg-honey-100 text-honey-800 font-black text-xl">
                      {link.companyName.charAt(0)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-ink-900">{link.companyName}</h3>
                        {link.isMuted && (
                          <Badge variant="coral">התראות מושתקות</Badge>
                        )}
                      </div>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {link.relation === "current_employee"
                          ? "עובדת נוכחית בחברה"
                          : link.relation === "past_employee"
                          ? "עבדתי בחברה בעבר"
                          : "קשר קרוב / היכרות טובה"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mute button */}
                    <button
                      type="button"
                      onClick={() => handleToggleMute(link.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                        link.isMuted
                          ? "border-brand-300 bg-brand-50 text-brand-700"
                          : "border-ink-900/10 bg-white text-ink-600 hover:bg-ink-50"
                      }`}
                    >
                      {link.isMuted ? "🔔 ביטול השתקה" : "🔕 השתקת התראות"}
                    </button>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveCompany(link.id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                    >
                      הסרה ✕
                    </button>
                  </div>
                </div>

                {/* Relation Selection */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-700 mb-2">
                      מה הקשר שלך לחברה?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {RELATION_OPTIONS.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => handleRelationChange(link.id, r.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                            link.relation === r.id
                              ? "bg-brand-600 border-brand-600 text-white shadow-soft"
                              : "bg-white border-ink-900/15 text-ink-700 hover:border-brand-300"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Help capabilities checkboxes */}
                  <div>
                    <label className="block text-xs font-bold text-ink-700 mb-2">
                      איך תוכלי לעזור?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {HELP_TYPE_OPTIONS.map((ht) => {
                        const isSelected = link.helpTypes.includes(ht.label);
                        return (
                          <button
                            key={ht.id}
                            type="button"
                            onClick={() => handleToggleHelpType(link.id, ht.label)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                              isSelected
                                ? "bg-honey-500 border-honey-500 text-ink-900 shadow-soft"
                                : "bg-white border-ink-900/15 text-ink-600 hover:border-honey-300"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {ht.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Global Preference & Bottom Actions */}
      <Card variant="default" className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={seeAllCompanies}
            onChange={(e) => setSeeAllCompanies(e.target.checked)}
            className="size-5 rounded-lg border-2 border-ink-900/20 text-brand-600 focus:ring-brand-500"
          />
          <div>
            <span className="block text-sm font-bold text-ink-900">
              הצגת בקשות עזרה מכל החברות בלוח הבקרה
            </span>
            <span className="text-xs text-ink-500">
              גם אם לא סימנת במפורש שאת עובדת בחברה (מתאים אם את מעוניינת לעזור באופן רחב).
            </span>
          </div>
        </label>

        <Button
          type="button"
          variant="primary"
          size="md"
          loading={isPending}
          onClick={handleSaveAll}
        >
          שמירת כל השינויים ←
        </Button>
      </Card>

      <div className="pt-2 text-center">
        <Link
          href="/"
          className="text-sm font-semibold text-ink-500 hover:text-brand-700 transition"
        >
          ← חזרה ללוח הבקרה הראשי
        </Link>
      </div>
    </div>
  );
}
