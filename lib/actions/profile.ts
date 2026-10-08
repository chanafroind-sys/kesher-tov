"use server";

import { z } from "zod";
import type { ActionResult } from "./types";
import { isMockMode, notImplementedError } from "./types";

export interface ProfileData {
  id: string;
  fullName: string;
  phone: string | null;
  city: string | null;
  field: string | null;
  yearsOfExperience: number;
  cvStoragePath: string | null;
  paymentPreference: {
    type: "bank" | "cash" | "charity" | "waive";
    details?: string;
  };
}

const paymentPrefSchema = z.object({
  type: z.enum(["bank", "cash", "charity", "waive"]),
  details: z.string().optional(),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2, "שם קצר מדי").max(80),
  phone: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  field: z.string().nullable().optional(),
  yearsOfExperience: z.number().int().min(0).max(60).default(0),
});

/** Get current user profile details */
export async function getProfile(): Promise<ActionResult<ProfileData>> {
  if (isMockMode()) {
    return {
      ok: true,
      data: {
        id: "mock-user-1",
        fullName: "שרה כהן",
        phone: "050-1234567",
        city: "בני ברק",
        field: "Full Stack Development",
        yearsOfExperience: 4,
        cvStoragePath: "cvs/mock-user-1/resume.pdf",
        paymentPreference: {
          type: "bank",
          details: "בנק הפועלים (12), סניף 600, חשבון 123456",
        },
      },
    };
  }
  return notImplementedError();
}

/** Update profile basic details */
export async function updateProfile(
  rawInput: z.infer<typeof updateProfileSchema>
): Promise<ActionResult<ProfileData>> {
  const parse = updateProfileSchema.safeParse(rawInput);
  if (!parse.success) {
    return { ok: false, error: parse.error.issues[0]?.message || "קלט לא תקין" };
  }

  if (isMockMode()) {
    return {
      ok: true,
      data: {
        id: "mock-user-1",
        fullName: parse.data.fullName,
        phone: parse.data.phone || null,
        city: parse.data.city || null,
        field: parse.data.field || null,
        yearsOfExperience: parse.data.yearsOfExperience,
        cvStoragePath: "cvs/mock-user-1/resume.pdf",
        paymentPreference: { type: "waive" },
      },
    };
  }
  return notImplementedError();
}

/** Set payment preference method for delayed thanks reward */
export async function setPaymentPreference(
  rawInput: z.infer<typeof paymentPrefSchema>
): Promise<ActionResult<{ success: boolean }>> {
  const parse = paymentPrefSchema.safeParse(rawInput);
  if (!parse.success) {
    return { ok: false, error: parse.error.issues[0]?.message || "קלט לא תקין" };
  }

  if (isMockMode()) {
    return { ok: true, data: { success: true } };
  }
  return notImplementedError();
}
