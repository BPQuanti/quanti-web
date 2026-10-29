import { supabase } from '../lib/supabase';
import { voicePromptForPayload } from './arcVoicePrompts';
import { saveStoredDirective } from './dailyDirectiveStore';
import { getPriorExecution, localDateStamp } from './directiveHistory';
import { closedLoopFallback, whyFromPayload } from './directiveLoop';
import { hasGivenAIConsent } from './privacyConsent';
import { edgeFunctionUrl } from './supabaseFunctions';
import { inferArcFromTranscript, asInferredArc } from './arcInference';
import { setSelectedArc } from './arcSettings';
import { asNorthStar, parseNorthStarFromSpeech } from './northStar';
import type { AgencyArc, DailyDirective, DailyTelemetryPayload } from '../types/telemetry';

const TIMEOUT_MS = 30_000;

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
  if (payload.last_execution) {
    return payload;
  }
  const prior = await getPriorExecution(payload.local_date || localDateStamp());
  if (!prior?.status) {
    return payload;
  }
  return {
    ...payload,
    last_execution: {
      date: prior.date,
      status: prior.status,
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
    agency_arc: payload.agency_arc,
    local_date: payload.local_date,
    voice_context: payload.voice_context,
    voice: payload.voice,
    biometrics: payload.biometrics,
    location: payload.location,
    screen_time: payload.screen_time,
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

    return {
      primary_directive: String(data.primary_directive),
      recovery_actions: Array.isArray(data.recovery_actions)
        ? data.recovery_actions.map(String).slice(0, 5)
        : [],
      focus_blocks: focusBlocks,
      voice_prompt:
        typeof data.voice_prompt === 'string' && data.voice_prompt.trim()
          ? data.voice_prompt.trim()
          : voicePromptForPayload(payload),
      source: 'edge' as const,
      inferred_arc: asInferredArc((data as { inferred_arc?: unknown }).inferred_arc) ?? undefined,
      north_star: asNorthStar((data as { north_star?: unknown }).north_star) ?? payload.north_star,
      why_today:
        typeof (data as { why_today?: unknown }).why_today === 'string'
          ? String((data as { why_today: string }).why_today).trim().slice(0, 220)
          : undefined,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function generateDailyDirective(payload: DailyTelemetryPayload): Promise<DailyDirective> {
  const sealedPayload = await withLastExecution(payload);
  const consented = await hasGivenAIConsent();
  const hasVoice = Boolean(sealedPayload.voice_context?.transcript || sealedPayload.voice?.transcript);
  if (!consented && !hasVoice) {
    console.warn('[Directive] local fallback: AI synthesis consent is off and no voice context was provided.');
    const fallback = withInferredArc(sealedPayload, { ...fallbackDirective(sealedPayload), aborted: true });
    await persistDirective({ ...sealedPayload, agency_arc: fallback.inferred_arc ?? sealedPayload.agency_arc }, fallback);
    return fallback;
  }
  if (!consented && hasVoice) {
    console.log('[Directive] stored AI consent is off; sending this explicit voice/note refinement to gpt-4o-mini.');
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (error || !accessToken || !data.session?.user?.id) {
      const reason = error?.message || 'No authenticated session.';
      console.error('[Directive] local fallback: auth session missing', reason);
      const fallback = withInferredArc(sealedPayload, fallbackDirective(sealedPayload));
      await persistDirective({ ...sealedPayload, agency_arc: fallback.inferred_arc ?? sealedPayload.agency_arc }, fallback);
      return fallback;
    }

    const sealed: DailyTelemetryPayload = {
      ...sealedPayload,
      user_id: data.session.user.id,
    };

    const directive = withInferredArc(sealed, await postDirective(sealed, accessToken));
    console.log('[Directive] edge synthesis complete', directive);
    await persistDirective({ ...sealed, agency_arc: directive.inferred_arc ?? sealed.agency_arc }, directive);
    return directive;
  } catch (caught) {
    const reason = caught instanceof Error ? caught.message : String(caught);
    console.error('[Directive] local fallback after edge failure:', reason);
    const fallback = withInferredArc(sealedPayload, fallbackDirective(sealedPayload));
    await persistDirective({ ...sealedPayload, agency_arc: fallback.inferred_arc ?? sealedPayload.agency_arc }, fallback);
    return fallback;
  }
}

function withInferredArc(payload: DailyTelemetryPayload, directive: DailyDirective): DailyDirective {
  const spoken = payload.voice_context?.transcript || payload.voice?.transcript || '';
  const inferred: AgencyArc | undefined = payload.infer_arc
    ? directive.inferred_arc ?? inferArcFromTranscript(spoken)
    : directive.inferred_arc;
  const northStar =
    directive.north_star ?? payload.north_star ?? (spoken ? parseNorthStarFromSpeech(spoken) : undefined);
  return {
    ...directive,
    inferred_arc: inferred,
    north_star: northStar ?? undefined,
    why_today: directive.why_today?.trim() || whyFromPayload(payload),
  };
}

async function persistDirective(payload: DailyTelemetryPayload, directive: DailyDirective) {
  try {
    if (directive.inferred_arc) {
      await setSelectedArc(directive.inferred_arc);
    }
    await saveStoredDirective({
      ...directive,
      date: payload.local_date || localDateStamp(),
      agency_arc: directive.inferred_arc ?? payload.agency_arc,
      voice_transcript: payload.voice_context?.transcript || payload.voice?.transcript || undefined,
    });
  } catch (caught) {
    console.warn('[Directive] persist failed', caught);
  }
}
