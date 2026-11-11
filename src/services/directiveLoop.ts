import type { DailyDirective, DailyTelemetryPayload } from '../types/telemetry';
import { selectCapacityWindow } from './capacityWindow';
import { incrementSentence, sizingTriplets } from './nextIncrement';
import { voicePromptForPayload } from './voiceCheckPrompt';

function clip(text: string, max = 56) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) {
    return cleaned;
  }
  return `${cleaned.slice(0, max - 3).trim()}…`;
}

export function towardLabel(payload: DailyTelemetryPayload): string {
  const next = payload.north_star?.next?.trim();
  if (next) {
    return clip(next, 72);
  }
  const outcome = payload.north_star?.outcomes?.[0]?.trim();
  return outcome ? clip(outcome, 72) : 'your Active Target';
}

export function energyIsLow(payload: DailyTelemetryPayload): boolean {
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

export function whyFromPayload(payload: DailyTelemetryPayload): string {
  return closedLoopFallback(payload).why_today ?? `Today’s 1% is toward ${towardLabel(payload)}.`;
}

export function closedLoopFallback(payload: DailyTelemetryPayload): DailyDirective {
  const toward = towardLabel(payload);
  const prior = payload.synthesis_mode === 'onboarding' ? undefined : payload.last_execution;
  const low = energyIsLow(payload) && payload.healthkit === true;
  const voice = payload.voice_context?.transcript?.trim() || payload.voice.transcript?.trim();
  const retry = payload.artifact_retry === true;

  const dest = payload.north_star?.next?.trim() || toward;
  const sliceInput = {
    destination: dest,
    yesterdayOutcome: prior?.status ?? null,
    lastDirective: prior?.primary_directive ?? null,
    lastArtifact: payload.physics_memory?.last_artifact_noun ?? null,
  };
  const triplets = sizingTriplets(sliceInput);
  const window = selectCapacityWindow({
    healthkit: payload.healthkit === true,
    energyLow: low,
    voiceWindow: null,
    confidence: 'low',
  });
  let primary = triplets[window].card_text || incrementSentence(sliceInput);
  let why = voice
    ? `Today’s 1% is a leftover toward ${toward}, around the stall you named.`
    : `Today’s 1% is a leftover object toward ${toward} — not the destination restated.`;
  let blocks = [`One leftover increment toward ${toward}.`];
  if (retry) {
    primary = triplets[window].card_text;
    why = `The last card restated the destination. Today’s 1% has to leave a smaller object behind.`;
  }

  if (prior?.status === 'shifted') {
    why = `Yesterday you shifted. Same destination. Smaller physical leftover.`;
    blocks = [`Smaller leftover toward ${toward}.`];
  } else if (prior?.status === 'partial') {
    why = `Yesterday was partial. Same destination. Smaller physical scope.`;
    blocks = [`One smaller leftover toward ${toward}.`];
  } else if (prior?.status === 'executed') {
    why = `Yesterday executed. Today is the next leftover, not the same card.`;
    blocks = [`Next leftover toward ${toward}.`];
  }

  if (low) {
    why = `${why} Energy is bounded today, so keep the leftover small.`;
  }

  if (payload.target_stale) {
    primary = `Name the missing artifact that would make “${clip(toward, 40)}” checkable today, then finish only that.`;
    why = `This Active Target has been open a long time. Shrink to one object. Do not invent a new destination.`;
    blocks = [`One embarrassingly small artifact toward ${toward}.`];
  }

  if (voice) {
    blocks = [`Spoken answer heard. Keep the action concrete toward ${toward}.`, ...blocks].slice(0, 2);
  }

  return {
    primary_directive: primary,
    recovery_actions: low
      ? ['Keep tonight’s feeds short so tomorrow’s first window stays intact.']
      : ['Keep one recovery buffer so the day does not become all output.'],
    focus_blocks: blocks.slice(0, 2),
    triplets,
    selected_window: window,
    source: 'local_fallback',
    voice_prompt: voicePromptForPayload(payload),
    why_today: why,
    north_star: payload.north_star,
  };
}
