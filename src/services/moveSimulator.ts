import { applyExpandedHysteresis, type CapacityWindow } from './capacityWindow';
import { assertCardContract, hasGuiltCopy } from './cardContract';
import {
  campaignSlice,
  incrementPhase,
  sizingTriplets,
  type IncrementMissReason,
  type IncrementOutcome,
} from './nextIncrement';

export type SimAction =
  | { kind: 'done'; window?: CapacityWindow }
  | { kind: 'miss'; reason: IncrementMissReason; window?: CapacityWindow }
  | { kind: 'absent' };

export type SimDay = {
  day: number;
  date: string;
  outcome: IncrementOutcome;
  missReason: IncrementMissReason | null;
  window: CapacityWindow;
  leftoverCount: number;
  baselineCount: number;
  expandedStreak: number;
  phase: ReturnType<typeof incrementPhase>;
  cardText: string;
  why: string;
};

export type SimState = {
  destination: string;
  baselineCount: number;
  leftoverCount: number;
  expandedStreak: number;
  lastOutcome: IncrementOutcome;
  lastMissReason: IncrementMissReason | null;
  lastArtifact: string | null;
  lastDirective: string | null;
  daysAbsent: number;
  days: SimDay[];
};

const REENTRY_WHY = 'Today’s leftover is still here. Same destination. One sitting.';

function leftoverFromNoun(noun: string, fallback: number) {
  const match = noun.match(/(\d+)/);
  if (!match) {
    return fallback;
  }
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function dateForDay(day: number) {
  const base = new Date(2026, 0, 1, 12, 0, 0);
  base.setDate(base.getDate() + day);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  const date = String(base.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

export function createSimState(destination = 'Get 50 beta testers to sign up'): SimState {
  const baselineCount = campaignSlice(destination).count;
  return {
    destination,
    baselineCount,
    leftoverCount: baselineCount,
    expandedStreak: 0,
    lastOutcome: null,
    lastMissReason: null,
    lastArtifact: null,
    lastDirective: null,
    daysAbsent: 0,
    days: [],
  };
}

export function stepSimulator(state: SimState, action: SimAction): SimState {
  const requested: CapacityWindow =
    action.kind === 'absent' ? 'contracted' : action.window ?? 'baseline';
  const hysteresis = applyExpandedHysteresis({
    requested,
    expandedStreak: state.expandedStreak,
    leftoverCount: state.leftoverCount,
    baselineCount: state.baselineCount,
  });
  const phase = incrementPhase({
    destination: state.destination,
    yesterdayOutcome: state.lastOutcome,
    lastDirective: state.lastDirective,
    lastArtifact: state.lastArtifact,
    missReason: state.lastMissReason,
    daysAbsent: state.daysAbsent,
  });
  const triplets = sizingTriplets({
    destination: state.destination,
    yesterdayOutcome: state.lastOutcome,
    lastDirective: state.lastDirective,
    lastArtifact: state.lastArtifact,
    missReason: state.lastMissReason,
    daysAbsent: state.daysAbsent,
  });
  const card = triplets[hysteresis.window];
  const why =
    phase === 'reentry' || action.kind === 'absent'
      ? REENTRY_WHY
      : phase === 'shrink'
        ? 'Same leftover. Smaller physical scope.'
        : phase === 'shift'
          ? 'Same destination. Different leftover. Same window size.'
          : 'Today’s leftover toward the destination.';

  let leftoverCount = leftoverFromNoun(card.object, hysteresis.leftoverCount);
  if (phase === 'shrink') {
    leftoverCount = Math.max(1, Math.floor(state.leftoverCount / 2));
  } else if (phase === 'shift' || phase === 'reentry') {
    leftoverCount = state.leftoverCount;
    if (hysteresis.window === 'contracted') {
      leftoverCount = Math.max(1, Math.min(leftoverCount, Math.floor(state.baselineCount / 2) || leftoverCount));
    }
  } else if (hysteresis.window === 'expanded') {
    leftoverCount = hysteresis.leftoverCount;
  } else if (hysteresis.window === 'contracted') {
    leftoverCount = hysteresis.leftoverCount;
  } else {
    leftoverCount = state.baselineCount;
  }

  const outcome: IncrementOutcome =
    action.kind === 'done' ? 'executed' : action.kind === 'absent' ? 'unknown' : action.reason === 'too_big' ? 'partial' : 'shifted';
  const missReason: IncrementMissReason | null =
    action.kind === 'miss' ? action.reason : action.kind === 'done' ? 'none' : null;

  const day: SimDay = {
    day: state.days.length,
    date: dateForDay(state.days.length),
    outcome,
    missReason,
    window: hysteresis.window,
    leftoverCount,
    baselineCount: state.baselineCount,
    expandedStreak: hysteresis.expandedStreak,
    phase,
    cardText: card.card_text,
    why,
  };

  return {
    ...state,
    leftoverCount,
    expandedStreak: hysteresis.expandedStreak,
    lastOutcome: outcome,
    lastMissReason: missReason,
    lastArtifact: card.object,
    lastDirective: card.card_text,
    daysAbsent: action.kind === 'absent' ? state.daysAbsent + 1 : 0,
    days: [...state.days, day],
  };
}

export function runArc(actions: SimAction[], destination?: string) {
  return actions.reduce((state, action) => stepSimulator(state, action), createSimState(destination));
}

export function padActions(script: SimAction[], days = 60, fill: SimAction): SimAction[] {
  const next = script.slice(0, days);
  while (next.length < days) {
    next.push(fill);
  }
  return next;
}

export function assertDayCards(days: SimDay[]) {
  for (const day of days) {
    const contract = assertCardContract(day.cardText);
    if (!contract.ok) {
      throw new Error(`day ${day.day} card failed: ${contract.errors.join(', ')} — ${day.cardText}`);
    }
    if (hasGuiltCopy(day.cardText) || hasGuiltCopy(day.why)) {
      throw new Error(`day ${day.day} guilt copy: ${day.why}`);
    }
  }
}
