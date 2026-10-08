import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateMatchScore,
  getSeekerLimits,
  getHelperPriority,
  checkUserBlockedStatus,
  getUserReliability,
  mockFlagsStore,
  clearMockFlagsStore,
  type FlagRecord,
} from "@/lib/reliability";
import { createTask } from "@/lib/actions/tasks";
import { flagNotClosed, flagNoReply, reportUser } from "@/lib/actions/ratings";

describe("Reliability & Fairness Engine (O11 / #19)", () => {
  beforeEach(() => {
    clearMockFlagsStore();
  });

  describe("Match Score Formula", () => {
    it("returns 100 for empty requirements", () => {
      expect(calculateMatchScore([])).toBe(100);
    });

    it("gives 2x weight to required items", () => {
      // req1: required=true, match=full (weight 2 * 100 = 200)
      // req2: required=false, match=no (weight 1 * 0 = 0)
      // total weight = 3 -> 200 / 3 = 67%
      const score1 = calculateMatchScore([
        { text: "React", required: true, match: "full" },
        { text: "GraphQL", required: false, match: "no" },
      ]);
      expect(score1).toBe(67);

      // req1: required=false, match=full (weight 1 * 100 = 100)
      // req2: required=true, match=no (weight 2 * 0 = 0)
      // total weight = 3 -> 100 / 3 = 33%
      const score2 = calculateMatchScore([
        { text: "React", required: false, match: "full" },
        { text: "GraphQL", required: true, match: "no" },
      ]);
      expect(score2).toBe(33);
    });

    it("handles partial matches correctly (50 points)", () => {
      // 1 requirement with partial match -> 50%
      const score = calculateMatchScore([
        { text: "Node.js", required: false, match: "partial" },
      ]);
      expect(score).toBe(50);
    });
  });

  describe("Seeker Reliability & Task Limits", () => {
    it("allows default 5 open tasks when user has fewer than 3 not_closed flags", () => {
      const flags: FlagRecord[] = [
        {
          taskId: "t1",
          reporterId: "helper-1",
          targetUserId: "seeker-1",
          type: "not_closed",
          createdAt: new Date(),
        },
        {
          taskId: "t2",
          reporterId: "helper-2",
          targetUserId: "seeker-1",
          type: "not_closed",
          createdAt: new Date(),
        },
      ];

      const limits = getSeekerLimits("seeker-1", flags);
      expect(limits.isRestricted).toBe(false);
      expect(limits.maxOpenTasks).toBe(5);
      expect(limits.notClosedFlagCount).toBe(2);
    });

    it("restricts seeker to 2 open tasks when 3 distinct helpers flag not_closed", () => {
      const flags: FlagRecord[] = [
        {
          taskId: "t1",
          reporterId: "helper-1",
          targetUserId: "seeker-1",
          type: "not_closed",
          createdAt: new Date(),
        },
        {
          taskId: "t2",
          reporterId: "helper-2",
          targetUserId: "seeker-1",
          type: "not_closed",
          createdAt: new Date(),
        },
        {
          taskId: "t3",
          reporterId: "helper-3",
          targetUserId: "seeker-1",
          type: "not_closed",
          createdAt: new Date(),
        },
      ];

      const limits = getSeekerLimits("seeker-1", flags);
      expect(limits.isRestricted).toBe(true);
      expect(limits.maxOpenTasks).toBe(2);
      expect(limits.notClosedFlagCount).toBe(3);
    });

    it("deduplicates multiple flags from the same reporter", () => {
      const flags: FlagRecord[] = [
        {
          taskId: "t1",
          reporterId: "helper-1",
          targetUserId: "seeker-1",
          type: "not_closed",
          createdAt: new Date(),
        },
        {
          taskId: "t2",
          reporterId: "helper-1", // duplicate reporter
          targetUserId: "seeker-1",
          type: "not_closed",
          createdAt: new Date(),
        },
      ];

      const limits = getSeekerLimits("seeker-1", flags);
      expect(limits.isRestricted).toBe(false);
      expect(limits.notClosedFlagCount).toBe(1);
    });

    it("ignores flags older than 12 months (365 days)", () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000); // 400 days ago

      const flags: FlagRecord[] = [
        {
          taskId: "t1",
          reporterId: "helper-1",
          targetUserId: "seeker-1",
          type: "not_closed",
          createdAt: oldDate,
        },
        {
          taskId: "t2",
          reporterId: "helper-2",
          targetUserId: "seeker-1",
          type: "not_closed",
          createdAt: oldDate,
        },
        {
          taskId: "t3",
          reporterId: "helper-3",
          targetUserId: "seeker-1",
          type: "not_closed",
          createdAt: oldDate,
        },
      ];

      const limits = getSeekerLimits("seeker-1", flags, now);
      expect(limits.isRestricted).toBe(false);
      expect(limits.maxOpenTasks).toBe(5);
      expect(limits.notClosedFlagCount).toBe(0);
    });
  });

  describe("Helper Reliability & Deprioritization", () => {
    it("deprioritizes helper when 3 distinct seekers report no_reply", () => {
      const flags: FlagRecord[] = [
        {
          taskId: "t1",
          reporterId: "seeker-1",
          targetUserId: "helper-1",
          type: "no_reply",
          createdAt: new Date(),
        },
        {
          taskId: "t2",
          reporterId: "seeker-2",
          targetUserId: "helper-1",
          type: "no_reply",
          createdAt: new Date(),
        },
        {
          taskId: "t3",
          reporterId: "seeker-3",
          targetUserId: "helper-1",
          type: "no_reply",
          createdAt: new Date(),
        },
      ];

      const priority = getHelperPriority("helper-1", flags);
      expect(priority.isDeprioritized).toBe(true);
      expect(priority.noReplyFlagCount).toBe(3);
    });

    it("ignores expired no_reply flags (> 365 days)", () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 370 * 24 * 60 * 60 * 1000);

      const flags: FlagRecord[] = [
        {
          taskId: "t1",
          reporterId: "seeker-1",
          targetUserId: "helper-1",
          type: "no_reply",
          createdAt: oldDate,
        },
        {
          taskId: "t2",
          reporterId: "seeker-2",
          targetUserId: "helper-1",
          type: "no_reply",
          createdAt: oldDate,
        },
        {
          taskId: "t3",
          reporterId: "seeker-3",
          targetUserId: "helper-1",
          type: "no_reply",
          createdAt: oldDate,
        },
      ];

      const priority = getHelperPriority("helper-1", flags, now);
      expect(priority.isDeprioritized).toBe(false);
    });
  });

  describe("Misconduct Reports & Account Suspension", () => {
    it("suspends account after 3 distinct misconduct reports", () => {
      const flags: FlagRecord[] = [
        {
          taskId: "t1",
          reporterId: "user-a",
          targetUserId: "bad-actor",
          type: "report",
          reason: "ספאם",
          createdAt: new Date(),
        },
        {
          taskId: "t2",
          reporterId: "user-b",
          targetUserId: "bad-actor",
          type: "report",
          reason: "התנהגות לא ראויה",
          createdAt: new Date(),
        },
        {
          taskId: "t3",
          reporterId: "user-c",
          targetUserId: "bad-actor",
          type: "report",
          reason: "הטרדה",
          createdAt: new Date(),
        },
      ];

      const status = checkUserBlockedStatus("bad-actor", flags);
      expect(status.isBlocked).toBe(true);
      expect(status.reportCount).toBe(3);
    });

    it("blocks task creation when user is blocked", async () => {
      // Mock flags store with 3 reports for mock-seeker-id
      mockFlagsStore.push(
        {
          taskId: "t1",
          reporterId: "user-1",
          targetUserId: "mock-seeker-id",
          type: "report",
          createdAt: new Date(),
        },
        {
          taskId: "t2",
          reporterId: "user-2",
          targetUserId: "mock-seeker-id",
          type: "report",
          createdAt: new Date(),
        },
        {
          taskId: "t3",
          reporterId: "user-3",
          targetUserId: "mock-seeker-id",
          type: "report",
          createdAt: new Date(),
        }
      );

      const res = await createTask({
        companyId: "comp-1",
        helpTypes: ["הגשת קו\"ח"],
        thanksAmount: 50,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("חשבונך מושעה");
      }
    });
  });

  describe("Ratings Actions Integration", () => {
    it("records not_closed flag into mock store", async () => {
      const res = await flagNotClosed({
        taskId: "task-100",
        targetUserId: "target-seeker",
        reason: "עזרתי ולא סגרה",
      });

      expect(res.ok).toBe(true);
      expect(mockFlagsStore).toHaveLength(1);
      expect(mockFlagsStore[0].type).toBe("not_closed");
      expect(mockFlagsStore[0].targetUserId).toBe("target-seeker");
    });

    it("records no_reply flag into mock store", async () => {
      const res = await flagNoReply({
        taskId: "task-200",
        targetUserId: "target-helper",
        reason: "לקחה ולא ענתה",
      });

      expect(res.ok).toBe(true);
      expect(mockFlagsStore).toHaveLength(1);
      expect(mockFlagsStore[0].type).toBe("no_reply");
      expect(mockFlagsStore[0].targetUserId).toBe("target-helper");
    });

    it("records user report and returns blocked status when reaching 3", async () => {
      await reportUser({
        targetUserId: "user-xyz",
        reason: "דיווח ראשון על התנהגות פסולה",
      });
      await reportUser({
        targetUserId: "user-xyz",
        reason: "דיווח שני על התנהגות פסולה",
      });
      const res3 = await reportUser({
        targetUserId: "user-xyz",
        reason: "דיווח שלישי על התנהגות פסולה",
      });

      expect(res3.ok).toBe(true);
      if (res3.ok) {
        expect(res3.data.isBlocked).toBe(true);
      }
    });
  });
});
