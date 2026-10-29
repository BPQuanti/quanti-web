import type { MockTelemetryProfile } from './telemetrySettings';
import type { TelemetrySources } from '../types/telemetry';

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000);
}

function sleepSample(hours: number) {
  return { startDate: hoursAgo(hours + 0.5), endDate: hoursAgo(0.5) };
}

export const MOCK_TELEMETRY_PROFILES: Record<MockTelemetryProfile, TelemetrySources> = {
  high_stress: {
    baselineHrvMs: 48,
    health: {
      sleepSamples: [sleepSample(5.1)],
      hrvSamples: [{ quantity: 36 }, { quantity: 48 }],
    },
    location: { timezoneOffsetMinutes: new Date().getTimezoneOffset() },
    screenTime: { totalMinutes: 274, lateNightMinutes: 46, pickupCount: 78 },
    voiceTranscript: 'Wired, behind, and already bracing for a stacked calendar.',
    voiceDurationSeconds: 12,
  },
  peak_recovery: {
    baselineHrvMs: 42,
    health: {
      sleepSamples: [sleepSample(8.4)],
      hrvSamples: [{ quantity: 51 }, { quantity: 42 }],
    },
    location: { timezoneOffsetMinutes: new Date().getTimezoneOffset() },
    screenTime: { totalMinutes: 118, lateNightMinutes: 8, pickupCount: 22 },
    voiceTranscript: 'Clear, rested, and ready for one deep block of work.',
    voiceDurationSeconds: 11,
  },
  balanced: {
    baselineHrvMs: 44,
    health: {
      sleepSamples: [sleepSample(7.2)],
      hrvSamples: [{ quantity: 44 }, { quantity: 44 }],
    },
    location: { timezoneOffsetMinutes: new Date().getTimezoneOffset() },
    screenTime: { totalMinutes: 164, lateNightMinutes: 18, pickupCount: 36 },
    voiceTranscript: 'Steady morning. Protect the work block and stop on time.',
    voiceDurationSeconds: 10,
  },
};

export function getMockTelemetrySources(profile: MockTelemetryProfile): TelemetrySources {
  return MOCK_TELEMETRY_PROFILES[profile] ?? MOCK_TELEMETRY_PROFILES.balanced;
}
