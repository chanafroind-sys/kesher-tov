import { describe, it, expect } from "vitest";
import {
  calculateHelperPriorityScore,
  planHelperWaves,
  shouldDispatchNextWave,
  type HelperCandidate,
} from "@/lib/notifications/waves";

describe("Wave Dispatch Engine (O16 / #33)", () => {
  describe("Priority Scoring", () => {
    it("returns -Infinity for muted helpers", () => {
      const helper: HelperCandidate = {
        id: "h1",
        name: "לאה",
        email: "lea@example.com",
        relation: "current_employee",
        replyRate: 100,
        isDeprioritized: false,
        isMuted: true,
      };
      expect(calculateHelperPriorityScore(helper)).toBe(-Infinity);
    });

    it("ranks current employees higher than past employees and connections", () => {
      const current: HelperCandidate = {
        id: "h1",
        name: "שרה",
        email: "s@example.com",
        relation: "current_employee",
        replyRate: 80,
        isDeprioritized: false,
      };
      const past: HelperCandidate = {
        id: "h2",
        name: "רחל",
        email: "r@example.com",
        relation: "past_employee",
        replyRate: 80,
        isDeprioritized: false,
      };
      const connection: HelperCandidate = {
        id: "h3",
        name: "מרים",
        email: "m@example.com",
        relation: "close_connection",
        replyRate: 80,
        isDeprioritized: false,
      };

      const scoreCurrent = calculateHelperPriorityScore(current);
      const scorePast = calculateHelperPriorityScore(past);
      const scoreConn = calculateHelperPriorityScore(connection);

      expect(scoreCurrent).toBeGreaterThan(scorePast);
      expect(scorePast).toBeGreaterThan(scoreConn);
    });

    it("applies penalty to deprioritized helpers", () => {
      const standard: HelperCandidate = {
        id: "h1",
        name: "חנה",
        email: "h@example.com",
        relation: "close_connection",
        replyRate: 50,
        isDeprioritized: false,
      };
      const deprioritized: HelperCandidate = {
        id: "h2",
        name: "דינה",
        email: "d@example.com",
        relation: "current_employee",
        replyRate: 100,
        isDeprioritized: true,
      };

      expect(calculateHelperPriorityScore(deprioritized)).toBeLessThan(
        calculateHelperPriorityScore(standard)
      );
    });
  });

  describe("Wave Planning", () => {
    const candidates: HelperCandidate[] = [
      {
        id: "h1",
        name: "עובדת נוכחית מהירה",
        email: "1@example.com",
        relation: "current_employee",
        replyRate: 100,
        isDeprioritized: false,
      },
      {
        id: "h2",
        name: "עובדת נוכחית בינונית",
        email: "2@example.com",
        relation: "current_employee",
        replyRate: 70,
        isDeprioritized: false,
      },
      {
        id: "h3",
        name: "עובדת עבר",
        email: "3@example.com",
        relation: "past_employee",
        replyRate: 90,
        isDeprioritized: false,
      },
      {
        id: "h4",
        name: "קשר קרוב",
        email: "4@example.com",
        relation: "close_connection",
        replyRate: 90,
        isDeprioritized: false,
      },
      {
        id: "h5",
        name: "עוזרת מושתקת",
        email: "5@example.com",
        relation: "current_employee",
        replyRate: 100,
        isDeprioritized: false,
        isMuted: true,
      },
      {
        id: "h6",
        name: "עוזרת ללא מענה חוזר",
        email: "6@example.com",
        relation: "current_employee",
        replyRate: 100,
        isDeprioritized: true,
      },
    ];

    it("filters out muted helpers and divides into standard waves of 3", () => {
      const plan = planHelperWaves({
        taskId: "task-1",
        helpers: candidates,
        seekerIsRestricted: false,
      });

      // 6 candidates, 1 muted -> 5 active helpers
      expect(plan.totalHelpers).toBe(5);
      expect(plan.batchSize).toBe(3);
      expect(plan.waves).toHaveLength(2);

      // Wave 1 has 3 helpers with delay 0h
      expect(plan.waves[0].helpers).toHaveLength(3);
      expect(plan.waves[0].delayHours).toBe(0);
      expect(plan.waves[0].helpers[0].id).toBe("h1"); // Best helper

      // Wave 2 has remaining 2 helpers with delay 24h
      expect(plan.waves[1].helpers).toHaveLength(2);
      expect(plan.waves[1].delayHours).toBe(24);

      // Deprioritized helper (h6) is in the last wave
      expect(plan.waves[1].helpers.some((h) => h.id === "h6")).toBe(true);
    });

    it("reduces wave size to 2 for restricted seekers", () => {
      const plan = planHelperWaves({
        taskId: "task-1",
        helpers: candidates,
        seekerIsRestricted: true,
      });

      expect(plan.batchSize).toBe(2);
      // 5 active helpers / 2 per wave = 3 waves (2 + 2 + 1)
      expect(plan.waves).toHaveLength(3);

      expect(plan.waves[0].delayHours).toBe(0);
      expect(plan.waves[0].helpers).toHaveLength(2);

      expect(plan.waves[1].delayHours).toBe(24);
      expect(plan.waves[1].helpers).toHaveLength(2);

      expect(plan.waves[2].delayHours).toBe(48);
      expect(plan.waves[2].helpers).toHaveLength(1);
      expect(plan.waves[2].helpers[0].id).toBe("h6"); // Deprioritized helper
    });
  });

  describe("Cancellation & Next Wave Checks", () => {
    it("allows next wave when task has fewer than 3 claims and is open", () => {
      expect(
        shouldDispatchNextWave({ currentClaimCount: 0, taskStatus: "open" })
      ).toBe(true);
      expect(
        shouldDispatchNextWave({ currentClaimCount: 2, taskStatus: "in_progress" })
      ).toBe(true);
    });

    it("halts next waves when 3 claims have been reached", () => {
      expect(
        shouldDispatchNextWave({ currentClaimCount: 3, taskStatus: "in_progress" })
      ).toBe(false);
    });

    it("halts next waves when task is closed or cancelled", () => {
      expect(
        shouldDispatchNextWave({ currentClaimCount: 1, taskStatus: "closed" })
      ).toBe(false);
      expect(
        shouldDispatchNextWave({ currentClaimCount: 0, taskStatus: "cancelled" })
      ).toBe(false);
    });
  });
});
