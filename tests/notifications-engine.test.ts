import { describe, it, expect, beforeEach } from "vitest";
import {
  checkAndIncrementDailyLimit,
  resetDailyLimits,
  processOutboxEvent,
  runNotificationDispatcher,
  type OutboxEvent,
} from "@/lib/notifications/engine";
import { isShabbat, isQuietWindow } from "@/lib/notifications/shabbat";

describe("Notification Engine (O10)", () => {
  beforeEach(() => {
    resetDailyLimits();
  });

  describe("Daily Cap (Max 3 instant emails per user per day)", () => {
    it("allows up to 3 emails on the same day and blocks the 4th", () => {
      const now = new Date("2026-10-12T10:00:00Z"); // Monday
      const userId = "user-cap-test";

      const r1 = checkAndIncrementDailyLimit(userId, 3, now);
      expect(r1.allowed).toBe(true);
      expect(r1.currentCount).toBe(1);

      const r2 = checkAndIncrementDailyLimit(userId, 3, now);
      expect(r2.allowed).toBe(true);
      expect(r2.currentCount).toBe(2);

      const r3 = checkAndIncrementDailyLimit(userId, 3, now);
      expect(r3.allowed).toBe(true);
      expect(r3.currentCount).toBe(3);

      // 4th must be capped
      const r4 = checkAndIncrementDailyLimit(userId, 3, now);
      expect(r4.allowed).toBe(false);
      expect(r4.currentCount).toBe(3);
    });

    it("resets counter on next day", () => {
      const day1 = new Date("2026-10-12T10:00:00Z");
      const day2 = new Date("2026-10-13T10:00:00Z");
      const userId = "user-day-test";

      checkAndIncrementDailyLimit(userId, 3, day1);
      checkAndIncrementDailyLimit(userId, 3, day1);
      checkAndIncrementDailyLimit(userId, 3, day1);

      // 4th on day 1 blocked
      expect(checkAndIncrementDailyLimit(userId, 3, day1).allowed).toBe(false);

      // Next day allowed
      const nextDayRes = checkAndIncrementDailyLimit(userId, 3, day2);
      expect(nextDayRes.allowed).toBe(true);
      expect(nextDayRes.currentCount).toBe(1);
    });
  });

  describe("Shabbat & Quiet Windows", () => {
    it("detects Shabbat on Friday afternoon (Israel time)", () => {
      // Friday 17:00 Israel time (14:00 UTC)
      const fridayEvening = new Date("2026-10-16T14:30:00Z");
      expect(isShabbat(fridayEvening)).toBe(true);
      expect(isQuietWindow(fridayEvening)).toBe(true);
    });

    it("detects Shabbat on Saturday midday", () => {
      // Saturday 12:00 Israel time
      const saturdayMidday = new Date("2026-10-17T09:00:00Z");
      expect(isShabbat(saturdayMidday)).toBe(true);
    });

    it("allows sending on regular weekdays", () => {
      // Tuesday 11:00 Israel time
      const tuesday = new Date("2026-10-13T08:00:00Z");
      expect(isShabbat(tuesday)).toBe(false);
      expect(isQuietWindow(tuesday)).toBe(false);
    });
  });

  describe("Outbox Processing & Dispatcher", () => {
    it("buffers email if triggered during Shabbat quiet window", async () => {
      const fridayEvening = new Date("2026-10-16T15:00:00Z");
      const event: OutboxEvent = {
        id: "evt-1",
        eventType: "task_created",
        taskId: "task-1",
        actorId: "seeker-1",
        payload: {
          helperEmail: "helper@example.com",
          companyName: "מטריקס",
          matchScore: 90,
        },
        createdAt: fridayEvening.toISOString(),
      };

      const res = await processOutboxEvent(event, fridayEvening);
      expect(res.ok).toBe(true);
      expect(res.reason).toBe("buffered_shabbat_quiet_window");
    });

    it("buffers 4th email for daily digest overflow", async () => {
      const tuesday = new Date("2026-10-13T09:00:00Z");
      const helperId = "helper-cap-test";

      const createEvent = (id: string): OutboxEvent => ({
        id,
        eventType: "task_created",
        taskId: `task-${id}`,
        actorId: "seeker-1",
        payload: {
          helperId,
          helperEmail: "helper@example.com",
          companyName: "מטריקס",
          matchScore: 90,
        },
        createdAt: tuesday.toISOString(),
      });

      const events = [
        createEvent("1"),
        createEvent("2"),
        createEvent("3"),
        createEvent("4"),
      ];

      const stats = await runNotificationDispatcher(events, tuesday);
      expect(stats.processedEvents).toBe(4);
      expect(stats.instantEmailsSent).toBe(3);
      expect(stats.bufferedForDailyCap).toBe(1);
    });
  });
});
