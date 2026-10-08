"use server";

import { z } from "zod";
import type { ActionResult } from "./types";
import { isMockMode, notImplementedError } from "./types";
import type { ThanksStatus } from "@/types/database";

export interface ThanksItem {
  id: string;
  taskId: string;
  companyName: string;
  helperId: string;
  helperName: string;
  amount: number;
  status: ThanksStatus;
  paymentMethod: {
    type: "bank" | "cash" | "charity" | "waive";
    details?: string;
  };
  paidAt: string | null;
  note: string | null;
}

const markPaidSchema = z.object({
  thanksId: z.string().min(1),
  note: z.string().max(300).optional(),
});

/** Mark that seeker got hired for a job */
export async function markHired(companyName?: string): Promise<ActionResult<{ success: boolean }>> {
  if (isMockMode()) {
    return { ok: true, data: { success: Boolean(companyName || true) } };
  }
  return notImplementedError();
}

/** Mark that seeker received first salary, revealing payment details of thanks */
export async function markFirstSalary(): Promise<ActionResult<{ success: boolean }>> {
  if (isMockMode()) {
    return { ok: true, data: { success: true } };
  }
  return notImplementedError();
}

/** List all thanks records for seeker to pay after first salary */
export async function listThanks(): Promise<ActionResult<ThanksItem[]>> {
  if (isMockMode()) {
    return {
      ok: true,
      data: [
        {
          id: "th-1",
          taskId: "task-s-1",
          companyName: "מטריקס",
          helperId: "help-1",
          helperName: "מרים לוי",
          amount: 100,
          status: "ready_to_pay",
          paymentMethod: {
            type: "bank",
            details: "בנק לאומי (10), סניף 800, חשבון 456789 (מרים לוי)",
          },
          paidAt: null,
          note: null,
        },
        {
          id: "th-2",
          taskId: "task-s-2",
          companyName: "צ'ק פוינט",
          helperId: "help-2",
          helperName: "רחל ישראלי",
          amount: 50,
          status: "waived",
          paymentMethod: {
            type: "waive",
            details: "העוזרת ויתרה על התודה כחסד",
          },
          paidAt: null,
          note: null,
        },
      ],
    };
  }
  return notImplementedError();
}

/** Mark thanks as paid with a personal gratitude message */
export async function markPaid(
  rawInput: z.infer<typeof markPaidSchema>
): Promise<ActionResult<{ success: boolean }>> {
  const parse = markPaidSchema.safeParse(rawInput);
  if (!parse.success) {
    return { ok: false, error: parse.error.issues[0]?.message || "קלט שגוי" };
  }

  if (isMockMode()) {
    return { ok: true, data: { success: true } };
  }
  return notImplementedError();
}
