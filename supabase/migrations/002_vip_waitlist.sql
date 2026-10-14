create table if not exists public.vip_waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  email text,
  source text not null default 'website',
  created_at timestamptz not null default now()
);

alter table public.vip_waitlist enable row level security;
