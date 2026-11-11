export type CapacityWindow = 'contracted' | 'baseline' | 'expanded';

export type MoveCard = {
  verb: string;
  object: string;
  done_condition: string;
  card_text: string;
};

export type DirectiveTriplets = {
  contracted: MoveCard;
  baseline: MoveCard;
  expanded: MoveCard;
};

/** Consecutive expanded days allowed before the window snaps back to baseline. */
export const EXPANDED_STREAK_CAP = 2;
/** Expanded leftover may not exceed this multiple of the campaign baseline. */
export const EXPANDED_COUNT_CAP_RATIO = 1.5;

export function asCapacityWindow(value: unknown): CapacityWindow | null {
  return value === 'contracted' || value === 'baseline' || value === 'expanded' ? value : null;
}

export function expandedCountCap(baselineCount: number) {
  return Math.max(baselineCount, Math.ceil(baselineCount * EXPANDED_COUNT_CAP_RATIO));
}

/** Expanded may grow once, then must return to baseline. Never compound leftover count. */
export function applyExpandedHysteresis(input: {
  requested: CapacityWindow;
  expandedStreak: number;
  leftoverCount: number;
  baselineCount: number;
}): { window: CapacityWindow; leftoverCount: number; expandedStreak: number } {
  const baseline = Math.max(1, input.baselineCount);
  const cap = expandedCountCap(baseline);
  if (input.requested !== 'expanded') {
    const leftover =
      input.requested === 'contracted' ? Math.max(1, Math.floor(baseline / 2)) : baseline;
    return { window: input.requested, leftoverCount: leftover, expandedStreak: 0 };
  }
  if (input.expandedStreak >= EXPANDED_STREAK_CAP || input.leftoverCount >= cap) {
    return { window: 'baseline', leftoverCount: baseline, expandedStreak: 0 };
  }
  const grown = Math.min(cap, Math.max(baseline, Math.round(baseline * 1.2)));
  return {
    window: 'expanded',
    leftoverCount: grown,
    expandedStreak: input.expandedStreak + 1,
  };
}

/** Never step up to expanded. Low confidence / no voice / drop → baseline unless HealthKit already contracted. */
export function selectCapacityWindow(input: {
  healthkit?: boolean;
  energyLow?: boolean;
  voiceWindow?: CapacityWindow | null;
  confidence?: 'high' | 'low';
}): CapacityWindow {
  const confidence = input.confidence ?? 'low';
  const voice = input.voiceWindow ?? null;
  if (confidence === 'low' || voice == null) {
    if (input.healthkit === true && input.energyLow) {
      return 'contracted';
    }
    return 'baseline';
  }
  if (input.energyLow || voice === 'contracted') {
    return 'contracted';
  }
  return 'baseline';
}

function asMoveCard(value: unknown): MoveCard | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Partial<MoveCard>;
  if (
    typeof record.verb !== 'string' ||
    typeof record.object !== 'string' ||
    typeof record.done_condition !== 'string' ||
    typeof record.card_text !== 'string'
  ) {
    return null;
  }
  const card_text = record.card_text.replace(/\s+/g, ' ').trim();
  if (!card_text) {
    return null;
  }
  return {
    verb: record.verb.trim(),
    object: record.object.trim(),
    done_condition: record.done_condition.trim(),
    card_text,
  };
}

export function asDirectiveTriplets(value: unknown): DirectiveTriplets | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const contracted = asMoveCard(record.contracted);
  const baseline = asMoveCard(record.baseline);
  const expanded = asMoveCard(record.expanded);
  if (!contracted || !baseline || !expanded) {
    return null;
  }
  return { contracted, baseline, expanded };
}

export function cardFromTriplets(
  triplets: DirectiveTriplets | null | undefined,
  window: CapacityWindow,
): MoveCard | null {
  if (!triplets) {
    return null;
  }
  return triplets[window] ?? triplets.baseline ?? null;
}
