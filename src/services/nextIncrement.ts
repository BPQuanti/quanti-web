const STOP = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'to',
  'for',
  'of',
  'on',
  'in',
  'at',
  'get',
  'got',
  'make',
  'then',
  'today',
  'toward',
  'towards',
  'your',
  'this',
  'that',
  'with',
  'from',
  'into',
  'one',
  'next',
  'then',
]);

import type { CapacityWindow, DirectiveTriplets, MoveCard } from './capacityWindow';

export type IncrementOutcome = 'executed' | 'partial' | 'shifted' | 'unknown' | null;
export type IncrementMissReason = 'too_big' | 'wrong_move' | 'exogenous' | 'none';

export type CampaignSlice = {
  count: number;
  unit: string;
  campaignNumber: number | null;
};

export function significantTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 4 && !STOP.has(word));
}

export function restatesDestination(text: string, destination: string): boolean {
  const dest = destination.replace(/\s+/g, ' ').trim().toLowerCase();
  const hay = text.replace(/\s+/g, ' ').trim().toLowerCase();
  if (!dest || dest.length < 8 || !hay) {
    return false;
  }
  if (hay.includes(dest) || (hay.length >= 12 && dest.includes(hay))) {
    return true;
  }
  const destTokens = significantTokens(dest);
  const haySet = new Set(significantTokens(hay));
  if (destTokens.length < 3) {
    return destTokens.length > 0 && destTokens.every((token) => hay.includes(token));
  }
  const hits = destTokens.filter((token) => haySet.has(token) || hay.includes(token)).length;
  return hits / destTokens.length >= 0.7;
}

export function sameMove(left: string | null | undefined, right: string | null | undefined): boolean {
  if (!left?.trim() || !right?.trim()) {
    return false;
  }
  const a = significantTokens(left);
  const b = significantTokens(right);
  if (!a.length || !b.length) {
    return left.replace(/\s+/g, ' ').trim().toLowerCase() === right.replace(/\s+/g, ' ').trim().toLowerCase();
  }
  const aSet = new Set(a);
  const hits = b.filter((token) => aSet.has(token)).length;
  return hits / Math.max(a.length, b.length) >= 0.75;
}

export function campaignSlice(destination: string): CampaignSlice {
  const text = destination.replace(/\s+/g, ' ').trim();
  const match = text.match(/\b(\d{1,5})\b/);
  const campaignNumber = match ? Number(match[1]) : null;
  const n = campaignNumber && Number.isFinite(campaignNumber) ? campaignNumber : 0;
  const count = n >= 50 ? 10 : n >= 20 ? 5 : n >= 5 ? Math.max(1, Math.floor(n / 5)) : n >= 2 ? 1 : 10;
  let unit = 'named leftover artifacts';
  if (/\b(tester|beta)\b/i.test(text)) {
    unit = 'beta testers';
  } else if (/\binvite/i.test(text)) {
    unit = 'invites';
  } else if (/\b(signup|sign[- ]up|user|people|person|customer|client)\b/i.test(text)) {
    unit = 'people';
  } else if (/\b(email|message|dm|post)\b/i.test(text)) {
    unit = 'messages';
  }
  if (!n) {
    return { count: 1, unit: 'named leftover artifact', campaignNumber: null };
  }
  return { count, unit, campaignNumber };
}

export function usableArtifact(artifact: string | null | undefined, destination: string): string {
  const text = artifact?.replace(/\s+/g, ' ').trim() || '';
  if (!text || restatesDestination(text, destination)) {
    return '';
  }
  return text.slice(0, 80);
}

export function incrementPhase(input: {
  destination: string;
  yesterdayOutcome?: IncrementOutcome;
  lastDirective?: string | null;
  lastArtifact?: string | null;
  missReason?: IncrementMissReason | null;
  daysAbsent?: number;
}): 'name_list' | 'send_batch' | 'shrink' | 'shift' | 'reentry' {
  if (input.missReason === 'too_big' || input.yesterdayOutcome === 'partial') {
    return 'shrink';
  }
  if (
    input.missReason === 'wrong_move' ||
    input.missReason === 'exogenous' ||
    input.yesterdayOutcome === 'shifted'
  ) {
    return 'shift';
  }
  if ((input.daysAbsent ?? 0) >= 2 || input.yesterdayOutcome === 'unknown') {
    return 'reentry';
  }
  if (input.yesterdayOutcome === 'executed') {
    return 'send_batch';
  }
  return 'name_list';
}

