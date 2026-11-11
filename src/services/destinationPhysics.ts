import { restatesDestination } from './nextIncrement';

export type DestinationPhysicsMemory = {
  last_stall_reason?: string;
  last_artifact_noun?: string;
  last_entity_moved?: string;
  last_failed_scope?: string;
};

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
  'then',
  'today',
  'toward',
  'towards',
  'your',
  'one',
  'small',
  'step',
  'stop',
  'then',
]);

function clip(value: string, max = 120) {
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

export function emptyPhysics(): DestinationPhysicsMemory {
  return {};
}

export function asPhysicsMemory(value: unknown): DestinationPhysicsMemory {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return emptyPhysics();
  }
  const record = value as Record<string, unknown>;
  const next: DestinationPhysicsMemory = {};
  if (typeof record.last_stall_reason === 'string' && record.last_stall_reason.trim()) {
    next.last_stall_reason = clip(record.last_stall_reason);
  }
  if (typeof record.last_artifact_noun === 'string' && record.last_artifact_noun.trim()) {
    next.last_artifact_noun = clip(record.last_artifact_noun);
  }
  if (typeof record.last_entity_moved === 'string' && record.last_entity_moved.trim()) {
    next.last_entity_moved = clip(record.last_entity_moved);
  }
  if (typeof record.last_failed_scope === 'string' && record.last_failed_scope.trim()) {
    next.last_failed_scope = clip(record.last_failed_scope, 220);
  }
  return next;
}

export function nounFromMove(text: string | null | undefined): string {
  if (!text?.trim()) {
    return '';
  }
  const words = text
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const rest = words.slice(1).filter((word) => !STOP.has(word.toLowerCase()));
  return clip(rest.slice(0, 6).join(' ') || words.slice(1, 5).join(' '), 80);
}

function entityFromText(text: string | null | undefined): string {
  if (!text?.trim()) {
    return '';
  }
  const match = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/);
  if (match?.[1] && match[1].length > 2) {
    return clip(match[1], 60);
  }
  const tool = text.match(/\b(slack|email|figma|notion|linear|github|calendar|deck|proposal|invoice|contract)\b/i);
  return tool?.[1] ? clip(tool[1], 60) : '';
}

export function applyMarkToPhysics(
  current: DestinationPhysicsMemory | undefined,
  input: {
    status: 'executed' | 'partial' | 'shifted';
    primary_directive: string;
    transcript?: string | null;
    stallPattern?: string | null;
    destinationNext?: string | null;
  },
): DestinationPhysicsMemory {
  const prior = asPhysicsMemory(current);
  const dest = input.destinationNext?.trim() || '';
  const fromMove = nounFromMove(input.primary_directive);
  const fromVoice = nounFromMove(input.transcript);
  const artifact =
    (fromMove && (!dest || !restatesDestination(fromMove, dest)) ? fromMove : '') ||
    (fromVoice && (!dest || !restatesDestination(fromVoice, dest)) ? fromVoice : '') ||
    prior.last_artifact_noun ||
    '';
  const entity = entityFromText(input.transcript) || prior.last_entity_moved;
  const stall = clip(input.stallPattern || input.transcript || prior.last_stall_reason || '', 120);
  const next: DestinationPhysicsMemory = { ...prior };

  if (stall) {
    next.last_stall_reason = stall;
  }
  if (entity) {
    next.last_entity_moved = entity;
  }
  if (artifact) {
    next.last_artifact_noun = artifact;
  }

  if (input.status === 'executed') {
    delete next.last_failed_scope;
  } else {
    next.last_failed_scope = clip(input.primary_directive, 220);
  }
  return asPhysicsMemory(next);
}
