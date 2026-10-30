import type { DailyDirective, DailyTelemetryPayload } from '../types/telemetry';
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

  let primary = voice
    ? `Write the next named artifact toward ${toward}, working around what you just named.`
    : `Name and finish one visible artifact toward ${toward} today.`;
  let why = voice
    ? `Today’s 1% is toward ${toward}, around the stall you named.`
    : `Today’s 1% is toward ${toward}.`;
  let blocks = [`One visible increment toward ${toward}.`];
  if (retry) {
    primary = `Produce one concrete artifact toward ${toward}: a list, draft, invite, or message.`;
    why = `The last card was too vague. Today’s 1% has to leave an object behind.`;
  }

  if (prior?.status === 'shifted') {
    primary = `Restart smaller toward ${toward}: one 20-minute step, then stop.`;
    why = `Yesterday you shifted “${clip(prior.primary_directive)}”. Today’s 1% is smaller so you can complete it.`;
    blocks = [`20 minutes on the smallest next step toward ${toward}.`];
  } else if (prior?.status === 'partial') {
    primary = `Finish yesterday’s unfinished 1% toward ${toward}, then stop.`;
    why = `Yesterday was partial on “${clip(prior.primary_directive)}”. Today closes that loop instead of stacking a new one.`;
    blocks = [`Complete the leftover piece, then one small increment toward ${toward}.`];
  } else if (prior?.status === 'executed') {
    primary = `Take the next 1% toward ${toward}: one concrete increment past yesterday’s win.`;
    why = `Yesterday you executed. Today goes one step further toward ${toward}.`;
    blocks = [`One increment beyond yesterday, still toward ${toward}.`];
  }

  if (low && !retry) {
    primary = `Do one 25-minute move toward ${toward}: the smallest visible step, then protect tonight.`;
    why = prior?.status
      ? `${why} Energy is bounded today, so the window is shorter.`
      : `Sleep or late-night load is high. The move still serves ${toward}, with a shorter window.`;
    blocks = [`25 minutes toward ${toward}, then a hard stop.`];
  } else if (low && retry) {
    why = `${why} Keep the window short.`;
  }

  if (payload.target_stale) {
    primary = `Name the missing artifact that would make “${clip(toward, 40)}” checkable today, then finish only that.`;
    why = `This Active Target has been open a long time. Shrink to one object. Do not invent a new destination.`;
    blocks = [`One embarrassingly small artifact toward ${toward}.`];
  }

  if (voice) {
    blocks = [`Spoken weather heard. Keep the action concrete toward ${toward}.`, ...blocks].slice(0, 2);
  }

  return {
    primary_directive: primary,
    recovery_actions: low
      ? ['Keep tonight’s feeds short so tomorrow’s first window stays intact.']
      : ['Keep one recovery buffer so the day does not become all output.'],
    focus_blocks: blocks.slice(0, 2),
    source: 'local_fallback',
    voice_prompt: voicePromptForPayload(payload),
    why_today: why,
    north_star: payload.north_star,
  };
}
