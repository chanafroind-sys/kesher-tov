"use server";

import { z } from "zod";
import type { ActionResult } from "./types";
import { isMockMode, notImplementedError } from "./types";
import type { TaskStatus, ClaimStatus } from "@/types/database";
import {
  calculateMatchScore,
  getSeekerLimits,
  checkUserBlockedStatus,
} from "@/lib/reliability";

export interface TaskRequirement {
  text: string;
  required: boolean;
  match: "full" | "partial" | "no";
  cvEvidence?: string;
}

export interface TaskDetails {
  id: string;
  seekerId: string;
  seekerName?: string; // Revealed only to helper who claimed
  companyId: string;
  companyName: string;
  helpTypes: string[];
  jobUrl?: string | null;
  freeText?: string | null;
  thanksAmount: number;
  status: TaskStatus;
  matchScore: number;
  requirements: TaskRequirement[];
  claims: Array<{
    helperId: string;
    helperName: string;
    status: ClaimStatus;
    claimedAt: string;
  }>;
  createdAt: string;
}

export interface FeedItem {
  id: string;
  companyName: string;
  helpTypes: string[];
  matchScore: number;
  thanksAmount: number;
  claimCount: number;
  createdAt: string;
  status: TaskStatus;
}

const requirementItemSchema = z.object({
  text: z.string().min(1),
  required: z.boolean().default(false),
  match: z.enum(["full", "partial", "no"]),
  cvEvidence: z.string().optional(),
});

const createTaskSchema = z.object({
  companyId: z.string().min(1, "חובה לבחור חברה"),
  helpTypes: z.array(z.string()).min(1, "חובה לבחור לפחות סוג עזרה אחד"),
  jobUrl: z.string().url("קישור לא תקין").or(z.string().length(0)).optional(),
  freeText: z.string().max(280, "ההודעה מוגבלת ל-280 תווים").optional(),
  thanksAmount: z.number().int().min(0).default(50),
  requirements: z.array(requirementItemSchema).default([]),
});

/** Create a new help task with job requirements and calculated match score */
export async function createTask(
  rawInput: z.input<typeof createTaskSchema>
): Promise<ActionResult<{ taskId: string; matchScore: number }>> {
  const parse = createTaskSchema.safeParse(rawInput);
  if (!parse.success) {
    return { ok: false, error: parse.error.issues[0]?.message || "קלט יצירת משימה לא תקין" };
  }

  const seekerId = "mock-seeker-id";

  // Check if seeker is blocked due to 3+ reports
  const blockedStatus = checkUserBlockedStatus(seekerId);
  if (blockedStatus.isBlocked) {
    return {
      ok: false,
      error: "חשבונך מושעה עקב דיווחים חוזרים. לא ניתן לפתוח משימות חדשות.",
    };
  }

  // Check seeker open tasks limit (default 5, restricted to 2 if 3+ not_closed flags)
  const limits = getSeekerLimits(seekerId);

  const matchScore = calculateMatchScore(parse.data.requirements || []);

  if (isMockMode()) {
    return {
      ok: true,
      data: { taskId: `mock-task-${Date.now()}`, matchScore },
    };
  }
  return notImplementedError();
}

/** Get feed of tasks relevant to current user (as seeker and as helper) */
export async function listMyFeed(): Promise<
  ActionResult<{
    seekerTasks: FeedItem[];
    helperTasks: FeedItem[];
    counters: { helpedCount: number; activeSeekerCount: number };
  }>
> {
  if (isMockMode()) {
    return {
      ok: true,
      data: {
        seekerTasks: [
          {
            id: "task-s-1",
            companyName: "מטריקס",
            helpTypes: ["הגשת קו\"ח"],
            matchScore: 90,
            thanksAmount: 100,
            claimCount: 2,
            createdAt: new Date().toISOString(),
            status: "in_progress",
          },
        ],
        helperTasks: [
          {
            id: "task-h-1",
            companyName: "צ'ק פוינט",
            helpTypes: ["הגשת קו\"ח", "מידע על החברה"],
            matchScore: 80,
            thanksAmount: 50,
            claimCount: 1,
            createdAt: new Date().toISOString(),
            status: "open",
          },
        ],
        counters: { helpedCount: 4, activeSeekerCount: 1 },
      },
    };
  }
  return notImplementedError();
}

/** Get comprehensive task details by ID */
export async function getTask(taskId: string): Promise<ActionResult<TaskDetails>> {
  if (isMockMode()) {
    return {
      ok: true,
      data: {
        id: taskId,
        seekerId: "seeker-1",
        seekerName: "רחל ג.",
        companyId: "comp-1",
        companyName: "מטריקס",
        helpTypes: ["הגשת קו\"ח", "הכנה לראיון"],
        jobUrl: "https://matrix.co.il/jobs/123",
        freeText: "מחפשת משרת React / TypeScript, ניסיון של 3 שנים. אשמח מאוד לעזרה בהגשה!",
        thanksAmount: 100,
        status: "open",
        matchScore: 85,
        requirements: [
          { text: "ניסיון של שנתיים ב-React", required: true, match: "full", cvEvidence: "3 שנים ב-ABC" },
          { text: "היכרות עם Next.js", required: false, match: "partial", cvEvidence: "פרויקטים אישיים" },
        ],
        claims: [
          {
            helperId: "helper-1",
            helperName: "מרים ל.",
            status: "claimed",
            claimedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
      },
    };
  }
  return notImplementedError();
}

/** Helper claims a task to assist seeker (max 3 per task) */
export async function claimTask(taskId: string): Promise<ActionResult<{ success: boolean }>> {
  if (!taskId) return { ok: false, error: "מזהה משימה חסר" };

  if (isMockMode()) {
    return { ok: true, data: { success: true } };
  }
  return notImplementedError();
}

/** Helper marks that her aid was completed */
export async function markDone(taskId: string): Promise<ActionResult<{ success: boolean }>> {
  if (!taskId) return { ok: false, error: "מזהה משימה חסר" };

  if (isMockMode()) {
    return { ok: true, data: { success: true } };
  }
  return notImplementedError();
}

/** Seeker closes task choosing helper who helped (or null) */
export async function closeTask(
  taskId: string,
  helperId: string | null
): Promise<ActionResult<{ success: boolean }>> {
  if (!taskId) return { ok: false, error: "מזהה משימה חסר" };

  if (isMockMode()) {
    return { ok: true, data: { success: Boolean(helperId || true) } };
  }
  return notImplementedError();
}

/** Seeker cancels task */
export async function cancelTask(taskId: string): Promise<ActionResult<{ success: boolean }>> {
  if (!taskId) return { ok: false, error: "מזהה משימה חסר" };

  if (isMockMode()) {
    return { ok: true, data: { success: true } };
  }
  return notImplementedError();
}
