create table if not exists public.growth_posts (
  id uuid primary key default gen_random_uuid(),
  persona text not null,
  platform text not null,
  post_content text not null,
  call_to_action text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  constraint growth_posts_status_check
    check (status in ('draft', 'scheduled', 'published'))
);

create index if not exists growth_posts_created_at_idx
  on public.growth_posts (created_at desc);

create index if not exists growth_posts_status_idx
  on public.growth_posts (status);

alter table public.growth_posts enable row level security;

notify pgrst, 'reload schema';
