export type FocusStatus = 'active' | 'verified' | 'missed';

export type FocusDirective = {
  title: string;
  rationale: string;
  ctaLabel: string;
  domains: string;
  source: string;
  status: FocusStatus;
  statusLabel: string;
  statusDetail: string;
};

export type WealthSnapshot = {
  connected: boolean;
  bankName: string | null;
  balance: number | null;
  spent: number | null;
};

export type HealthSnapshot = {
  steps: number | null;
  sleepHours: number | null;
  calories: number | null;
  status: string | null;
};

export type DeviceHabitSnapshot = {
  screenMinutes: number | null;
  lateNightMinutes: number | null;
  pickups: number | null;
  daylightMinutes: number | null;
};

export type HabitStreak = {
  id: string;
  label: string;
};
