create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  email text not null default '',
  measurements jsonb not null default '{}'::jsonb,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null default '',
  full_name text not null default '',
  phone text not null default '',
  service text not null,
  service_category text not null default 'Bespoke Tailoring',
  date date not null,
  time text not null,
  requirements text not null default '',
  status text not null default 'Confirmed' check (status in ('Confirmed', 'Cancelled')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can view their own appointments" on public.appointments;
create policy "Users can view their own appointments"
  on public.appointments for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own appointments" on public.appointments;
create policy "Users can create their own appointments"
  on public.appointments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own appointments" on public.appointments;
create policy "Users can update their own appointments"
  on public.appointments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists appointments_user_id_idx on public.appointments (user_id);
create index if not exists appointments_date_idx on public.appointments (date);
