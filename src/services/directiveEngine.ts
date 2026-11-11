import { supabase } from '../lib/supabase';
import { voicePromptForPayload } from './arcVoicePrompts';
import { asCapacityWindow, asDirectiveTriplets, selectCapacityWindow } from './capacityWindow';
import { saveStoredDirective } from './dailyDirectiveStore';
import { getGuidedQuestion, writeTomorrowQuestion } from './guidedQuestion';
import { addCalendarDays, getPriorExecution, localDateStamp } from './directiveHistory';
import { closedLoopFallback, energyIsLow, whyFromPayload } from './directiveLoop';
import { sizingTriplets } from './nextIncrement';
import { hasGivenAIConsent } from './privacyConsent';
import { edgeFunctionUrl } from './supabaseFunctions';
import { asNorthStar, parseNorthStarFromSpeech } from './northStar';
import type { DailyDirective, DailyTelemetryPayload } from '../types/telemetry';

const TIMEOUT_MS = 45_000;

export class ConsentRequiredError extends Error {
  constructor() {
    super('AI synthesis consent is required before sending telemetry.');
    this.name = 'ConsentRequiredError';
  }
}

function fallbackDirective(payload: DailyTelemetryPayload): DailyDirective {
  return closedLoopFallback(payload);
}

async function withLastExecution(payload: DailyTelemetryPayload): Promise<DailyTelemetryPayload> {
  if (payload.synthesis_mode === 'onboarding') {
    return { ...payload, last_execution: undefined };
  }
  if (payload.last_execution) {
    return payload;
  }
  const prior = await getPriorExecution(payload.local_date || localDateStamp(), payload.destination_id);
  if (prior?.status !== 'executed' && prior?.status !== 'partial' && prior?.status !== 'shifted') {
    return payload;
  }
  return {
    ...payload,
    last_execution: {
      date: prior.date,
      status: prior.status,
      miss_reason: prior.miss_reason,
      primary_directive: prior.primary_directive.slice(0, 280),
    },
  };
}

