-- Migration: cadastro operacional (instituicoes, equipes, agentes) e vinculo com ocorrencias
-- Execute este arquivo no SQL Editor do Supabase.

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 3 and 160),
  acronym text check (acronym is null or char_length(trim(acronym)) between 2 and 20),
  contact_email text,
  contact_phone text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 3 and 120),
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.operational_agents (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(trim(full_name)) between 3 and 160),
  email text,
  phone text,
  institution_id uuid references public.institutions(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.occurrence_assignments (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references public.occurrences(id) on delete cascade unique,
  institution_id uuid references public.institutions(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  agent_id uuid references public.operational_agents(id) on delete set null,
  assigned_by uuid references public.profiles(id) on delete set null,
  notes text,
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint occurrence_assignments_any_target_check
    check (
      institution_id is not null
      or team_id is not null
      or agent_id is not null
    )
);

create index if not exists institutions_name_idx on public.institutions (name);
create index if not exists teams_institution_id_idx on public.teams (institution_id);
create index if not exists operational_agents_institution_id_idx on public.operational_agents (institution_id);
create index if not exists operational_agents_team_id_idx on public.operational_agents (team_id);
create index if not exists occurrence_assignments_occurrence_id_idx on public.occurrence_assignments (occurrence_id);
create index if not exists occurrence_assignments_institution_id_idx on public.occurrence_assignments (institution_id);
create index if not exists occurrence_assignments_team_id_idx on public.occurrence_assignments (team_id);
create index if not exists occurrence_assignments_agent_id_idx on public.occurrence_assignments (agent_id);

drop trigger if exists occurrence_assignments_set_updated_at on public.occurrence_assignments;
create trigger occurrence_assignments_set_updated_at
before update on public.occurrence_assignments
for each row execute function public.set_updated_at();

alter table public.institutions enable row level security;
alter table public.teams enable row level security;
alter table public.operational_agents enable row level security;
alter table public.occurrence_assignments enable row level security;

drop policy if exists institutions_select_gestor on public.institutions;
create policy institutions_select_gestor
on public.institutions
for select
using (public.current_role() = 'gestor');

drop policy if exists institutions_insert_gestor on public.institutions;
create policy institutions_insert_gestor
on public.institutions
for insert
with check (public.current_role() = 'gestor');

drop policy if exists institutions_update_gestor on public.institutions;
create policy institutions_update_gestor
on public.institutions
for update
using (public.current_role() = 'gestor')
with check (public.current_role() = 'gestor');

drop policy if exists institutions_delete_gestor on public.institutions;
create policy institutions_delete_gestor
on public.institutions
for delete
using (public.current_role() = 'gestor');

drop policy if exists teams_select_gestor on public.teams;
create policy teams_select_gestor
on public.teams
for select
using (public.current_role() = 'gestor');

drop policy if exists teams_insert_gestor on public.teams;
create policy teams_insert_gestor
on public.teams
for insert
with check (public.current_role() = 'gestor');

drop policy if exists teams_update_gestor on public.teams;
create policy teams_update_gestor
on public.teams
for update
using (public.current_role() = 'gestor')
with check (public.current_role() = 'gestor');

drop policy if exists teams_delete_gestor on public.teams;
create policy teams_delete_gestor
on public.teams
for delete
using (public.current_role() = 'gestor');

drop policy if exists operational_agents_select_gestor on public.operational_agents;
create policy operational_agents_select_gestor
on public.operational_agents
for select
using (public.current_role() = 'gestor');

drop policy if exists operational_agents_insert_gestor on public.operational_agents;
create policy operational_agents_insert_gestor
on public.operational_agents
for insert
with check (public.current_role() = 'gestor');

drop policy if exists operational_agents_update_gestor on public.operational_agents;
create policy operational_agents_update_gestor
on public.operational_agents
for update
using (public.current_role() = 'gestor')
with check (public.current_role() = 'gestor');

drop policy if exists operational_agents_delete_gestor on public.operational_agents;
create policy operational_agents_delete_gestor
on public.operational_agents
for delete
using (public.current_role() = 'gestor');

drop policy if exists occurrence_assignments_select_visibility on public.occurrence_assignments;
create policy occurrence_assignments_select_visibility
on public.occurrence_assignments
for select
using (
  public.current_role() = 'gestor'
  or exists (
    select 1
    from public.occurrences o
    where o.id = occurrence_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists occurrence_assignments_insert_gestor on public.occurrence_assignments;
create policy occurrence_assignments_insert_gestor
on public.occurrence_assignments
for insert
with check (public.current_role() = 'gestor');

drop policy if exists occurrence_assignments_update_gestor on public.occurrence_assignments;
create policy occurrence_assignments_update_gestor
on public.occurrence_assignments
for update
using (public.current_role() = 'gestor')
with check (public.current_role() = 'gestor');

drop policy if exists occurrence_assignments_delete_gestor on public.occurrence_assignments;
create policy occurrence_assignments_delete_gestor
on public.occurrence_assignments
for delete
using (public.current_role() = 'gestor');
