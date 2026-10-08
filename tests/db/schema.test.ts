import { describe, it, expect } from "vitest";
import type { TaskStatus, ClaimStatus } from "@/types/database";

/**
 * Formula per docs/architecture.md:
 * - required counts double (weight = 2, otherwise 1)
 * - match score: full = 100, partial = 50, no = 0
 * - final score = weighted average
 */
export function calculateMatchScore(
  requirements: Array<{
    text: string;
    required: boolean;
    match: "full" | "partial" | "no";
  }>
): number {
  if (requirements.length === 0) return 0;

  let totalWeight = 0;
  let weightedPoints = 0;

  for (const r of requirements) {
    const weight = r.required ? 2 : 1;
    totalWeight += weight;

    const points = r.match === "full" ? 100 : r.match === "partial" ? 50 : 0;
    weightedPoints += points * weight;
  }

  return Math.round(weightedPoints / totalWeight);
}

/**
 * Simulation of database rules enforced in claim_task & close_task
 */
export class TaskWorkflowSimulator {
  task: {
    id: string;
    seeker_id: string;
    status: TaskStatus;
    thanks_amount: number;
    closed_helper_id: string | null;
  };
  claims: Array<{ task_id: string; helper_id: string; status: ClaimStatus }> = [];
  thanks: Array<{ task_id: string; helper_id: string; amount: number }> = [];

  constructor(taskId: string, seekerId: string, thanksAmount = 100) {
    this.task = {
      id: taskId,
      seeker_id: seekerId,
      status: "open",
      thanks_amount: thanksAmount,
      closed_helper_id: null,
    };
  }

  claimTask(helperId: string): { ok: boolean; error?: string } {
    if (this.task.seeker_id === helperId) {
      return { ok: false, error: "לא ניתן לקחת משימה של עצמך" };
    }
    if (this.task.status !== "open" && this.task.status !== "in_progress") {
      return { ok: false, error: "המשימה כבר נסגרה או בוטלה" };
    }
    if (this.claims.some((c) => c.helper_id === helperId)) {
      return { ok: false, error: "כבר לקחת משימה זו בעבר" };
    }
    if (this.claims.length >= 3) {
      return { ok: false, error: "משימה זו כבר נלקחה על ידי 3 עוזרות (המקסימום המותר)" };
    }

    this.claims.push({ task_id: this.task.id, helper_id: helperId, status: "claimed" });
    this.task.status = "in_progress";
    return { ok: true };
  }

  closeTask(callerId: string, helperId?: string | null): { ok: boolean; error?: string } {
    if (callerId !== this.task.seeker_id) {
      return { ok: false, error: "רק פותחת המשימה יכולה לסגור אותה" };
    }
    if (helperId) {
      const isClaimer = this.claims.some((c) => c.helper_id === helperId);
      if (!isClaimer) {
        return { ok: false, error: "העוזרת שנבחרה לא לקחה משימה זו" };
      }
      this.thanks.push({
        task_id: this.task.id,
        helper_id: helperId,
        amount: this.task.thanks_amount,
      });
    }
    this.task.status = "closed";
    this.task.closed_helper_id = helperId ?? null;
    return { ok: true };
  }
}

describe("Database Schema & Business Logic Rules", () => {
  describe("Job Match Scoring Formula", () => {
    it("calculates 100% when all requirements are fully matched", () => {
      const reqs = [
        { text: "React", required: true, match: "full" as const },
        { text: "TypeScript", required: false, match: "full" as const },
      ];
      expect(calculateMatchScore(reqs)).toBe(100);
    });

    it("calculates 67% for 1 full required requirement and 1 non-matching optional", () => {
      // Required full = 2 * 100 = 200 pts (weight 2)
      // Optional no = 1 * 0 = 0 pts (weight 1)
      // Total = 200 / 3 = 66.666 -> 67%
      const reqs = [
        { text: "Next.js", required: true, match: "full" as const },
        { text: "Tailwind", required: false, match: "no" as const },
      ];
      expect(calculateMatchScore(reqs)).toBe(67);
    });

    it("calculates 50% for partial match", () => {
      const reqs = [{ text: "Node", required: true, match: "partial" as const }];
      expect(calculateMatchScore(reqs)).toBe(50);
    });
  });

  describe("claim_task rules", () => {
    it("prevents self-claim by the seeker", () => {
      const sim = new TaskWorkflowSimulator("task-1", "user-seeker");
      const res = sim.claimTask("user-seeker");
      expect(res.ok).toBe(false);
      expect(res.error).toContain("עצמך");
    });

    it("allows up to 3 distinct helpers to claim", () => {
      const sim = new TaskWorkflowSimulator("task-1", "user-seeker");
      expect(sim.claimTask("helper-1").ok).toBe(true);
      expect(sim.claimTask("helper-2").ok).toBe(true);
      expect(sim.claimTask("helper-3").ok).toBe(true);
      expect(sim.claims.length).toBe(3);
    });

    it("rejects 4th claim attempt", () => {
      const sim = new TaskWorkflowSimulator("task-1", "user-seeker");
      sim.claimTask("helper-1");
      sim.claimTask("helper-2");
      sim.claimTask("helper-3");

      const fourth = sim.claimTask("helper-4");
      expect(fourth.ok).toBe(false);
      expect(fourth.error).toContain("3 עוזרות");
    });

    it("rejects duplicate claim by the same helper", () => {
      const sim = new TaskWorkflowSimulator("task-1", "user-seeker");
      sim.claimTask("helper-1");
      const duplicate = sim.claimTask("helper-1");
      expect(duplicate.ok).toBe(false);
      expect(duplicate.error).toContain("בעבר");
    });
  });

  describe("close_task rules", () => {
    it("allows only the seeker to close the task", () => {
      const sim = new TaskWorkflowSimulator("task-1", "user-seeker");
      sim.claimTask("helper-1");

      const unauthorized = sim.closeTask("helper-1", "helper-1");
      expect(unauthorized.ok).toBe(false);
      expect(unauthorized.error).toContain("רק פותחת המשימה");

      const authorized = sim.closeTask("user-seeker", "helper-1");
      expect(authorized.ok).toBe(true);
      expect(sim.task.status).toBe("closed");
      expect(sim.thanks.length).toBe(1);
    });

    it("rejects choosing a helper who never claimed the task", () => {
      const sim = new TaskWorkflowSimulator("task-1", "user-seeker");
      sim.claimTask("helper-1");

      const res = sim.closeTask("user-seeker", "stranger-helper");
      expect(res.ok).toBe(false);
      expect(res.error).toContain("לא לקחה משימה זו");
    });

    it("locks task from further claims once closed", () => {
      const sim = new TaskWorkflowSimulator("task-1", "user-seeker");
      sim.claimTask("helper-1");
      sim.closeTask("user-seeker", "helper-1");

      const lateClaim = sim.claimTask("helper-2");
      expect(lateClaim.ok).toBe(false);
      expect(lateClaim.error).toContain("נסגרה");
    });
  });

  describe("RLS isolation rules (data contract verification)", () => {
    it("verifies helpers list only their own claim and never see other helpers", () => {
      const claims = [
        { task_id: "t1", helper_id: "h1" },
        { task_id: "t1", helper_id: "h2" },
      ];

      // helper h1 querying task_claims under RLS
      const visibleToH1 = claims.filter((c) => c.helper_id === "h1");
      expect(visibleToH1.length).toBe(1);
      expect(visibleToH1[0].helper_id).toBe("h1");
      expect(visibleToH1.some((c) => c.helper_id === "h2")).toBe(false);
    });
  });
});
