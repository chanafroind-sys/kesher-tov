import type { HelperRelation } from "@/types/database";

export interface HelperCandidate {
  id: string;
  name: string;
  email: string;
  relation: HelperRelation;
  replyRate: number; // 0-100
  isDeprioritized: boolean;
  isMuted?: boolean;
}

export interface WavePlan {
  waveNumber: number;
  delayHours: number;
  helpers: HelperCandidate[];
}

export interface WaveDispatchPlan {
  taskId: string;
  totalHelpers: number;
  waves: WavePlan[];
  seekerIsRestricted: boolean;
  batchSize: number;
}

const RELATION_WEIGHTS: Record<HelperRelation, number> = {
  current_employee: 300,
  past_employee: 200,
  close_connection: 100,
};

/**
 * Calculates a sorting priority for a helper.
 * Higher score = higher priority (placed in earlier wave).
 */
export function calculateHelperPriorityScore(candidate: HelperCandidate): number {
  if (candidate.isMuted) return -Infinity;

  let score = 0;
  // Relation weight
  score += RELATION_WEIGHTS[candidate.relation] ?? 100;
  // Responsiveness / reply rate weight
  score += Math.max(0, Math.min(100, candidate.replyRate));

  // If deprioritized due to repeated no_reply flags, severely lower score
  if (candidate.isDeprioritized) {
    score -= 1000;
  }

  return score;
}

/**
 * Plan staggered dispatch waves for helpers of a company.
 * - Filters out muted helpers.
 * - Sorts helpers by priority (active employee > past employee > close connection, high reply rate first, deprioritized last).
 * - Determines wave batch size (restricted seeker gets smaller waves of 2; standard seeker gets waves of 3).
 * - Spreads waves across 24h intervals.
 */
export function planHelperWaves({
  taskId,
  helpers,
  seekerIsRestricted = false,
  customBatchSize,
}: {
  taskId: string;
  helpers: HelperCandidate[];
  seekerIsRestricted?: boolean;
  customBatchSize?: number;
}): WaveDispatchPlan {
  // 1. Filter active (non-muted) helpers
  const activeHelpers = helpers.filter((h) => !h.isMuted);

  // 2. Sort by priority score descending
  const sorted = [...activeHelpers].sort((a, b) => {
    return calculateHelperPriorityScore(b) - calculateHelperPriorityScore(a);
  });

  // 3. Determine batch size
  // Architecture rule: restricted seekers get smaller waves (2 per wave) vs standard (3 per wave)
  const batchSize = customBatchSize ?? (seekerIsRestricted ? 2 : 3);

  // 4. Divide into waves with 24-hour delays
  const waves: WavePlan[] = [];
  let waveIdx = 0;

  for (let i = 0; i < sorted.length; i += batchSize) {
    const chunk = sorted.slice(i, i + batchSize);
    waves.push({
      waveNumber: waveIdx + 1,
      delayHours: waveIdx * 24, // wave 1 = 0h (immediate), wave 2 = 24h, wave 3 = 48h
      helpers: chunk,
    });
    waveIdx++;
  }

  return {
    taskId,
    totalHelpers: sorted.length,
    waves,
    seekerIsRestricted,
    batchSize,
  };
}

/**
 * Evaluates whether subsequent wave dispatch should proceed.
 * If task already reached max 3 claims or is closed, further waves are cancelled.
 */
export function shouldDispatchNextWave({
  currentClaimCount,
  taskStatus,
}: {
  currentClaimCount: number;
  taskStatus: "open" | "in_progress" | "closed" | "cancelled" | "expired";
}): boolean {
  if (taskStatus !== "open" && taskStatus !== "in_progress") {
    return false;
  }
  // Max 3 claims allowed per task in community guidelines
  return currentClaimCount < 3;
}
