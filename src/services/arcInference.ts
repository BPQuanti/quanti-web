import type { AgencyArc } from '../types/telemetry';
import { isAgencyArc } from './arcSettings';

export function inferArcFromTranscript(text: string): AgencyArc {
  const spoken = text.toLowerCase();
  if (/\b(burnout|exhaust|recover|recovery|rest|sleep|unwind|overwhelmed)\b/.test(spoken)) {
    return 'recovery';
  }
  if (/\b(deal|capital|invest|revenue|money|finance|pricing)\b/.test(spoken)) {
    return 'capital';
  }
  if (/\b(body|gym|run|walk|zone.?2|somatic|metabolic)\b/.test(spoken)) {
    return 'somatic';
  }
  if (/\b(noise|overwhelm|admin|declutter|clarity|focus.?clean)\b/.test(spoken)) {
    return 'clarity';
  }
  if (/\b(ship|launch|sprint|build|momentum|ship it)\b/.test(spoken)) {
    return 'momentum';
  }
  return 'deep_work';
}

export function asInferredArc(value: unknown): AgencyArc | null {
  return typeof value === 'string' && isAgencyArc(value) ? value : null;
}
