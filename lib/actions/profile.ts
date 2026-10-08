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

/** Irreversibly delete current user account, CV file, helper links, ratings and session */
export async function deleteAccount(): Promise<ActionResult<{ success: boolean }>> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.delete("kt_session");
  } catch {
    // Outside request store (e.g. during unit tests)
  }

  if (isMockMode()) {
    return { ok: true, data: { success: true } };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "משתמשת לא מחוברת" };
    }

    // 1. Delete CV file in storage
    const { data: profileData } = await supabase
      .from("profiles")
      .select("cv_storage_path")
      .eq("id", user.id)
      .single();

    const profile = profileData as { cv_storage_path: string | null } | null;

    if (profile?.cv_storage_path) {
      await supabase.storage.from("cvs").remove([profile.cv_storage_path]);
    }

    // 2. Delete helper links
    await supabase.from("helper_links").delete().eq("helper_id", user.id);

    // 3. Delete ratings given/received
    await supabase
      .from("ratings")
      .delete()
      .or(`rater_id.eq.${user.id},rated_id.eq.${user.id}`);

    // 4. Delete profile & sign out
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.signOut();

    return { ok: true, data: { success: true } };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "שגיאה במחיקת החשבון";
    return { ok: false, error: errMsg };
  }
}
