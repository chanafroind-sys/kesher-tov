import * as React from "react";
import { isQuietWindow } from "./shabbat";
import { sendEmail } from "@/lib/email/client";
import { createActionToken } from "@/lib/tokens";
import {
  NewTaskEmail,
  ClaimDetailsEmail,
  ClaimedYourTaskEmail,
  HelperMarkedDoneEmail,
  YouWereChosenEmail,
  TaskClosedOtherEmail,
  HiredEmail,
  FirstSalaryQuestionEmail,
  ThanksListEmail,
  ThanksReceivedEmail,
  DigestEmail,
} from "@/lib/email/templates";

export interface OutboxEvent {
  id: string;
  eventType: string;
  taskId: string | null;
  actorId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface EngineStats {
  processedEvents: number;
  instantEmailsSent: number;
  bufferedForQuietWindow: number;
  bufferedForDailyCap: number;
  errors: string[];
}

// In-memory counter of emails sent today per user (for rate limiting: max 3 per day)
const dailySentCounter = new Map<string, { count: number; dateStr: string }>();

function getTodayString(now: Date = new Date()): string {
  return now.toISOString().split("T")[0];
}

/**
 * Check and increment daily instant email limit (max 3 per user per day)
 */
export function checkAndIncrementDailyLimit(
  userId: string,
  maxDaily = 3,
  now: Date = new Date()
): { allowed: boolean; currentCount: number } {
  const today = getTodayString(now);
  const entry = dailySentCounter.get(userId);

  if (!entry || entry.dateStr !== today) {
    dailySentCounter.set(userId, { count: 1, dateStr: today });
    return { allowed: true, currentCount: 1 };
  }

  if (entry.count >= maxDaily) {
    return { allowed: false, currentCount: entry.count };
  }

  entry.count += 1;
  return { allowed: true, currentCount: entry.count };
}

/**
 * Reset daily limit counter (for testing)
 */
export function resetDailyLimits() {
  dailySentCounter.clear();
}

/**
 * Process a single notification event
 */
export async function processOutboxEvent(
  event: OutboxEvent,
  now: Date = new Date()
): Promise<{ ok: boolean; reason?: string }> {
  // 1. Shabbat / Quiet Window Check
  if (isQuietWindow(now)) {
    return { ok: true, reason: "buffered_shabbat_quiet_window" };
  }

  const { eventType, payload } = event;

  // 2. Dispatch based on event type
  switch (eventType) {
    case "task_created": {
      const helperEmail = (payload.helperEmail as string) || "helper@example.com";
      const helperId = (payload.helperId as string) || "mock-helper";
      const helperName = (payload.helperName as string) || "עוזרת";
      const companyName = (payload.companyName as string) || "החברה שלך";
      const matchScore = Number(payload.matchScore) || 90;
      const helpTypes = (payload.helpTypes as string[]) || ["הגשת קו\"ח"];

      // Check daily cap
      const limit = checkAndIncrementDailyLimit(helperId, 3, now);
      if (!limit.allowed) {
        return { ok: true, reason: "buffered_daily_cap_overflow" };
      }

      // Generate action token for 1-click claim
      const { url: claimUrl } = await createActionToken({
        userId: helperId,
        action: "claim_task",
        payload: { taskId: event.taskId },
      });

      await sendEmail({
        to: helperEmail,
        subject: `מישהי צריכה אותך ב${companyName}! (${matchScore}% התאמה)`,
        react: React.createElement(NewTaskEmail, {
          helperName,
          companyName,
          matchScore,
          helpTypes,
          claimUrl,
        }),
      });
      return { ok: true };
    }

    case "task_claimed": {
      const seekerEmail = (payload.seekerEmail as string) || "seeker@example.com";
      const seekerName = (payload.seekerName as string) || "חברה";
      const companyName = (payload.companyName as string) || "החברה";

      await sendEmail({
        to: seekerEmail,
        subject: `עוזרת לקחה את המשימה שלך ב${companyName}!`,
        react: React.createElement(ClaimedYourTaskEmail, {
          seekerName,
          companyName,
          taskUrl: `https://kesher-tov.community/tasks/${event.taskId}`,
        }),
      });
      return { ok: true };
    }

    case "helper_marked_done": {
      const seekerEmail = (payload.seekerEmail as string) || "seeker@example.com";
      const seekerName = (payload.seekerName as string) || "חברה";
      const helperName = (payload.helperName as string) || "העוזרת";
      const companyName = (payload.companyName as string) || "החברה";

      await sendEmail({
        to: seekerEmail,
        subject: `${helperName} סיימה לסייע במשרת ${companyName}!`,
        react: React.createElement(HelperMarkedDoneEmail, {
          seekerName,
          helperName,
          companyName,
          closeTaskUrl: `https://kesher-tov.community/tasks/${event.taskId}`,
        }),
      });
      return { ok: true };
    }

    case "task_closed": {
      const helperEmail = (payload.chosenHelperEmail as string) || "helper@example.com";
      const helperName = (payload.chosenHelperName as string) || "מרים";
      const seekerName = (payload.seekerName as string) || "שרה";
      const companyName = (payload.companyName as string) || "החברה";
      const thanksAmount = Number(payload.thanksAmount) || 100;

      await sendEmail({
        to: helperEmail,
        subject: `יישר כח! נבחרת כעוזרת שפתחה את הדלת ב${companyName}`,
        react: React.createElement(YouWereChosenEmail, {
          helperName,
          seekerName,
          companyName,
          thanksAmount,
        }),
      });
      return { ok: true };
    }

    case "hired": {
      const seekerEmail = (payload.seekerEmail as string) || "seeker@example.com";
      const seekerName = (payload.seekerName as string) || "שרה";
      const companyName = (payload.companyName as string) || "החברה";

      await sendEmail({
        to: seekerEmail,
        subject: `מזל טוב ענק! בשעה טובה על הקבלה ל${companyName} 🎉`,
        react: React.createElement(HiredEmail, {
          seekerName,
          companyName,
          hiredUrl: "https://kesher-tov.community/hired",
        }),
      });
      return { ok: true };
    }

    case "first_salary": {
      const seekerEmail = (payload.seekerEmail as string) || "seeker@example.com";
      const seekerName = (payload.seekerName as string) || "שרה";

      await sendEmail({
        to: seekerEmail,
        subject: `סגירת מעגל התודה לעוזרות שפתחו לך את הדלת`,
        react: React.createElement(ThanksListEmail, {
          seekerName,
          helpers: [
            {
              name: (payload.helperName as string) || "מרים לוי",
              companyName: (payload.companyName as string) || "מטריקס",
              amount: Number(payload.amount) || 100,
              paymentType: "העברה בנקאית",
              markPaidUrl: "https://kesher-tov.community/hired",
            },
          ],
        }),
      });
      return { ok: true };
    }

    case "thanks_paid": {
      const helperEmail = (payload.helperEmail as string) || "helper@example.com";
      const helperName = (payload.helperName as string) || "מרים";
      const seekerName = (payload.seekerName as string) || "שרה";
      const amount = Number(payload.amount) || 100;
      const note = (payload.note as string) || null;

      await sendEmail({
        to: helperEmail,
        subject: `${seekerName} העבירה לך תודה אישית ומכתב הערכה! 💐`,
        react: React.createElement(ThanksReceivedEmail, {
          helperName,
          seekerName,
          amount,
          note,
        }),
      });
      return { ok: true };
    }

    default:
      return { ok: true, reason: `ignored_unknown_event_${eventType}` };
  }
}

/**
 * Dispatcher: Run outbox consumer cycle
 */
export async function runNotificationDispatcher(
  events: OutboxEvent[] = [],
  now: Date = new Date()
): Promise<EngineStats> {
  const stats: EngineStats = {
    processedEvents: 0,
    instantEmailsSent: 0,
    bufferedForQuietWindow: 0,
    bufferedForDailyCap: 0,
    errors: [],
  };

  for (const event of events) {
    try {
      const res = await processOutboxEvent(event, now);
      stats.processedEvents += 1;

      if (res.reason === "buffered_shabbat_quiet_window") {
        stats.bufferedForQuietWindow += 1;
      } else if (res.reason === "buffered_daily_cap_overflow") {
        stats.bufferedForDailyCap += 1;
      } else if (res.ok) {
        stats.instantEmailsSent += 1;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error processing event";
      stats.errors.push(msg);
    }
  }

  return stats;
}
