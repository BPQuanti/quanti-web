import type { AgencyArc, DailyTelemetryPayload } from '../types/telemetry';

export const MORNING_VOICE_PROMPT =
  "Speak for 10-15 seconds: What's on your mind or in your way today?";

export const VOICE_CHECK_SECONDS = 15;

export function voicePromptForPayload(_payload?: DailyTelemetryPayload): string {
  return MORNING_VOICE_PROMPT;
}

export function pickVoicePrompt(_arc?: AgencyArc, _salt = ''): string {
  return MORNING_VOICE_PROMPT;
}
