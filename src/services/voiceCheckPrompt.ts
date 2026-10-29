import type { AgencyArc, DailyTelemetryPayload } from '../types/telemetry';

function clip(text: string, max = 40) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) {
    return cleaned;
  }
  return `${cleaned.slice(0, max - 3).trim()}…`;
}

function toward(payload: DailyTelemetryPayload): string {
  const next = payload.north_star?.next?.trim();
  if (next) {
    return clip(next);
  }
  const outcome = payload.north_star?.outcomes?.[0]?.trim();
  return outcome ? clip(outcome) : 'where you want to go';
}

function energyIsLow(payload: DailyTelemetryPayload): boolean {
  const sleep = payload.biometrics.sleep_hours;
  const hrv = payload.biometrics.hrv_delta_percent;
  const late = payload.screen_time.late_night_minutes ?? 0;
  const recovery = payload.biometrics.recovery_score;
  return (
    (sleep != null && sleep < 6) ||
    (hrv != null && hrv <= -12) ||
    late >= 40 ||
    (recovery != null && recovery < 40)
  );
}

function recoveryIsHigh(payload: DailyTelemetryPayload): boolean {
  const sleep = payload.biometrics.sleep_hours;
  const hrv = payload.biometrics.hrv_delta_percent;
  const recovery = payload.biometrics.recovery_score;
  return (
    (sleep != null && sleep >= 7.5) ||
    (hrv != null && hrv >= 8) ||
    (recovery != null && recovery >= 70)
  );
}

function hasNamedDestination(payload: DailyTelemetryPayload): boolean {
  const next = payload.north_star?.next?.trim() || '';
  return next.length >= 8 && next !== 'where you want to go';
}

/**
 * One 15s question that fills a hole the synthesizer cannot see from
 * destination + telemetry + yesterday's mark.
 */
export function voicePromptForPayload(payload: DailyTelemetryPayload): string {
  const next = toward(payload);
  const prior = payload.last_execution?.status;

  if (prior === 'shifted') {
    return 'What actually blocked yesterday’s 1% — people, energy, or a missing object?';
  }
  if (prior === 'partial') {
    return 'What leftover piece is still unfinished? Name the object.';
  }
  if (prior === 'executed') {
    return `What is the next named increment toward ${next}?`;
  }
  if (!hasNamedDestination(payload)) {
    return 'Name one object that would count as progress toward where you want to go.';
  }
  if (energyIsLow(payload)) {
    return 'Does your body match last night’s recovery, or is the number wrong?';
  }
  if (recoveryIsHigh(payload)) {
    return `Where will the day steal the one window toward ${next}?`;
  }
  if (!payload.voice_context?.transcript && !payload.voice.transcript) {
    return `Name the object toward ${next}: listing, email, file, or ask.`;
  }
  return `What will try to steal today’s 1% toward ${next}?`;
}

export function pickVoicePrompt(_arc: AgencyArc, _salt = ''): string {
  return 'What will steal today’s window, and what is the smallest named move?';
}
