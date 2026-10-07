create table if not exists public.waitlist_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  referral_code text not null unique,
  initial_position integer not null,
  referral_count integer not null default 0,
  referred_by_code text,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_users_referral_code_idx
  on public.waitlist_users (referral_code);

alter table public.waitlist_users enable row level security;
