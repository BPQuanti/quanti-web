export type LocationCategory = 'home_like' | 'transit' | 'travel' | 'unknown';

export type BiometricSummary = {
  hrv_delta_percent: number | null;
  sleep_hours: number | null;
  recovery_score: number | null;
};

export type ScreenTimeRollup = {
  total_minutes: number | null;
  late_night_minutes: number | null;
  pickup_count: number | null;
};

export type AgencyArc =
  | 'recovery'
  | 'deep_work'
  | 'capital'
  | 'clarity'
  | 'momentum'
  | 'somatic';

export type VoiceContext = {
  transcript: string | null;
  duration_seconds: number | null;
  has_voice: boolean;
};

export type VoiceContextBoost = {
  transcript: string;
  recorded_at: string;
};

export type DailyTelemetryPayload = {
  schema_version: 1;
  session_id: string;
  user_id: string | null;
  local_date: string;
  agency_arc: AgencyArc;
  infer_arc?: boolean;
  north_star?: {
    now: string;
    next: string;
    outcomes: string[];
    setAt?: string;
  };
  biometrics: BiometricSummary;
  healthkit?: boolean;
  location: {
    category: LocationCategory;
    timezone_offset_minutes: number;
  };
  screen_time: ScreenTimeRollup;
  voice: VoiceContext;
  voice_context?: VoiceContextBoost;
  last_execution?: {
    date: string;
    status: 'executed' | 'partial' | 'shifted';
    primary_directive: string;
  };
  days_on_target?: number | null;
  target_stale?: boolean;
  /** Onboarding bottleneck vs daily state. Default daily. */
  synthesis_mode?: 'onboarding' | 'daily';
  /** User rejected the first card as too vague; demand a named artifact. */
  artifact_retry?: boolean;
  is_mock: boolean;
  mock_profile: 'high_stress' | 'peak_recovery' | 'balanced' | null;
};

export type DailyDirective = {
  primary_directive: string;
  recovery_actions: string[];
  focus_blocks: string[];
  voice_prompt: string;
  source: 'edge' | 'local_fallback';
  inferred_arc?: AgencyArc;
  north_star?: {
    now: string;
    next: string;
    outcomes: string[];
  };
  why_today?: string;
  aborted?: boolean;
  crisis_intercept?: boolean;
};

export type TelemetrySources = {
  health?: {
    sleepSamples?: readonly unknown[];
    hrvSamples?: readonly unknown[];
  } | null;
  baselineHrvMs?: number | null;
  location?: {
    latitude?: number | null;
    longitude?: number | null;
    city?: string | null;
    timezoneOffsetMinutes?: number | null;
  } | null;
  screenTime?: {
    totalMinutes?: number | null;
    lateNightMinutes?: number | null;
    pickupCount?: number | null;
  } | null;
  voiceTranscript?: string | null;
  voiceDurationSeconds?: number | null;
  userId?: string | null;
  synthesis_mode?: 'onboarding' | 'daily';
  artifact_retry?: boolean;
};
