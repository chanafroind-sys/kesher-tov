import type { TaskRequirement } from "@/lib/actions/tasks";
import { isMockMode } from "@/lib/actions/types";

export interface SeekerReliability {
  taskCount: number;
  fairCloseRate: number; // 0 - 100%
  matchAccuracyAvg: number; // 0 - 100%
  isRestricted: boolean; // >= 3 not_closed flags -> max 2 tasks
  isBlocked: boolean; // >= 3 reports -> blocked
  showMetrics: boolean; // only after >= 3 tasks
}

export interface HelperReliability {
  helpedCount: number;
  replyRate: number; // 0 - 100%
  isDeprioritized: boolean; // >= 3 no_reply flags
  showMetrics: boolean; // only after >= 3 tasks
}

export interface UserReliability {
  seeker: SeekerReliability;
  helper: HelperReliability;
}

// In-memory flags store for dev/testing
export interface FlagRecord {
  taskId: string;
  reporterId: string;
  targetUserId: string;
  type: "not_closed" | "no_reply" | "report";
  reason?: string;
  createdAt: Date;
}

export const mockFlagsStore: FlagRecord[] = [];

export function clearMockFlagsStore(): void {
  mockFlagsStore.length = 0;
}

/**
 * Calculate match score based on requirements:
 * - required counts double (weight = 2)
 * - full = 100, partial = 50, no = 0
 */
export function calculateMatchScore(requirements: TaskRequirement[]): number {
  if (!requirements || requirements.length === 0) return 100;

  let totalWeight = 0;
  let weightedSum = 0;

  for (const req of requirements) {
    const weight = req.required ? 2 : 1;
    const score = req.match === "full" ? 100 : req.match === "partial" ? 50 : 0;
    totalWeight += weight;
    weightedSum += weight * score;
  }

  if (totalWeight === 0) return 100;
  return Math.round((weightedSum / (totalWeight * 100)) * 100);
}

/**
 * Check seeker limits according to reliability flags:
 * Default: max 5 open tasks.
 * If 3 distinct "not_closed" flags in past 12 months: limited to 2 open tasks.
 */
export function getSeekerLimits(
  targetUserId: string,
  flags: FlagRecord[] = mockFlagsStore,
  now: Date = new Date()
): { maxOpenTasks: number; isRestricted: boolean; notClosedFlagCount: number } {
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  // Distinct reporters in past 12 months
  const distinctReporters = new Set(
    flags
      .filter(
        (f) =>
          f.targetUserId === targetUserId &&
          f.type === "not_closed" &&
          f.createdAt >= oneYearAgo
      )
      .map((f) => f.reporterId)
  );

  const flagCount = distinctReporters.size;
  const isRestricted = flagCount >= 3;

  return {
    maxOpenTasks: isRestricted ? 2 : 5,
    isRestricted,
    notClosedFlagCount: flagCount,
  };
}

/**
 * Check if helper is deprioritized due to 3 distinct "no_reply" flags in past 12 months
 */
export function getHelperPriority(
  helperId: string,
  flags: FlagRecord[] = mockFlagsStore,
  now: Date = new Date()
): { isDeprioritized: boolean; noReplyFlagCount: number } {
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const distinctReporters = new Set(
    flags
      .filter(
        (f) =>
          f.targetUserId === helperId &&
          f.type === "no_reply" &&
          f.createdAt >= oneYearAgo
      )
      .map((f) => f.reporterId)
  );

  const count = distinctReporters.size;
  return {
    isDeprioritized: count >= 3,
    noReplyFlagCount: count,
  };
}

/**
 * Check if user should be blocked due to 3 distinct reports in past 12 months
 */
export function checkUserBlockedStatus(
  userId: string,
  flags: FlagRecord[] = mockFlagsStore,
  now: Date = new Date()
): { isBlocked: boolean; reportCount: number } {
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const distinctReporters = new Set(
    flags
      .filter(
        (f) =>
          f.targetUserId === userId &&
          f.type === "report" &&
          f.createdAt >= oneYearAgo
      )
      .map((f) => f.reporterId)
  );

  const count = distinctReporters.size;
  return {
    isBlocked: count >= 3,
    reportCount: count,
  };
}

/**
 * Retrieve user reliability stats
 */
export async function getUserReliability(userId: string): Promise<UserReliability> {
  const limits = getSeekerLimits(userId);
  const priority = getHelperPriority(userId);
  const blocked = checkUserBlockedStatus(userId);

  if (isMockMode()) {
    return {
      seeker: {
        taskCount: 4,
        fairCloseRate: 100,
        matchAccuracyAvg: 95,
        isRestricted: limits.isRestricted,
        isBlocked: blocked.isBlocked,
        showMetrics: true, // >= 3 tasks
      },
      helper: {
        helpedCount: 3,
        replyRate: 100,
        isDeprioritized: priority.isDeprioritized,
        showMetrics: true, // >= 3 tasks
      },
    };
  }

  // Live Supabase query fallback
  return {
    seeker: {
      taskCount: 0,
      fairCloseRate: 100,
      matchAccuracyAvg: 100,
      isRestricted: limits.isRestricted,
      isBlocked: blocked.isBlocked,
      showMetrics: false,
    },
    helper: {
      helpedCount: 0,
      replyRate: 100,
      isDeprioritized: priority.isDeprioritized,
      showMetrics: false,
    },
  };
}
