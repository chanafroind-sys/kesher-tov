"use server";

import { z } from "zod";
import type { ActionResult } from "./types";
import { isMockMode, notImplementedError } from "./types";
import type { CompanyCategory } from "@/types/database";

export interface CompanySearchResult {
  id: string;
  nameHe: string;
  nameEn: string | null;
  websiteDomain: string | null;
  category: CompanyCategory;
  helperCount: number;
}

const searchSchema = z.object({
  query: z.string().default(""),
  limit: z.number().int().min(1).max(50).default(20),
});

const addCompanySchema = z.object({
  nameHe: z.string().min(2, "שם חברה קצר מדי").max(100),
  nameEn: z.string().max(100).optional(),
  websiteDomain: z.string().max(100).optional(),
  category: z.enum(["hitech", "government", "banking", "health", "education", "other"]).default("other"),
});

/** Search companies by name or alias with helper counts */
export async function searchCompanies(
  rawInput: z.infer<typeof searchSchema>
): Promise<ActionResult<CompanySearchResult[]>> {
  const parse = searchSchema.safeParse(rawInput);
  if (!parse.success) {
    return { ok: false, error: parse.error.issues[0]?.message || "קלט חיפוש לא תקין" };
  }

  if (isMockMode()) {
    const q = parse.data.query.toLowerCase();
    const mockList: CompanySearchResult[] = [
      { id: "comp-1", nameHe: "מטריקס", nameEn: "Matrix", websiteDomain: "matrix.co.il", category: "hitech", helperCount: 14 },
      { id: "comp-2", nameHe: "מיקרוסופט ישראל", nameEn: "Microsoft", websiteDomain: "microsoft.com", category: "hitech", helperCount: 9 },
      { id: "comp-3", nameHe: "צ'ק פוינט", nameEn: "Check Point", websiteDomain: "checkpoint.com", category: "hitech", helperCount: 12 },
      { id: "comp-4", nameHe: "גוגל ישראל", nameEn: "Google", websiteDomain: "google.com", category: "hitech", helperCount: 7 },
      { id: "comp-5", nameHe: "בנק הפועלים", nameEn: "Bank Hapoalim", websiteDomain: "bankhapoalim.co.il", category: "banking", helperCount: 5 },
      { id: "comp-6", nameHe: "מלאנוקס (אנבידיה)", nameEn: "NVIDIA", websiteDomain: "nvidia.com", category: "hitech", helperCount: 11 },
    ];

    const filtered = q ? mockList.filter((c) => c.nameHe.includes(q) || (c.nameEn && c.nameEn.toLowerCase().includes(q))) : mockList;
    return { ok: true, data: filtered.slice(0, parse.data.limit) };
  }

  return notImplementedError();
}

/** Add a new company manually if not present in catalog */
export async function addCompany(
  rawInput: z.infer<typeof addCompanySchema>
): Promise<ActionResult<CompanySearchResult>> {
  const parse = addCompanySchema.safeParse(rawInput);
  if (!parse.success) {
    return { ok: false, error: parse.error.issues[0]?.message || "קלט הוספת חברה לא תקין" };
  }

  if (isMockMode()) {
    return {
      ok: true,
      data: {
        id: `mock-comp-${Date.now()}`,
        nameHe: parse.data.nameHe,
        nameEn: parse.data.nameEn || null,
        websiteDomain: parse.data.websiteDomain || null,
        category: parse.data.category,
        helperCount: 0,
      },
    };
  }

  return notImplementedError();
}
