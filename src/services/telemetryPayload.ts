import { fetchSleepAndHRV } from './healthkit';
import { cacheAnonymizedPayload } from './privacyConsent';
import { getSelectedArc } from './arcSettings';
import { getPriorExecution } from './directiveHistory';
import { getNorthStar, parseNorthStarFromSpeech } from './northStar';
import { getMockTelemetrySources } from './telemetryMocks';
import { getSelectedMockProfile, isUseRealHardwareEnabled } from './telemetrySettings';
import type { DailyTelemetryPayload, TelemetrySources } from '../types/telemetry';

export const DEFAULT_RECOVERY_BASELINE = {
  sleep_hours: 7,
  hrv_delta_percent: 0,
  recovery_score: 55,
} as const;

const PII_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g,
  /\b(?:user(name)?|email|name)\s*[:=]\s*\S+/gi,
];

function sessionId() {
  const cryptoObj = globalThis.crypto as { randomUUID?: () => string } | undefined;
  if (typeof cryptoObj?.randomUUID === 'function') {
    return cryptoObj.randomUUID();
  }
  return `sess_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 10)}`;
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
}

function sampleQuantity(sample: unknown) {
  if (!sample || typeof sample !== 'object') {
    return null;
  }
  const record = sample as { quantity?: unknown; value?: unknown };
  return asNumber(record.quantity) ?? asNumber(record.value);
}

function sampleWindowHours(sample: unknown) {
  if (!sample || typeof sample !== 'object') {
    return null;
  }
  const record = sample as { startDate?: unknown; endDate?: unknown };
  const start = asDate(record.startDate);
  const end = asDate(record.endDate);
  if (!start || !end) {
    return null;
  }
  const hours = (end.getTime() - start.getTime()) / 3_600_000;
  return hours > 0 && hours < 24 ? hours : null;
}

