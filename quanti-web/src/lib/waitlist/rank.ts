export const JUMP_PER_BATCH = 50;
export const BATCH_SIZE = 3;

export type WaitlistRank = {
  currentRank: number;
  totalJumps: number;
  remainingForNextJump: number;
};

export function rankWaitlistPosition(initialPosition: number, referralCount: number): WaitlistRank {
  const safeCount = Math.max(0, Math.floor(referralCount));
  const totalJumps = Math.floor(safeCount / BATCH_SIZE) * JUMP_PER_BATCH;
  const currentRank = Math.max(1, initialPosition - totalJumps);
  const remainingForNextJump = BATCH_SIZE - (safeCount % BATCH_SIZE);

  return { currentRank, totalJumps, remainingForNextJump };
}
