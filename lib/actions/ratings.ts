"use server";

import { z } from "zod";
import type { ActionResult } from "./types";
import { isMockMode, notImplementedError } from "./types";

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
  return notImplementedError();
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
    return { ok: true, data: { success: true } };
  }
  return notImplementedError();
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
    return { ok: true, data: { success: true } };
  }
  return notImplementedError();
}
