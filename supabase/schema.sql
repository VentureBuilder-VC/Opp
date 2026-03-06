-- VentureBuilder Supabase Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ══════════════════════════════════════════════════════════════════════════════
-- USERS (extends Supabase auth.users)
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text default 'analyst' check (role in ('admin','partner','analyst','viewer')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- ══════════════════════════════════════════════════════════════════════════════
-- PARTNERS (workspaces)
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.partners (
  id text primary key,
  name text not null,
  full_name text,
  sector text,
  color text,
  avatar text,
  description text,
  tags text[] default '{}',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.partners enable row level security;
create policy "Partners visible to all authenticated" on public.partners for select using (auth.role() = 'authenticated');
create policy "Partners insertable by authenticated" on public.partners for insert with check (auth.role() = 'authenticated');
create policy "Partners updatable by authenticated" on public.partners for update using (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════════════════════════════
-- PROBLEMS (RICE-scored opportunities)
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.problems (
  id text primary key,
  partner_id text references public.partners(id) on delete cascade,
  bu text,
  priority text check (priority in ('High','Medium','Low')),
  title text not null,
  impact text,
  category text,
  reach int default 50,
  impact_score int default 5,
  confidence int default 70,
  effort int default 5,
  value_low bigint default 0,
  value_mid bigint default 0,
  value_high bigint default 0,
  basis text,
  rice_note text,
  causes text[] default '{}',
  success_criteria text,
  stakeholders text[] default '{}',
  radar_scores jsonb default '{}',
  urgency_level int default 5,
  stakeholder_influence jsonb default '[]',
  urgency_signals jsonb default '[]',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.problems enable row level security;
create policy "Problems visible to authenticated" on public.problems for select using (auth.role() = 'authenticated');
create policy "Problems insertable by authenticated" on public.problems for insert with check (auth.role() = 'authenticated');
create policy "Problems updatable by authenticated" on public.problems for update using (auth.role() = 'authenticated');
create policy "Problems deletable by authenticated" on public.problems for delete using (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════════════════════════════
-- COMPANIES (research targets)
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.companies (
  id text primary key,
  name text not null,
  ticker text,
  type text,
  color text,
  is_global boolean default false,
  created_at timestamptz default now()
);

alter table public.companies enable row level security;
create policy "Companies visible to authenticated" on public.companies for select using (auth.role() = 'authenticated');
create policy "Companies insertable by authenticated" on public.companies for insert with check (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════════════════════════════
-- RESEARCH (AI-generated company intelligence)
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.research (
  id uuid default uuid_generate_v4() primary key,
  company_id text references public.companies(id) on delete cascade,
  data jsonb not null default '{}',
  status text default 'idle' check (status in ('idle','loading','done','error')),
  fetched_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(company_id)
);

alter table public.research enable row level security;
create policy "Research visible to authenticated" on public.research for select using (auth.role() = 'authenticated');
create policy "Research insertable by authenticated" on public.research for insert with check (auth.role() = 'authenticated');
create policy "Research updatable by authenticated" on public.research for update using (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════════════════════════════
-- STAKEHOLDERS
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.stakeholders (
  id text primary key,
  name text not null,
  title text,
  org text,
  sector text,
  tags text[] default '{}',
  avatar text,
  color text,
  is_global boolean default false,
  created_at timestamptz default now()
);

alter table public.stakeholders enable row level security;
create policy "Stakeholders visible to authenticated" on public.stakeholders for select using (auth.role() = 'authenticated');
create policy "Stakeholders insertable by authenticated" on public.stakeholders for insert with check (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════════════════════════════
-- STAKEHOLDER INTEL (AI-generated)
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.stakeholder_intel (
  id uuid default uuid_generate_v4() primary key,
  stakeholder_id text references public.stakeholders(id) on delete cascade,
  data jsonb not null default '{}',
  fetched_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(stakeholder_id)
);

alter table public.stakeholder_intel enable row level security;
create policy "Stakeholder intel visible to authenticated" on public.stakeholder_intel for select using (auth.role() = 'authenticated');
create policy "Stakeholder intel insertable by authenticated" on public.stakeholder_intel for insert with check (auth.role() = 'authenticated');
create policy "Stakeholder intel updatable by authenticated" on public.stakeholder_intel for update using (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════════════════════════════
-- ANALYSIS (cross-partner synthesis)
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.analysis (
  id uuid default uuid_generate_v4() primary key,
  partner_id text references public.partners(id) on delete cascade,
  data jsonb not null default '{}',
  status text default 'idle',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(partner_id)
);

alter table public.analysis enable row level security;
create policy "Analysis visible to authenticated" on public.analysis for select using (auth.role() = 'authenticated');
create policy "Analysis insertable by authenticated" on public.analysis for insert with check (auth.role() = 'authenticated');
create policy "Analysis updatable by authenticated" on public.analysis for update using (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════════════════════════════
-- CRM (deal pipeline)
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.crm (
  id text primary key,
  name text not null,
  website text,
  contact text,
  stage text default 'identified',
  last_contacted date,
  problem_id text,
  partner_id text,
  next_action text,
  notes text,
  fit_score int,
  deal_memo jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.crm enable row level security;
create policy "CRM visible to authenticated" on public.crm for select using (auth.role() = 'authenticated');
create policy "CRM insertable by authenticated" on public.crm for insert with check (auth.role() = 'authenticated');
create policy "CRM updatable by authenticated" on public.crm for update using (auth.role() = 'authenticated');
create policy "CRM deletable by authenticated" on public.crm for delete using (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════════════════════════════
-- ACTIONS (tasks)
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.actions (
  id text primary key,
  title text not null,
  status text default 'todo' check (status in ('todo','in_progress','done')),
  owner text,
  due_date date,
  problem_id text,
  partner_id text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.actions enable row level security;
create policy "Actions visible to authenticated" on public.actions for select using (auth.role() = 'authenticated');
create policy "Actions insertable by authenticated" on public.actions for insert with check (auth.role() = 'authenticated');
create policy "Actions updatable by authenticated" on public.actions for update using (auth.role() = 'authenticated');
create policy "Actions deletable by authenticated" on public.actions for delete using (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════════════════════════════
-- LIVE INTEL CACHE (news, market data, filings)
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.intel_cache (
  id uuid default uuid_generate_v4() primary key,
  source text not null,         -- 'newsapi', 'sec', 'google_news', etc.
  entity_type text not null,    -- 'company', 'sector', 'general'
  entity_id text,               -- company id or null for general
  query text,                   -- search query used
  data jsonb not null default '{}',
  fetched_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '4 hours')
);

create index if not exists idx_intel_cache_entity on public.intel_cache(entity_type, entity_id);
create index if not exists idx_intel_cache_expires on public.intel_cache(expires_at);

alter table public.intel_cache enable row level security;
create policy "Intel cache visible to authenticated" on public.intel_cache for select using (auth.role() = 'authenticated');
create policy "Intel cache insertable by authenticated" on public.intel_cache for insert with check (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════════════════════════════
-- AUDIT LOG
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.audit_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_audit_log_user on public.audit_log(user_id);
create index if not exists idx_audit_log_entity on public.audit_log(entity_type, entity_id);

alter table public.audit_log enable row level security;
create policy "Audit log visible to authenticated" on public.audit_log for select using (auth.role() = 'authenticated');
create policy "Audit log insertable by authenticated" on public.audit_log for insert with check (auth.role() = 'authenticated');

-- ══════════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ══════════════════════════════════════════════════════════════════════════════

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to all tables with updated_at
do $$
declare
  t text;
begin
  for t in select unnest(array['partners','problems','research','stakeholder_intel','analysis','crm','actions','profiles'])
  loop
    execute format('
      drop trigger if exists set_updated_at on public.%I;
      create trigger set_updated_at before update on public.%I
      for each row execute function public.handle_updated_at();
    ', t, t);
  end loop;
end;
$$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