export function sliceMove(input: {
  destination: string;
  yesterdayOutcome?: IncrementOutcome;
  lastDirective?: string | null;
  lastArtifact?: string | null;
  missReason?: IncrementMissReason | null;
  daysAbsent?: number;
}): { verb: 'Name' | 'Send' | 'Draft'; noun: string; scale: 'full' | 'scaled_down_50_percent' } {
  const slice = campaignSlice(input.destination);
  const phase = incrementPhase(input);
  const kept = usableArtifact(input.lastArtifact, input.destination);
  if (phase === 'shrink') {
    const n = Math.max(1, Math.floor(slice.count / 2));
    return {
      verb: 'Send',
      noun: kept && !/\d/.test(kept) ? `2 smaller pieces of ${kept}` : `${n} ${slice.unit} from yesterday’s leftover`,
      scale: 'scaled_down_50_percent',
    };
  }
  if (phase === 'shift') {
    return {
      verb: 'Name',
      noun: 'a different named leftover',
      scale: 'full',
    };
  }
  if (phase === 'reentry') {
    return {
      verb: 'Send',
      noun: kept && kept.length < 40 ? kept : `${Math.max(1, Math.floor(slice.count / 2))} ${slice.unit}`,
      scale: 'full',
    };
  }
  if (phase === 'send_batch') {
    return {
      verb: 'Send',
      noun: kept ? `${slice.count} ${slice.unit} from yesterday’s list` : `${slice.count} ${slice.unit} as the next batch`,
      scale: 'full',
    };
  }
  return {
    verb: 'Name',
    noun: `${slice.count} ${slice.unit} to invite or move today`,
    scale: 'full',
  };
}

function clipWords(text: string, max = 20) {
  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  return words.slice(0, max).join(' ');
}

export function incrementSentence(input: {
  destination: string;
  yesterdayOutcome?: IncrementOutcome;
  lastDirective?: string | null;
  lastArtifact?: string | null;
  missReason?: IncrementMissReason | null;
  daysAbsent?: number;
}): string {
  return sizingTriplets(input).baseline.card_text;
}

function padUntilCard(verb: string, object: string, until: string): MoveCard {
  const done = until.startsWith('until ') ? until : `until ${until}`;
  const pad = ['in', 'one', 'sitting', 'then', 'stop', 'keep', 'leftover', 'named'];
  const core = `${verb} ${object} ${done}`.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const words = core.slice();
  let i = 0;
  while (words.length < 15) {
    words.push(pad[i % pad.length]);
    i += 1;
  }
  const text = words.slice(0, 20).join(' ');
  return {
    verb,
    object,
    done_condition: done,
    card_text: text,
  };
}

function bumpCount(noun: string, factor: number) {
  const numbered = noun.match(/^(\d+)\s+(.*)$/);
  if (numbered) {
    const next = Math.max(1, Math.round(Number(numbered[1]) * factor));
    return `${next} ${numbered[2]}`.trim();
  }
  if (factor < 1) {
    return `2 smaller pieces of ${noun}`.slice(0, 80);
  }
  return noun.slice(0, 80);
}

export function sizingTriplets(input: {
  destination: string;
  yesterdayOutcome?: IncrementOutcome;
  lastDirective?: string | null;
  lastArtifact?: string | null;
  missReason?: IncrementMissReason | null;
  daysAbsent?: number;
}): DirectiveTriplets {
  const move = sliceMove(input);
  const contracted = padUntilCard(move.verb, bumpCount(move.noun, 0.5), 'that smaller leftover is done');
  const baseline = padUntilCard(move.verb, move.noun, 'that leftover is done');
  const expanded = padUntilCard(move.verb, bumpCount(move.noun, 1.2), 'the extra leftover is done');
  return { contracted, baseline, expanded };
}

export function pickTriplet(triplets: DirectiveTriplets, window: CapacityWindow): MoveCard {
  return triplets[window] ?? triplets.baseline;
}
