"use server";

import { z } from "zod";
import type { ActionResult } from "./types";
import { isMockMode, notImplementedError } from "./types";

export interface NotificationPrefs {
  frequency: "instant" | "daily_digest" | "weekly" | "paused";
  digestHour: number; // 0-23
  mutedCompanyIds: string[];
}

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  taskId: string | null;
  createdAt: string;
  isRead: boolean;
}

const notifPrefsSchema = z.object({
  frequency: z.enum(["instant", "daily_digest", "weekly", "paused"]),
  digestHour: z.number().int().min(0).max(23).default(18),
  mutedCompanyIds: z.array(z.string()).default([]),
});

/** Get current user notification settings */
export async function getNotificationPrefs(): Promise<ActionResult<NotificationPrefs>> {
  if (isMockMode()) {
    return {
      ok: true,
      data: {
        frequency: "daily_digest",
        digestHour: 18,
        mutedCompanyIds: [],
      },
    };
  }
  return notImplementedError();
}

/** Update user notification preferences (frequency and digest hour) */
export async function setNotificationPrefs(
  rawInput: z.infer<typeof notifPrefsSchema>
): Promise<ActionResult<{ success: boolean }>> {
  const parse = notifPrefsSchema.safeParse(rawInput);
  if (!parse.success) {
    return { ok: false, error: parse.error.issues[0]?.message || "קלט שגוי" };
  }

  if (isMockMode()) {
    return { ok: true, data: { success: true } };
  }
  return notImplementedError();
}

/** List in-app notifications for bell dropdown */
export async function listInAppNotifications(): Promise<
  ActionResult<InAppNotification[]>
> {
  if (isMockMode()) {
    return {
      ok: true,
      data: [
        {
          id: "notif-1",
          title: "משימה חדשה במטריקס",
          body: "חברת קהילה מחפשת עזרה בהגשת קורות חיים",
          taskId: "task-s-1",
          createdAt: new Date().toISOString(),
          isRead: false,
        },
        {
          id: "notif-2",
          title: "תודה הועברה בהצלחה",
          body: "סגירת מעגל על סיוע במשרת Full Stack",
          taskId: null,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          isRead: true,
        },
      ],
    };
  }
  return notImplementedError();
}

/** Mark single notification as read */
export async function markNotificationRead(
  notificationId: string
): Promise<ActionResult<{ success: boolean }>> {
  if (!notificationId) return { ok: false, error: "מזהה חסר" };

  if (isMockMode()) {
    return { ok: true, data: { success: true } };
  }
  return notImplementedError();
}
