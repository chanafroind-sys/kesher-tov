"use client";

import { useState, useEffect, useRef } from "react";
import { searchCompanies, addCompany, type CompanySearchResult } from "@/lib/actions/companies";
import { Button, Input, Select, Badge } from "@/components/ui";
import type { CompanyCategory } from "@/types/database";

export interface CompanyPickerProps {
  value?: CompanySearchResult | null;
  onChange?: (company: CompanySearchResult | null) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
}

const CATEGORY_LABELS: Record<CompanyCategory, string> = {
  hitech: "הייטק",
  government: "ציבורי / ממשלתי",
  banking: "פיננסים ובנקאות",
  health: "בריאות ורפואה",
  education: "חינוך והוראה",
  other: "אחר",
};

export function CompanyPicker({
  value,
  onChange,
  placeholder = "חפשי לפי שם חברה בעברית או באנגלית...",
  label = "בחירת חברה",
  error,
  helperText,
}: CompanyPickerProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Add new company inline state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newNameHe, setNewNameHe] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newCategory, setNewCategory] = useState<CompanyCategory>("hitech");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsAddingNew(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search debounced
  useEffect(() => {
    if (!isOpen && !query) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchCompanies({ query, limit: 12 });
      if (res.ok) {
        setResults(res.data);
      }
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  function handleSelect(company: CompanySearchResult) {
    if (onChange) onChange(company);
    setQuery("");
    setIsOpen(false);
    setIsAddingNew(false);
  }

  function handleClear() {
    if (onChange) onChange(null);
    setQuery("");
    inputRef.current?.focus();
  }

  async function handleCreateNewCompany(e: React.FormEvent) {
    e.preventDefault();
    if (!newNameHe.trim()) {
      setAddError("נא להזין שם חברה בעברית");
      return;
    }

    setAddLoading(true);
    setAddError(null);

    const res = await addCompany({
      nameHe: newNameHe.trim(),
      nameEn: newNameEn.trim() || undefined,
      websiteDomain: newDomain.trim() || undefined,
      category: newCategory,
    });

    setAddLoading(false);

    if (res.ok) {
      handleSelect(res.data);
      setNewNameHe("");
      setNewNameEn("");
      setNewDomain("");
      setIsAddingNew(false);
    } else {
      setAddError(res.error);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-bold text-ink-900">
          {label}
        </label>
      )}

      {/* Selected Company Card / Chip */}
      {value ? (
        <div className="flex items-center justify-between rounded-2xl border-2 border-brand-200 bg-brand-50/50 p-3.5 shadow-soft transition">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center size-10 rounded-xl bg-brand-100 text-brand-700 font-black text-lg">
              {value.nameHe.charAt(0)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-ink-900">{value.nameHe}</span>
                {value.nameEn && (
                  <span className="text-xs text-ink-500 font-medium font-sans">({value.nameEn})</span>
                )}
                <Badge variant="brand">{CATEGORY_LABELS[value.category] || value.category}</Badge>
              </div>
              <p className="text-xs text-ink-600 mt-0.5">
                {value.helperCount > 0 ? `${value.helperCount} עוזרות פעילות בחברה` : "עדיין אין עוזרות רשומות"}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            aria-label="החלפת חברה"
          >
            החלפה ✕
          </Button>
        </div>
      ) : (
        /* Search Input */
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex((prev) => Math.min(prev + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex((prev) => Math.max(prev - 1, 0));
              } else if (e.key === "Enter" && highlightedIndex >= 0 && results[highlightedIndex]) {
                e.preventDefault();
                handleSelect(results[highlightedIndex]);
              } else if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
            placeholder={placeholder}
            className={`w-full rounded-2xl border-2 bg-white px-4 py-3.5 pe-10 text-base text-ink-900 shadow-soft transition focus:border-brand-600 focus:ring-4 focus:ring-brand-100 focus:outline-none ${
              error ? "border-rose-400" : "border-ink-900/15"
            }`}
          />

          <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none text-lg">
            🔍
          </span>
        </div>
      )}

      {error && <p className="text-xs font-semibold text-rose-600 mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-ink-500 mt-1">{helperText}</p>}

      {/* Dropdown Options */}
      {isOpen && !value && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-ink-900/10 bg-white p-2 shadow-lift">
          {loading ? (
            <div className="py-6 text-center text-sm font-medium text-ink-500">מחפש חברות...</div>
          ) : results.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto space-y-1" role="listbox">
              {results.map((comp, idx) => (
                <li
                  key={comp.id}
                  role="option"
                  aria-selected={highlightedIndex === idx}
                  onClick={() => handleSelect(comp)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`flex items-center justify-between rounded-xl p-3 cursor-pointer transition ${
                    highlightedIndex === idx ? "bg-brand-50 text-brand-900" : "hover:bg-ink-50 text-ink-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center size-8 rounded-lg bg-ink-100 text-ink-700 font-bold text-sm">
                      {comp.nameHe.charAt(0)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{comp.nameHe}</span>
                        {comp.nameEn && (
                          <span className="text-xs text-ink-500 font-sans">({comp.nameEn})</span>
                        )}
                      </div>
                      <span className="text-xs text-ink-500">{CATEGORY_LABELS[comp.category] || comp.category}</span>
                    </div>
                  </div>

                  {comp.helperCount > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                      👥 {comp.helperCount} עוזרות
                    </span>
                  ) : (
                    <span className="text-xs text-ink-400">חברה חדשה</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-4 px-3 text-center text-sm text-ink-600">
              לא נמצאה חברה תואמת לחיפוש &quot;{query}&quot;
            </div>
          )}

          {/* Add New Company Button / Expandable Form */}
          <div className="border-t border-ink-900/10 mt-2 pt-2">
            {!isAddingNew ? (
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(true);
                  if (query) setNewNameHe(query);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl p-2.5 text-sm font-bold text-brand-700 hover:bg-brand-50 transition"
              >
                <span>➕</span>
                <span>לא מצאת? הוסיפי חברה חדשה לקטלוג</span>
              </button>
            ) : (
              <form onSubmit={handleCreateNewCompany} className="p-3 bg-cream/40 rounded-xl space-y-3">
                <p className="font-bold text-sm text-ink-900">הוספת חברה חדשה לקטלוג</p>

                {addError && (
                  <p className="text-xs font-semibold text-rose-600">{addError}</p>
                )}

                <Input
                  label="שם החברה בעברית *"
                  required
                  value={newNameHe}
                  onChange={(e) => setNewNameHe(e.target.value)}
                  placeholder="למשל: סטרט-אפ חדש בע&quot;מ"
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="שם באנגלית (אופציונלי)"
                    value={newNameEn}
                    onChange={(e) => setNewNameEn(e.target.value)}
                    placeholder="e.g. MyTech"
                  />
                  <Select
                    label="קטגוריה"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CompanyCategory)}
                    options={[
                      { value: "hitech", label: "הייטק" },
                      { value: "government", label: "ציבורי / ממשלתי" },
                      { value: "banking", label: "פיננסים ובנקאות" },
                      { value: "health", label: "בריאות ורפואה" },
                      { value: "education", label: "חינוך והוראה" },
                      { value: "other", label: "אחר" },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={addLoading}
                  >
                    הוספה ובחירה
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingNew(false)}
                  >
                    ביטול
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
