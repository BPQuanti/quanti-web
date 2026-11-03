import type { AgencyArc, DailyTelemetryPayload } from '../types/telemetry';

export const MORNING_VOICE_PROMPT =
  "Name what's in the way today — a person, artifact, slot in the day, or tool.";

export const ONBOARDING_BOTTLENECK_PROMPT =
  'Last time this stalled — name the thing. A person, a missing artifact, a slot in the day, or a tool.';

export const VOICE_CHECK_SECONDS = 15;

export const QUESTION_ANGLES = ['BOTTLENECK', 'ARTIFACT', 'PERSON'] as const;
export type QuestionAngle = (typeof QUESTION_ANGLES)[number];

export function asQuestionAngle(value: unknown): QuestionAngle {
  if (value === 'ARTIFACT' || value === 'PERSON') {
    return value;
  }
  if (value === 'LEFTOVER') {
    return 'ARTIFACT';
  }
  return 'BOTTLENECK';
}

export type GuidedQuestionInput = {
  destinationNext?: string | null;
  stallPattern?: string | null;
  yesterdayStatus?: 'executed' | 'partial' | 'shifted' | null;
  date?: string | null;
  angle?: QuestionAngle | null;
};

function clip(text: string, max = 42) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) {
    return cleaned;
  }
  return `${cleaned.slice(0, max - 3).trim()}…`;
}

function nounFromStall(stall: string) {
  const cleaned = stall.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return '';
  }
  const words = cleaned.split(' ').slice(0, 8).join(' ');
  return clip(words, 36);
}

export function rotateQuestionAngle(
  current?: string | null,
  yesterdayStatus?: 'executed' | 'partial' | 'shifted' | null,
): QuestionAngle {
  if (yesterdayStatus === 'partial') {
    return 'ARTIFACT';
  }
  if (yesterdayStatus === 'shifted') {
    return 'BOTTLENECK';
  }
  const from = asQuestionAngle(current);
  const index = QUESTION_ANGLES.indexOf(from);
  return QUESTION_ANGLES[(index + 1) % QUESTION_ANGLES.length];
}

/** One operational question. Three physical lenses only. */
export function composeGuidedQuestion(input: GuidedQuestionInput = {}): string {
  const next = clip(input.destinationNext?.trim() || 'your Active Destination', 40);
  const stall = nounFromStall(input.stallPattern || '');
  const status = input.yesterdayStatus ?? null;
  const angle = asQuestionAngle(input.angle ?? rotateQuestionAngle('BOTTLENECK', status));

  if (angle === 'ARTIFACT' || status === 'partial') {
    return `What is the next physical artifact toward ${next}? Name one smaller object, not the whole destination.`;
  }
  if (angle === 'PERSON') {
    return `Who or what has to move for ${next} today? Name the person, tool, or object.`;
  }
  return stall
    ? `What is in the way of ${next} the same way as ${stall}?`
    : `What is in the way of ${next} today — a person, artifact, or tool?`;
}

export function voicePromptForPayload(payload?: DailyTelemetryPayload): string {
  if (!payload) {
    return MORNING_VOICE_PROMPT;
  }
  return composeGuidedQuestion({
    destinationNext: payload.north_star?.next || payload.north_star?.now,
    stallPattern: payload.stall_pattern,
    yesterdayStatus: payload.synthesis_mode === 'onboarding' ? null : payload.last_execution?.status ?? null,
    date: payload.local_date,
  });
}

export function pickVoicePrompt(_arc?: AgencyArc, _salt = ''): string {
  return MORNING_VOICE_PROMPT;
}
