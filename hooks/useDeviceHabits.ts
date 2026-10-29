import { useCallback, useEffect, useMemo, useState } from 'react';
import { getReviewDeviceHabits, isReviewDemoActive, subscribeReviewDemo } from '../lib/config/demoMode';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type DeviceHabitLog = {
  log_date: string;
  total_screen_minutes: number | null;
  social_minutes: number | null;
  shopping_minutes: number | null;
  entertainment_minutes: number | null;
  late_night_screen_minutes: number | null;
  phone_pickups: number | null;
  notifications_received: number | null;
  daylight_minutes: number | null;
  avg_noise_exposure_db: number | null;
  focus_mode_minutes: number | null;
  location_stability_score: number | null;
  transit_minutes: number | null;
  headphone_minutes: number | null;
  plugged_in_timestamp: string | null;
  unplugged_timestamp: string | null;
  low_battery_events: number | null;
};

export type DeviceHabitUpsert = {
  log_date?: string;
  total_screen_minutes?: number | null;
  social_minutes?: number | null;
  shopping_minutes?: number | null;
  entertainment_minutes?: number | null;
  late_night_screen_minutes?: number | null;
  phone_pickups?: number | null;
  notifications_received?: number | null;
  daylight_minutes?: number | null;
  avg_noise_exposure_db?: number | null;
  focus_mode_minutes?: number | null;
  location_stability_score?: number | null;
  transit_minutes?: number | null;
  headphone_minutes?: number | null;
  plugged_in_timestamp?: string | null;
  unplugged_timestamp?: string | null;
  low_battery_events?: number | null;
};

const UPSERT_FIELDS = [
  'total_screen_minutes',
  'social_minutes',
  'shopping_minutes',
  'entertainment_minutes',
  'late_night_screen_minutes',
  'phone_pickups',
  'notifications_received',
  'daylight_minutes',
  'avg_noise_exposure_db',
  'focus_mode_minutes',
  'location_stability_score',
  'transit_minutes',
  'headphone_minutes',
  'plugged_in_timestamp',
  'unplugged_timestamp',
  'low_battery_events',
] as const;

