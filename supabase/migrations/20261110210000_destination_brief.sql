-- Destination Brief: terminal condition, operational bounds, current obstacle.
-- Lives on user_destinations (the Active Destination row). Product name: focus destination.

ALTER TABLE public.user_destinations
  ADD COLUMN IF NOT EXISTS done_when TEXT,
  ADD COLUMN IF NOT EXISTS constraints TEXT,
  ADD COLUMN IF NOT EXISTS current_bottleneck TEXT;

COMMENT ON COLUMN public.user_destinations.done_when IS
  'Terminal condition of the destination arc. Passive context for synthesis.';
COMMENT ON COLUMN public.user_destinations.constraints IS
  'Operational bounds or rules. Negative filter for the daily leftover.';
COMMENT ON COLUMN public.user_destinations.current_bottleneck IS
  'Primary obstacle currently faced. Nouns must bind to this, not generic sections.';
