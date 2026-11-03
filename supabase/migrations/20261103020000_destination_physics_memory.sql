ALTER TABLE public.user_destinations
  ADD COLUMN IF NOT EXISTS physics_memory JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.user_destinations.physics_memory IS
  'Typed destination physics only: last_stall_reason, last_artifact_noun, last_entity_moved, last_failed_scope.';
