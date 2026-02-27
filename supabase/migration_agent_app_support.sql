-- Migration: suporte ao app operacional de agentes
-- Objetivo:
-- 1) Vincular agente operacional com auth.users/profiles
-- 2) Suportar first-access (troca de senha obrigatória)
-- 3) Adicionar políticas RLS para perfil agent

alter table public.operational_agents
  add column if not exists auth_user_id uuid unique references public.profiles(id) on delete set null,
  add column if not exists must_change_password boolean not null default true,
  add column if not exists last_login_at timestamptz,
  add column if not exists last_notification_read_at timestamptz;

create index if not exists operational_agents_auth_user_id_idx
  on public.operational_agents (auth_user_id);

create or replace function public.current_operational_agent_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.operational_agents
  where auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_occurrence_assigned_to_current_agent(occurrence_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.occurrence_assignments oa
    where oa.occurrence_id = occurrence_uuid
      and oa.agent_id = public.current_operational_agent_id()
  );
$$;

grant execute on function public.current_operational_agent_id() to authenticated;
grant execute on function public.is_occurrence_assigned_to_current_agent(uuid) to authenticated;

drop policy if exists occurrences_select_agent_assigned on public.occurrences;
create policy occurrences_select_agent_assigned
on public.occurrences
for select
using (
  public.current_role() = 'agent'
  and public.is_occurrence_assigned_to_current_agent(id)
);

drop policy if exists occurrences_update_agent_assigned on public.occurrences;
create policy occurrences_update_agent_assigned
on public.occurrences
for update
using (
  public.current_role() = 'agent'
  and public.is_occurrence_assigned_to_current_agent(id)
)
with check (
  public.current_role() = 'agent'
  and status in ('em_execucao', 'resolvido')
  and public.is_occurrence_assigned_to_current_agent(id)
);

drop policy if exists occurrence_assignments_select_agent_own on public.occurrence_assignments;
create policy occurrence_assignments_select_agent_own
on public.occurrence_assignments
for select
using (
  public.current_role() = 'agent'
  and agent_id = public.current_operational_agent_id()
);

drop policy if exists occurrence_logs_select_visibility on public.occurrence_logs;
create policy occurrence_logs_select_visibility
on public.occurrence_logs
for select
using (
  (
    is_internal = false
    and exists (
      select 1
      from public.occurrences o
      where o.id = occurrence_id
        and o.user_id = auth.uid()
    )
  )
  or (
    public.current_role() = 'agent'
    and public.is_occurrence_assigned_to_current_agent(occurrence_id)
  )
  or public.can_manage_occurrence(occurrence_id)
  or public.current_role() = 'gestor'
);

drop policy if exists occurrence_logs_insert_agent_assigned on public.occurrence_logs;
create policy occurrence_logs_insert_agent_assigned
on public.occurrence_logs
for insert
with check (
  auth.uid() is not null
  and public.current_role() = 'agent'
  and public.is_occurrence_assigned_to_current_agent(occurrence_id)
);

drop policy if exists occurrence_images_select_viewers on public.occurrence_images;
create policy occurrence_images_select_viewers
on public.occurrence_images
for select
using (
  exists (
    select 1
    from public.occurrences o
    where o.id = occurrence_id
      and (
        o.user_id = auth.uid()
        or public.can_manage_occurrence(o.id)
        or public.current_role() = 'gestor'
        or (
          public.current_role() = 'agent'
          and public.is_occurrence_assigned_to_current_agent(o.id)
        )
      )
  )
);

drop policy if exists occurrence_images_insert_agent_resolution_assigned on public.occurrence_images;
create policy occurrence_images_insert_agent_resolution_assigned
on public.occurrence_images
for insert
with check (
  auth.uid() is not null
  and public.current_role() = 'agent'
  and image_type = 'resolution'
  and public.is_occurrence_assigned_to_current_agent(occurrence_id)
);

drop policy if exists operational_agents_select_self on public.operational_agents;
create policy operational_agents_select_self
on public.operational_agents
for select
using (
  auth.uid() = auth_user_id
);

drop policy if exists operational_agents_update_self on public.operational_agents;
create policy operational_agents_update_self
on public.operational_agents
for update
using (
  auth.uid() = auth_user_id
)
with check (
  auth.uid() = auth_user_id
);