async function postDirective(payload: DailyTelemetryPayload, accessToken: string) {
  const target = edgeFunctionUrl('synthesize-directive');
  if (!target) {
    throw new Error('Supabase is not configured.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  console.log('[Directive] POST synthesize-directive', {
    local_date: payload.local_date,
    destination: payload.north_star,
    voice_context: payload.voice_context,
    voice: payload.voice,
    biometrics: payload.biometrics,
    yesterday_outcome: payload.last_execution?.status,
  });

  try {
    const response = await fetch(target.url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: target.anon,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload }),
    });

    const data = (await response.json().catch(() => ({}))) as Partial<DailyDirective> & { error?: string };
    if (!response.ok) {
      throw new Error(data.error || `Directive function failed (${response.status}).`);
    }
    if (data.error || !data.primary_directive) {
      throw new Error(data.error || 'Directive payload was incomplete.');
    }

    const focusBlocks = Array.isArray(data.focus_blocks)
      ? data.focus_blocks.map(String).slice(0, 5)
      : typeof (data as { focus_block?: unknown }).focus_block === 'string'
        ? [String((data as { focus_block: string }).focus_block)]
        : [];

    const triplets = asDirectiveTriplets((data as { triplets?: unknown }).triplets);
    return {
      primary_directive: String(data.primary_directive),
      recovery_actions: Array.isArray(data.recovery_actions)
        ? data.recovery_actions.map(String).slice(0, 5)
        : [],
      focus_blocks: focusBlocks,
      triplets: triplets ?? undefined,
      selected_window: asCapacityWindow((data as { selected_window?: unknown }).selected_window) ?? undefined,
      voice_prompt:
        typeof data.voice_prompt === 'string' && data.voice_prompt.trim()
          ? data.voice_prompt.trim()
          : voicePromptForPayload(payload),
      source: 'edge' as const,
      north_star: asNorthStar((data as { north_star?: unknown }).north_star) ?? payload.north_star,
      why_today:
        typeof (data as { why_today?: unknown }).why_today === 'string'
          ? String((data as { why_today: string }).why_today).trim().slice(0, 220)
          : undefined,
      aborted: data.aborted === true || (data as { crisis_intercept?: unknown }).crisis_intercept === true,
      crisis_intercept: (data as { crisis_intercept?: unknown }).crisis_intercept === true,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function generateDailyDirective(payload: DailyTelemetryPayload): Promise<DailyDirective> {
  const sealedPayload = await withLastExecution(payload);
  const consented = await hasGivenAIConsent();
  if (!consented) {
    console.warn('[Directive] AI synthesis explicitly off; using local rule.');
    const fallback = withDestination(sealedPayload, fallbackDirective(sealedPayload));
    await persistDirective(sealedPayload, fallback);
    return fallback;
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (error || !accessToken || !data.session?.user?.id) {
      const reason = error?.message || 'No authenticated session.';
      console.error('[Directive] local fallback: auth session missing', reason);
      const fallback = withDestination(sealedPayload, fallbackDirective(sealedPayload));
      await persistDirective(sealedPayload, fallback);
      return fallback;
    }

    const sealed: DailyTelemetryPayload = {
      ...sealedPayload,
      user_id: data.session.user.id,
    };

    const directive = withDestination(sealed, await postDirective(sealed, accessToken));
    console.log('[Directive] edge synthesis complete', directive);
    await persistDirective(sealed, directive);
    return directive;
  } catch (caught) {
    const reason = caught instanceof Error ? caught.message : String(caught);
    console.error('[Directive] local fallback after edge failure:', reason);
    const fallback = withDestination(sealedPayload, fallbackDirective(sealedPayload));
    await persistDirective(sealedPayload, fallback);
    return fallback;
  }
}

function withDestination(payload: DailyTelemetryPayload, directive: DailyDirective): DailyDirective {
  const spoken = payload.voice_context?.transcript || payload.voice?.transcript || '';
  const northStar =
    directive.north_star ?? payload.north_star ?? (spoken ? parseNorthStarFromSpeech(spoken) : undefined);
  const window = selectCapacityWindow({
    healthkit: payload.healthkit === true,
    energyLow: energyIsLow(payload),
    voiceWindow: null,
    confidence: 'low',
  });
  const triplets =
    directive.triplets ??
    sizingTriplets({
      destination: payload.north_star?.next || payload.north_star?.now || '',
      yesterdayOutcome: payload.last_execution?.status ?? null,
      lastDirective: payload.last_execution?.primary_directive ?? null,
      lastArtifact: payload.physics_memory?.last_artifact_noun ?? null,
    });
  const card = triplets[window];
  return {
    ...directive,
    triplets,
    selected_window: window,
    primary_directive: directive.crisis_intercept ? directive.primary_directive : card.card_text,
    north_star: northStar ?? undefined,
    destination_id: payload.destination_id || directive.destination_id,
    why_today: directive.crisis_intercept
      ? directive.why_today?.trim()
      : directive.why_today?.trim() || whyFromPayload(payload),
  };
}

async function persistDirective(payload: DailyTelemetryPayload, directive: DailyDirective) {
  try {
    await saveStoredDirective({
      ...directive,
      date: payload.local_date || localDateStamp(),
      agency_arc: payload.agency_arc,
      destination_id: payload.destination_id || directive.destination_id,
      voice_transcript: directive.crisis_intercept
        ? undefined
        : payload.voice_context?.transcript || payload.voice?.transcript || undefined,
    });
    if (payload.synthesis_mode !== 'onboarding' && !directive.crisis_intercept && directive.voice_prompt?.trim()) {
      const tomorrow = addCalendarDays(payload.local_date || localDateStamp(), 1);
      const existing = await getGuidedQuestion(tomorrow);
      if (existing?.source !== 'mark') {
        await writeTomorrowQuestion({
          fromDate: payload.local_date,
          destinationNext: payload.north_star?.next || payload.north_star?.now,
          stallPattern: payload.stall_pattern,
          yesterdayStatus: payload.last_execution?.status ?? null,
          source: 'synth',
          question: directive.voice_prompt,
          destinationId: payload.destination_id,
        });
      }
    }
  } catch (caught) {
    console.warn('[Directive] persist failed', caught);
  }
}
