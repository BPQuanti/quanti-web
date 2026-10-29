-- Expand device_habit_logs with environmental, device state, and contextual metrics.
-- Existing row-level security already covers every column on this table.

ALTER TABLE public.device_habit_logs
ADD COLUMN IF NOT EXISTS location_stability_score NUMERIC(3,2) DEFAULT 1.00 CHECK (location_stability_score BETWEEN 0.00 AND 1.00),
ADD COLUMN IF NOT EXISTS transit_minutes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS headphone_minutes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS plugged_in_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS unplugged_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS low_battery_events INT DEFAULT 0;
