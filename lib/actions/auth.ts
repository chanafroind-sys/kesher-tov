"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { INVITE_COOKIE_NAME, type ActionResult } from "@/lib/auth-constants";


const emailSchema = z.string().email("כתובת אימייל לא תקינה");
const otpSchema = z.string().length(6, "קוד האימות חייב להכיל בדיוק 6 ספרות").regex(/^\d+$/, "הקוד חייב להכיל ספרות בלבד");
const inviteCodeSchema = z.string().min(3, "קוד הזמנה קצר מדי").max(50);

/**
 * Validate an invite code directly from DB
 */
export async function validateInvite(rawCode: string): Promise<ActionResult<{ code: string; inviterName: string }>> {
  const parse = inviteCodeSchema.safeParse(rawCode.trim());
  if (!parse.success) {
    return { ok: false, error: parse.error.issues[0]?.message || "קוד הזמנה לא תקין" };
  }

  const code = parse.data;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invites")
    .select("id, code, max_uses, used_count, expires_at, inviter:profiles!inviter_id(full_name)")
    .eq("code", code)
    .single();

  const invite = data as {
    id: string;
    code: string;
    max_uses: number;
    used_count: number;
    expires_at: string;
    inviter: { full_name: string } | { full_name: string }[] | null;
  } | null;

  if (error || !invite) {
    return { ok: false, error: "קוד ההזמנה לא נמצא במערכת" };
  }

  if (new Date(invite.expires_at) < new Date()) {
    return { ok: false, error: "פג תוקפו של קוד ההזמנה" };
  }

  if (invite.used_count >= invite.max_uses) {
    return { ok: false, error: "קוד ההזמנה נוצל במלואו" };
  }

  // Typecast inviter relation safely
  const inviter = Array.isArray(invite.inviter) ? invite.inviter[0] : invite.inviter;
  const inviterName = inviter && typeof inviter === "object" && "full_name" in inviter
    ? String(inviter.full_name)
    : "חברת קהילה";

  return { ok: true, data: { code: invite.code, inviterName } };
}

/**
 * Store invite code in an HTTP-only secure cookie
 */
export async function setInviteCookie(code: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(INVITE_COOKIE_NAME, code.trim(), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Get stored invite code from cookies
 */
export async function getInviteCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(INVITE_COOKIE_NAME)?.value || null;
}

/**
 * Clear stored invite cookie
 */
export async function clearInviteCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(INVITE_COOKIE_NAME);
}

/**
 * Send 6-digit OTP to user's email
 */
export async function sendOtp(rawEmail: string): Promise<ActionResult<{ email: string }>> {
  const parse = emailSchema.safeParse(rawEmail.trim());
  if (!parse.success) {
    return { ok: false, error: parse.error.issues[0]?.message || "כתובת אימייל לא תקינה" };
  }

  const email = parse.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { ok: false, error: error.message || "שגיאה בשליחת קוד האימות למייל" };
  }

  return { ok: true, data: { email } };
}

/**
 * Verify 6-digit OTP code and handle existing vs new user registration
 */
export async function verifyOtp(
  rawEmail: string,
  rawToken: string
): Promise<ActionResult<{ userId: string; isNewUser: boolean }>> {
  const emailParse = emailSchema.safeParse(rawEmail.trim());
  if (!emailParse.success) {
    return { ok: false, error: emailParse.error.issues[0]?.message || "כתובת אימייל לא תקינה" };
  }

  const tokenParse = otpSchema.safeParse(rawToken.trim());
  if (!tokenParse.success) {
    return { ok: false, error: tokenParse.error.issues[0]?.message || "קוד אימות לא תקין" };
  }

  const email = emailParse.data;
  const token = tokenParse.data;
  const supabase = await createClient();

  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (verifyError || !verifyData.user) {
    return { ok: false, error: "קוד האימות שגוי או שפג תוקפו" };
  }

  const userId = verifyData.user.id;

  // Check if profile already exists
  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, full_name, is_blocked")
    .eq("id", userId)
    .single();

  const profile = profileData as { id: string; full_name: string; is_blocked: boolean } | null;

  if (profile) {
    if (profile.is_blocked) {
      await supabase.auth.signOut();
      return { ok: false, error: "החשבון שלך חסום. לבירור פני לתמיכת הקהילה." };
    }
    // Existing user -> success
    return { ok: true, data: { userId, isNewUser: false } };
  }

  // New user -> must have a valid invite code
  const inviteCode = await getInviteCookie();
  if (!inviteCode) {
    // Sign out unconfirmed user
    await supabase.auth.signOut();
    return {
      ok: false,
      error: "ההצטרפות לקהילת 'קשר טוב' היא בהזמנה בלבד. אנא פני למכרה רשומה לקבלת קישור הזמנה אישי.",
    };
  }

  // Redeem invite atomically via DB function redeem_invite
  const fallbackName = email.split("@")[0] || "משתמשת חדשה";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: redeemRes, error: redeemError } = await (supabase.rpc as any)("redeem_invite", {
    p_code: inviteCode,
    p_full_name: fallbackName,
  });

  const res = redeemRes as { ok?: boolean; error?: string } | null;
  if (redeemError || !res?.ok) {
    await supabase.auth.signOut();
    const errMsg = res?.error || redeemError?.message || "קוד ההזמנה אינו תקף";
    return { ok: false, error: errMsg };
  }

  // Clear cookie after successful redemption
  await clearInviteCookie();

  return { ok: true, data: { userId, isNewUser: true } };
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, data: undefined };
}
