export type FocusDirective = {
  title: string;
  rationale: string;
  ctaLabel: string;
  domains: string;
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

export type HabitStreak = {
  id: string;
  label: string;
};
