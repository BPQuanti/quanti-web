export type MomentumTierName = 'Ignition' | 'Velocity' | 'Escape Velocity' | 'Orbit';

export type MomentumTier = {
  name: MomentumTierName;
  floor: number;
  ceiling: number | null;
  color: string;
  wash: string;
};

export type MomentumState = {
  score: number;
  streakRate: number;
  consecutiveMisses: number;
};

const BASE_POINTS = 10;

/** A duel starts both people at this base. The match streak, not the lifetime streak, raises it. */
export const DUEL_CARD_POINTS = 10;

export type DuelDay = 'verified' | 'missed';

/** Replay only the days inside one duel. Lifetime streak rate is not an input. */
export function scoreDuelDays(days: DuelDay[]) {
  let score = 0;
  let streakRate = 0;
  let consecutiveMisses = 0;
  for (const day of days) {
    if (day === 'verified') {
      const earned = pointsForStreak(streakRate + 1);
      streakRate += 1;
      consecutiveMisses = 0;
      score += earned;
      continue;
    }
    const misses = consecutiveMisses + 1;
    const loss = Math.round(score * decayRate(misses));
    score = Math.max(0, score - loss);
    streakRate = streakRate <= 0 ? 0 : Math.max(1, Math.floor(streakRate / 2));
    consecutiveMisses = misses;
  }
  return { score, streakRate, nextPoints: pointsForStreak(streakRate + 1) };
}

export function duelSideScore(days: DuelDay[] | undefined, verifiedCount: number) {
  const log = days && days.length ? days : Array.from({ length: Math.max(0, verifiedCount) }, () => 'verified' as const);
  return scoreDuelDays(log).score;
}

/** Winner banks their match score once. A stranger win pays double. A tie or a loss adds nothing. */
export function duelPurse(yourMatch: number, theirMatch: number, stranger = false) {
  if (yourMatch > theirMatch) return stranger ? yourMatch * 2 : yourMatch;
  return 0;
}

type MatchSides = {
  status: string;
  youAreOpponent: boolean;
  challengerDays?: DuelDay[];
  opponentDays?: DuelDay[];
  challengerVerified: number;
  opponentVerified: number;
  kind?: 'friend' | 'stranger';
};

export function matchSides(duel: MatchSides) {
  const yours = duel.youAreOpponent
    ? duelSideScore(duel.opponentDays, duel.opponentVerified)
    : duelSideScore(duel.challengerDays, duel.challengerVerified);
  const theirs = duel.youAreOpponent
    ? duelSideScore(duel.challengerDays, duel.challengerVerified)
    : duelSideScore(duel.opponentDays, duel.opponentVerified);
  const purse = duel.status === 'completed' ? duelPurse(yours, theirs, duel.kind === 'stranger') : 0;
  return { yours, theirs, purse };
}

export function pointsForStreak(streakRate: number) {
  if (streakRate <= 0) return BASE_POINTS;
  return Math.round(BASE_POINTS * (1 + streakRate / 10));
}

export function decayRate(consecutiveMisses: number) {
  if (consecutiveMisses <= 1) return 0.1;
  if (consecutiveMisses === 2) return 0.15;
  return 0.25;
}

export function tierFor(score: number): MomentumTier {
  if (score <= 250) {
    return { name: 'Ignition', floor: 0, ceiling: 250, color: '#F59E0B', wash: 'rgba(245, 158, 11, 0.14)' };
  }
  if (score <= 1000) {
    return { name: 'Velocity', floor: 251, ceiling: 1000, color: '#818CF8', wash: 'rgba(129, 140, 248, 0.16)' };
  }
  if (score <= 5000) {
    return { name: 'Escape Velocity', floor: 1001, ceiling: 5000, color: '#34D399', wash: 'rgba(52, 211, 153, 0.14)' };
  }
  return { name: 'Orbit', floor: 5001, ceiling: null, color: '#C084FC', wash: 'rgba(192, 132, 252, 0.16)' };
}

export function tierProgress(score: number) {
  const tier = tierFor(score);
  if (tier.ceiling == null) return 1;
  const span = Math.max(1, tier.ceiling - tier.floor);
  return Math.max(0, Math.min(1, (score - tier.floor) / span));
}

export type MomentumDay = {
  status: 'verified' | 'missed' | 'active';
  impact: number;
  note: string;
};

export function replayMomentum(statuses: MomentumDay['status'][]) {
  let score = 0;
  let streakRate = 0;
  let consecutiveMisses = 0;
  const days: MomentumDay[] = [];

  for (const status of statuses) {
    if (status === 'active') {
      days.push({
        status,
        impact: 0,
        note: `Still open. Verifying today pays +${pointsForStreak(streakRate + 1)}.`,
      });
      continue;
    }

    if (status === 'verified') {
      const earned = pointsForStreak(streakRate + 1);
      streakRate += 1;
      consecutiveMisses = 0;
      score += earned;
      days.push({
        status,
        impact: earned,
        note: `Verified. Streak rate is ${streakRate}. This day paid +${earned}.`,
      });
      continue;
    }

    const misses = consecutiveMisses + 1;
    const rate = decayRate(misses);
    const before = streakRate;
    const loss = Math.round(score * rate);
    score = Math.max(0, score - loss);
    streakRate = before <= 0 ? 0 : Math.max(1, Math.floor(before / 2));
    consecutiveMisses = misses;
    const percent = Math.round(rate * 100);
    days.push({
      status,
      impact: -loss,
      note: `Missed. Lost ${loss} (${percent}%). Streak rate cut from ${before} to ${streakRate}, not back to zero.`,
    });
  }

  return {
    days,
    score,
    streakRate,
    consecutiveMisses,
    nextPoints: pointsForStreak(streakRate + 1),
    tier: tierFor(score),
  };
}
