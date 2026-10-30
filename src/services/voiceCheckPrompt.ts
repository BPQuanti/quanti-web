import type { AgencyArc, DailyTelemetryPayload } from '../types/telemetry';

export const MORNING_VOICE_PROMPT =
  "Name what's in the way today — a person, artifact, slot in the day, or tool.";

export const ONBOARDING_BOTTLENECK_PROMPT =
  'Last time this stalled — name the thing. A person, a missing artifact, a slot in the day, or a tool.';

export const VOICE_CHECK_SECONDS = 15;

export function voicePromptForPayload(_payload?: DailyTelemetryPayload): string {
  return MORNING_VOICE_PROMPT;
}

export function pickVoicePrompt(_arc?: AgencyArc, _salt = ''): string {
  return MORNING_VOICE_PROMPT;
}
