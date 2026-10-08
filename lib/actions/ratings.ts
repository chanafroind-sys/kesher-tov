"use server";

import { z } from "zod";
import type { ActionResult } from "./types";
import { isMockMode, notImplementedError } from "./types";
import {
  mockFlagsStore,
  type FlagRecord,
  getUserReliability,
  type UserReliability,
  checkUserBlockedStatus,
} from "@/lib/reliability";
import { createClient } from "@/lib/supabase/server";

const rateMatchSchema = z.object({
  taskId: z.string().min(1),
  score: z.number().int().min(0).max(100),
  feedback: z.string().max(200).optional(),
});

const flagSchema = z.object({
  taskId: z.string().min(1),
  targetUserId: z.string().min(1),
  reason: z.string().max(200).optional(),
});

const reportSchema = z.object({
  targetUserId: z.string().min(1, "חובה לציין משתמשת"),
  reason: z.string().min(5, "נא לפרט את סיבת הדיווח (לפחות 5 תווים)").max(500),
  taskId: z.string().optional(),
});

/** Helper rates how accurate seeker match was */
export async function rateMatch(
  rawInput: z.infer<typeof rateMatchSchema>
): Promise<ActionResult<{ success: boolean }>> {
  const parse = rateMatchSchema.safeParse(rawInput);
  if (!parse.success) {
    return { ok: false, error: parse.error.issues[0]?.message || "קלט שגוי" };
  }

  if (isMockMode()) {
    return { ok: true, data: { success: true } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "משתמשת לא מחוברת" };

  const { data: task } = await (supabase.from("tasks") as any)
    .select("seeker_id")
    .eq("id", parse.data.taskId)
    .single();

  if (!task) return { ok: false, error: "המשימה לא נמצאה" };

  const { error } = await (supabase.from("ratings") as any).insert({
    task_id: parse.data.taskId,
    rater_id: user.id,
    rated_id: task.seeker_id,
    type: "match_accuracy",
    score: parse.data.score,
    flag_reason: parse.data.feedback || null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: { success: true } };
}

/** Flag that seeker did not close the task fairly */
export async function flagNotClosed(
  rawInput: z.infer<typeof flagSchema>
): Promise<ActionResult<{ success: boolean }>> {
  const parse = flagSchema.safeParse(rawInput);
  if (!parse.success) {
    return { ok: false, error: parse.error.issues[0]?.message || "קלט שגוי" };
  }

  if (isMockMode()) {
    mockFlagsStore.push({
      taskId: parse.data.taskId,
      reporterId: `mock-helper-${Math.random().toString(36).slice(2)}-${Date.now()}`,
      targetUserId: parse.data.targetUserId,
      type: "not_closed",
      reason: parse.data.reason,
      createdAt: new Date(),
    });
    return { ok: true, data: { success: true } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "משתמשת לא מחוברת" };

  const { error } = await (supabase.from("ratings") as any).insert({
    task_id: parse.data.taskId,
    rater_id: user.id,
    rated_id: parse.data.targetUserId,
    type: "fair_closing",
    score: 0,
    flag_reason: parse.data.reason || "לא סגרה משימה בהגינות",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: { success: true } };
}

/** Flag that helper claimed but never responded */
export async function flagNoReply(
  rawInput: z.infer<typeof flagSchema>
): Promise<ActionResult<{ success: boolean }>> {
  const parse = flagSchema.safeParse(rawInput);
  if (!parse.success) {
    return { ok: false, error: parse.error.issues[0]?.message || "קלט שגוי" };
  }

  if (isMockMode()) {
    mockFlagsStore.push({
      taskId: parse.data.taskId,
      reporterId: `mock-seeker-${Math.random().toString(36).slice(2)}-${Date.now()}`,
      targetUserId: parse.data.targetUserId,
      type: "no_reply",
      reason: parse.data.reason,
      createdAt: new Date(),
    });
    return { ok: true, data: { success: true } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "משתמשת לא מחוברת" };

  const { error } = await (supabase.from("ratings") as any).insert({
    task_id: parse.data.taskId,
    rater_id: user.id,
    rated_id: parse.data.targetUserId,
    type: "reply_responsiveness",
    score: 0,
    flag_reason: parse.data.reason || "לקחה ולא חזרה",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: { success: true } };
}

/** Report user for abusive or inappropriate behavior */
export async function reportUser(
  rawInput: z.infer<typeof reportSchema>
): Promise<ActionResult<{ success: boolean; isBlocked: boolean }>> {
  const parse = reportSchema.safeParse(rawInput);
  if (!parse.success) {
    return { ok: false, error: parse.error.issues[0]?.message || "קלט שגוי" };
  }

  if (isMockMode()) {
    mockFlagsStore.push({
      taskId: parse.data.taskId || "mock-task",
      reporterId: `mock-reporter-${Math.random().toString(36).slice(2)}-${Date.now()}`,
      targetUserId: parse.data.targetUserId,
      type: "report",
      reason: parse.data.reason,
      createdAt: new Date(),
    });
    const status = checkUserBlockedStatus(parse.data.targetUserId);
    return { ok: true, data: { success: true, isBlocked: status.isBlocked } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "משתמשת לא מחוברת" };

  const { error } = await (supabase.from("user_reports") as any).insert({
    reporter_id: user.id,
    reported_id: parse.data.targetUserId,
    task_id: parse.data.taskId || null,
    reason: parse.data.reason,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: { success: true, isBlocked: false } };
}

/** Get user reliability metrics */
export async function getReliability(
  userId?: string
): Promise<ActionResult<UserReliability>> {
  const targetId = userId || "mock-user-id";
  const metrics = await getUserReliability(targetId);
  return { ok: true, data: metrics };
}