function mean(values: number[]) {
  if (!values.length) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sanitizeTranscript(input: string | null | undefined) {
  if (!input) {
    return null;
  }
  let next = input.slice(0, 600);
  for (const pattern of PII_PATTERNS) {
    next = next.replace(pattern, '[redacted]');
  }
  next = next.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[redacted]');
  return next.trim() || null;
}

function recoveryScore(sleepHours: number | null, hrvDelta: number | null) {
  let score = 62;
  if (sleepHours != null) {
    score += Math.max(-24, Math.min(18, (sleepHours - 7.2) * 10));
  }
  if (hrvDelta != null) {
    score += Math.max(-20, Math.min(16, hrvDelta * 0.35));
  }
  return Math.round(Math.max(8, Math.min(96, score)));
}

function localDateStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function mergeSources(base: TelemetrySources, overlay: TelemetrySources): TelemetrySources {
  return {
    ...base,
    ...overlay,
    health: overlay.health ?? base.health,
    location: overlay.location ?? base.location,
    screenTime: overlay.screenTime ?? base.screenTime,
    baselineHrvMs: overlay.baselineHrvMs ?? base.baselineHrvMs,
    voiceTranscript: overlay.voiceTranscript ?? base.voiceTranscript,
    voiceDurationSeconds: overlay.voiceDurationSeconds ?? base.voiceDurationSeconds,
    userId: overlay.userId ?? base.userId,
  };
}

function payloadFromSources(sources: TelemetrySources): DailyTelemetryPayload {
  const health = sources.health;
  const hrvValues = (health?.hrvSamples ?? [])
    .map(sampleQuantity)
    .filter((value): value is number => value != null);
  const latestHrv = hrvValues[0] ?? null;
  const baseline = asNumber(sources.baselineHrvMs) ?? mean(hrvValues.slice(1)) ?? latestHrv;
  const hrvDelta =
    latestHrv != null && baseline != null && baseline !== 0
      ? Number((((latestHrv - baseline) / baseline) * 100).toFixed(1))
      : null;

  const sleepHoursRaw = (health?.sleepSamples ?? [])
    .map(sampleWindowHours)
    .filter((value): value is number => value != null);
  const sleepHours = sleepHoursRaw.length
    ? Number(Math.min(14, sleepHoursRaw.reduce((sum, value) => sum + value, 0)).toFixed(2))
    : null;

  const transcript = sanitizeTranscript(sources.voiceTranscript);
  const liveHealth = liveHealthUsable(health);

  return {
    schema_version: 1,
    session_id: sessionId(),
    user_id: sources.userId ?? null,
    local_date: localDateStamp(),
    biometrics: liveHealth
      ? {
          hrv_delta_percent: hrvDelta,
          sleep_hours: sleepHours,
          recovery_score: recoveryScore(sleepHours, hrvDelta),
        }
      : { ...DEFAULT_RECOVERY_BASELINE },
    healthkit: liveHealth,
    location: {
      category: 'unknown',
      timezone_offset_minutes: new Date().getTimezoneOffset(),
    },
    screen_time: {
      total_minutes: asNumber(sources.screenTime?.totalMinutes),
      late_night_minutes: asNumber(sources.screenTime?.lateNightMinutes),
      pickup_count: asNumber(sources.screenTime?.pickupCount),
    },
    voice: {
      transcript,
      duration_seconds: asNumber(sources.voiceDurationSeconds),
      has_voice: Boolean(transcript),
    },
    agency_arc: 'deep_work',
    is_mock: true,
    mock_profile: 'balanced',
  };
}

function liveHealthUsable(health: TelemetrySources['health']) {
  const sleep = health?.sleepSamples?.length ?? 0;
  const hrv = health?.hrvSamples?.length ?? 0;
  return sleep > 0 || hrv > 0;
}

async function resolveLiveSources(explicit: TelemetrySources): Promise<TelemetrySources | null> {
  try {
    const health = explicit.health ?? (await fetchSleepAndHRV().catch(() => null));
    return {
      ...explicit,
      health: liveHealthUsable(health) ? health : undefined,
      location: undefined,
    };
  } catch {
    return {
      ...explicit,
      health: undefined,
      location: undefined,
    };
  }
}

export async function assembleAnonymizedPayload(
  optionalVoiceTranscript?: string,
  sources: TelemetrySources = {}
): Promise<DailyTelemetryPayload> {
  const profile = await getSelectedMockProfile();
  const mock = getMockTelemetrySources(profile);
  const useHardware = await isUseRealHardwareEnabled();
  const agencyArc = await getSelectedArc();
  const voiceTranscript = optionalVoiceTranscript?.trim() || sources.voiceTranscript || null;

  let resolved = mock;
  let sourceLabel: `LIVE_DEVICE_SENSORS` | `MOCK_DEMO_DATA (${typeof profile})` =
    `MOCK_DEMO_DATA (${profile})`;

  if (useHardware) {
    const live = await resolveLiveSources(sources);
    if (liveHealthUsable(live?.health)) {
      resolved = mergeSources(
        {
          userId: sources.userId,
          voiceTranscript,
          voiceDurationSeconds: sources.voiceDurationSeconds,
        },
        live ?? sources,
      );
      sourceLabel = 'LIVE_DEVICE_SENSORS';
    } else {
      resolved = {
        userId: sources.userId,
        voiceTranscript,
        voiceDurationSeconds: sources.voiceDurationSeconds,
        location: undefined,
      };
      sourceLabel = 'LIVE_DEVICE_SENSORS';
    }
  } else {
    resolved = mergeSources(mock, {
      userId: sources.userId,
      voiceTranscript,
      voiceDurationSeconds: sources.voiceDurationSeconds,
    });
  }

  resolved = {
    ...resolved,
    voiceTranscript,
    voiceDurationSeconds: sources.voiceDurationSeconds ?? resolved.voiceDurationSeconds,
  };

  const live = sourceLabel === 'LIVE_DEVICE_SENSORS';
  const cleaned = sanitizeTranscript(voiceTranscript);
  const storedStar = await getNorthStar();
  const spokenStar = cleaned ? parseNorthStarFromSpeech(cleaned) : null;
  const prior = await getPriorExecution();
  const payload: DailyTelemetryPayload = {
    ...payloadFromSources({ ...resolved, voiceTranscript: cleaned }),
    agency_arc: agencyArc ?? 'deep_work',
    infer_arc: false,
    north_star: storedStar ?? spokenStar ?? undefined,
    last_execution: prior?.status
      ? {
          date: prior.date,
          status: prior.status,
          primary_directive: prior.primary_directive.slice(0, 280),
        }
      : undefined,
    is_mock: !live,
    mock_profile: live ? null : profile,
    voice_context: cleaned
      ? { transcript: cleaned, recorded_at: new Date().toISOString() }
      : undefined,
    synthesis_mode: sources.synthesis_mode,
    artifact_retry: sources.artifact_retry,
  };

  if (live) {
    console.log('[TelemetrySource] LIVE_DEVICE_SENSORS', {
      hrv_delta_percent: payload.biometrics.hrv_delta_percent,
      sleep_hours: payload.biometrics.sleep_hours,
      recovery_score: payload.biometrics.recovery_score,
      location_category: payload.location.category,
    });
  } else {
    console.log(`[TelemetrySource] MOCK_DEMO_DATA (${profile})`);
  }

  console.log('[Telemetry] assembled payload', {
    agency_arc: payload.agency_arc,
    is_mock: payload.is_mock,
    voice: payload.voice,
    voice_context: payload.voice_context,
    biometrics: payload.biometrics,
    location: payload.location,
    screen_time: payload.screen_time,
  });

  await cacheAnonymizedPayload(JSON.stringify(payload));
  return payload;
}