function dateKey(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function num(value: number | string | null | undefined) {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function text(value: string | null | undefined) {
  return typeof value === 'string' && value.length ? value : null;
}

function stamp(offset: number, hour: number, minute: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

type ReviewDeviceDay = {
  offset: number;
  total_screen_minutes: number;
  social_minutes: number;
  shopping_minutes: number;
  entertainment_minutes: number;
  late_night_screen_minutes: number;
  phone_pickups: number;
  notifications_received: number;
  daylight_minutes: number;
  avg_noise_exposure_db: number;
  focus_mode_minutes: number;
  location_stability_score: number;
  transit_minutes: number;
  headphone_minutes: number;
  low_battery_events: number;
  pluggedHour?: number;
  pluggedMinute?: number;
  unpluggedHour?: number;
  unpluggedMinute?: number;
};

function reviewWeek(): DeviceHabitLog[] {
  return (getReviewDeviceHabits() as ReviewDeviceDay[]).map((day) => {
    const row = emptyDay(dateKey(day.offset));
    row.total_screen_minutes = day.total_screen_minutes;
    row.social_minutes = day.social_minutes;
    row.shopping_minutes = day.shopping_minutes;
    row.entertainment_minutes = day.entertainment_minutes;
    row.late_night_screen_minutes = day.late_night_screen_minutes;
    row.phone_pickups = day.phone_pickups;
    row.notifications_received = day.notifications_received;
    row.daylight_minutes = day.daylight_minutes;
    row.avg_noise_exposure_db = day.avg_noise_exposure_db;
    row.focus_mode_minutes = day.focus_mode_minutes;
    row.location_stability_score = day.location_stability_score;
    row.transit_minutes = day.transit_minutes;
    row.headphone_minutes = day.headphone_minutes;
    row.low_battery_events = day.low_battery_events;
    if (day.pluggedHour != null && day.pluggedMinute != null) {
      row.plugged_in_timestamp = stamp(day.offset, day.pluggedHour, day.pluggedMinute);
    }
    if (day.unpluggedHour != null && day.unpluggedMinute != null) {
      row.unplugged_timestamp = stamp(day.offset, day.unpluggedHour, day.unpluggedMinute);
    }
    return row;
  });
}

function emptyDay(logDate: string): DeviceHabitLog {
  return {
    log_date: logDate,
    total_screen_minutes: null,
    social_minutes: null,
    shopping_minutes: null,
    entertainment_minutes: null,
    late_night_screen_minutes: null,
    phone_pickups: null,
    notifications_received: null,
    daylight_minutes: null,
    avg_noise_exposure_db: null,
    focus_mode_minutes: null,
    location_stability_score: null,
    transit_minutes: null,
    headphone_minutes: null,
    plugged_in_timestamp: null,
    unplugged_timestamp: null,
    low_battery_events: null,
  };
}

function mapRow(row: {
  log_date: string;
  total_screen_minutes?: number | null;
  social_minutes?: number | null;
  shopping_minutes?: number | null;
  entertainment_minutes?: number | null;
  late_night_screen_minutes?: number | null;
  phone_pickups?: number | null;
  notifications_received?: number | null;
  daylight_minutes?: number | null;
  avg_noise_exposure_db?: number | null;
  focus_mode_minutes?: number | null;
  location_stability_score?: number | null;
  transit_minutes?: number | null;
  headphone_minutes?: number | null;
  plugged_in_timestamp?: string | null;
  unplugged_timestamp?: string | null;
  low_battery_events?: number | null;
}): DeviceHabitLog {
  return {
    log_date: String(row.log_date),
    total_screen_minutes: num(row.total_screen_minutes),
    social_minutes: num(row.social_minutes),
    shopping_minutes: num(row.shopping_minutes),
    entertainment_minutes: num(row.entertainment_minutes),
    late_night_screen_minutes: num(row.late_night_screen_minutes),
    phone_pickups: num(row.phone_pickups),
    notifications_received: num(row.notifications_received),
    daylight_minutes: num(row.daylight_minutes),
    avg_noise_exposure_db: num(row.avg_noise_exposure_db),
    focus_mode_minutes: num(row.focus_mode_minutes),
    location_stability_score: num(row.location_stability_score),
    transit_minutes: num(row.transit_minutes),
    headphone_minutes: num(row.headphone_minutes),
    plugged_in_timestamp: text(row.plugged_in_timestamp),
    unplugged_timestamp: text(row.unplugged_timestamp),
    low_battery_events: num(row.low_battery_events),
  };
}

export function useDeviceHabits() {
  const [rows, setRows] = useState<DeviceHabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoOn, setDemoOn] = useState(isReviewDemoActive());

  useEffect(() => subscribeReviewDemo(() => setDemoOn(isReviewDemoActive())), []);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = dateKey(-6);
    try {
      if (isReviewDemoActive()) {
        setRows([]);
        return;
      }
      if (!isSupabaseConfigured) {
        setRows([]);
        setError('Supabase is not configured.');
        return;
      }
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user?.id) {
        setRows([]);
        return;
      }
      const { data, error: queryError } = await supabase
        .from('device_habit_logs')
        .select(
          'log_date, total_screen_minutes, social_minutes, shopping_minutes, entertainment_minutes, late_night_screen_minutes, phone_pickups, notifications_received, daylight_minutes, avg_noise_exposure_db, focus_mode_minutes, location_stability_score, transit_minutes, headphone_minutes, plugged_in_timestamp, unplugged_timestamp, low_battery_events',
        )
        .eq('user_id', authData.user.id)
        .gte('log_date', start)
        .order('log_date', { ascending: true });
      if (queryError) throw queryError;
      setRows((data ?? []).map((row) => mapRow(row)));
    } catch (err) {
      setRows([]);
      const message = err instanceof Error ? err.message : 'Could not load device habits.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const week = useMemo(() => {
    if (demoOn) return reviewWeek();
    const byDate = new Map(rows.map((row) => [row.log_date, row]));
    return Array.from({ length: 7 }, (_, index) => {
      const key = dateKey(index - 6);
      return byDate.get(key) ?? emptyDay(key);
    });
  }, [demoOn, rows]);

  const upsertLog = useCallback(async (input: DeviceHabitUpsert) => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user?.id) {
      throw new Error('Sign in to save device habits.');
    }
    const payload: Record<string, string | number | null> = {
      user_id: authData.user.id,
      log_date: input.log_date || dateKey(0),
    };
    for (const field of UPSERT_FIELDS) {
      const value = input[field];
      if (value === undefined) continue;
      if (field === 'location_stability_score' && value != null) {
        payload[field] = Math.min(1, Math.max(0, Number(value)));
        continue;
      }
      payload[field] = value;
    }
    const { error: upsertError } = await supabase
      .from('device_habit_logs')
      .upsert(payload, { onConflict: 'user_id,log_date' });
    if (upsertError) throw upsertError;
    await refetch();
  }, [refetch]);

  const today = demoOn ? week.find((row) => row.log_date === dateKey(0)) ?? null : rows.find((row) => row.log_date === dateKey(0)) ?? null;
  const yesterday = demoOn ? week.find((row) => row.log_date === dateKey(-1)) ?? null : rows.find((row) => row.log_date === dateKey(-1)) ?? null;

  return { week, today, yesterday, loading, error, refetch, upsertLog };
}
