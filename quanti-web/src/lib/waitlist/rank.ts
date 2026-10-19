export const JUMP_PER_REFERRAL = 20;
/** @deprecated Use JUMP_PER_REFERRAL. Kept so older call sites still compile. */
export const JUMP_PER_BATCH = JUMP_PER_REFERRAL;
export const BATCH_SIZE = 1;

export type WaitlistRank = {
  currentRank: number;
  totalJumps: number;
  remainingForNextJump: number;
  progressToNextJump: number;
  isTop500: boolean;
};

export function rankWaitlistPosition(initialPosition: number, referralCount: number): WaitlistRank {
  const safeCount = Math.max(0, Math.floor(referralCount));
  const totalJumps = safeCount * JUMP_PER_REFERRAL;
  const currentRank = Math.max(1, initialPosition - totalJumps);

  return {
    currentRank,
    totalJumps,
    remainingForNextJump: 1,
    progressToNextJump: 0,
    isTop500: currentRank <= 500,
  };
}

export function waitlistShareMessage(referralUrl: string) {
  return `I just joined the waitlist for Quanti—a privacy-first behavioral OS with 15-second voice telemetry and smart friction, not app locks. Skip the line here: ${referralUrl}`;
}

export function waitlistViralRuleCopy() {
  return `Share your unique link with friends: Every friend who signs up moves you up ${JUMP_PER_REFERRAL} spots in the waitlist!`;
}
