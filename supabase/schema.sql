-- ShadBoard - Supabase schema and security policies
-- Execute this script in Supabase SQL Editor.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('citizen', 'agent', 'admin', 'gestor');
  end if;
  if not exists (select 1 from pg_type where typname = 'occurrence_category') then
    create type public.occurrence_category as enum (
      'buraco',
      'iluminacao',
      'lixo',
      'entulho',
      'esgoto',
      'outros'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'occurrence_status') then
    create type public.occurrence_status as enum (
      'aberto',
      'em_analise',
      'em_execucao',
      'resolvido'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'occurrence_image_type') then
    create type public.occurrence_image_type as enum ('report', 'resolution');
  end if;
end $$;


create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'citizen',
  created_at timestamptz not null default now()
);

create table if not exists public.occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) between 15 and 2000),
  category public.occurrence_category not null,
  status public.occurrence_status not null default 'aberto',
  latitude double precision not null,
  longitude double precision not null,
  neighborhood text,
  assigned_to uuid references public.profiles(id) on delete set null,
  sla_deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.occurrence_images (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references public.occurrences(id) on delete cascade,
  image_url text not null,
  image_type public.occurrence_image_type not null default 'report',
  created_at timestamptz not null default now()
);

create table if not exists public.occurrence_logs (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references public.occurrences(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  status public.occurrence_status not null,
  comment text,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references public.occurrences(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  feedback text,
  created_at timestamptz not null default now(),
  constraint ratings_occurrence_user_unique unique (occurrence_id, user_id)
);

create index if not exists occurrences_created_at_idx on public.occurrences (created_at desc);
create index if not exists occurrences_status_idx on public.occurrences (status);
create index if not exists occurrences_category_idx on public.occurrences (category);
create index if not exists occurrences_assigned_to_idx on public.occurrences (assigned_to);
create index if not exists occurrences_user_id_idx on public.occurrences (user_id);
create index if not exists occurrence_logs_occurrence_id_idx on public.occurrence_logs (occurrence_id);
create index if not exists occurrence_images_occurrence_id_idx on public.occurrence_images (occurrence_id);
create index if not exists ratings_occurrence_id_idx on public.ratings (occurrence_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists occurrences_set_updated_at on public.occurrences;
create trigger occurrences_set_updated_at
before update on public.occurrences
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'citizen'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.can_manage_occurrence(occurrence_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case when public.current_role() = 'gestor' then true else false end;
$$;

create or replace function public.get_public_occurrences(limit_count int default 300)
returns table (
  id uuid,
  user_id uuid,
  title text,
  description text,
  category public.occurrence_category,
  status public.occurrence_status,
  latitude double precision,
  longitude double precision,
  neighborhood text,
  assigned_to uuid,
  sla_deadline timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.id,
    null::uuid as user_id,
    o.title,
    o.description,
    o.category,
    o.status,
    o.latitude,
    o.longitude,
    o.neighborhood,
    null::uuid as assigned_to,
    o.sla_deadline,
    o.created_at,
    o.updated_at
  from public.occurrences o
  order by o.created_at desc
  limit greatest(1, least(coalesce(limit_count, 300), 2000));
$$;

create or replace function public.get_public_occurrence(occurrence_uuid uuid)
returns table (
  id uuid,
  user_id uuid,
  title text,
  description text,
  category public.occurrence_category,
  status public.occurrence_status,
  latitude double precision,
  longitude double precision,
  neighborhood text,
  assigned_to uuid,
  sla_deadline timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.id,
    null::uuid as user_id,
    o.title,
    o.description,
    o.category,
    o.status,
    o.latitude,
    o.longitude,
    o.neighborhood,
    null::uuid as assigned_to,
    o.sla_deadline,
    o.created_at,
    o.updated_at
  from public.occurrences o
  where o.id = occurrence_uuid;
$$;

create or replace function public.get_public_occurrence_logs(occurrence_uuid uuid)
returns table (
  id uuid,
  occurrence_id uuid,
  actor_id uuid,
  status public.occurrence_status,
  comment text,
  is_internal boolean,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    l.id,
    l.occurrence_id,
    null::uuid as actor_id,
    l.status,
    l.comment,
    false as is_internal,
    l.created_at
  from public.occurrence_logs l
  where l.occurrence_id = occurrence_uuid
    and l.is_internal = false
  order by l.created_at asc;
$$;

create or replace function public.get_public_occurrence_images(occurrence_uuid uuid)
returns table (
  id uuid,
  occurrence_id uuid,
  image_url text,
  image_type public.occurrence_image_type,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select i.id, i.occurrence_id, i.image_url, i.image_type, i.created_at
  from public.occurrence_images i
  where i.occurrence_id = occurrence_uuid
  order by i.created_at asc;
$$;

create or replace function public.create_initial_occurrence_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.occurrence_logs (
    occurrence_id,
    actor_id,
    status,
    comment,
    is_internal
  )
  values (
    new.id,
    new.user_id,
    new.status,
    'Ocorrencia registrada no portal.',
    false
  );
  return new;
end;
$$;

drop trigger if exists occurrences_create_initial_log on public.occurrences;
create trigger occurrences_create_initial_log
after insert on public.occurrences
for each row execute function public.create_initial_occurrence_log();

grant execute on function public.current_role() to authenticated;
grant execute on function public.can_manage_occurrence(uuid) to authenticated;
grant execute on function public.get_public_occurrences(int) to anon, authenticated;
grant execute on function public.get_public_occurrence(uuid) to anon, authenticated;
grant execute on function public.get_public_occurrence_logs(uuid) to anon, authenticated;
grant execute on function public.get_public_occurrence_images(uuid) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.occurrences enable row level security;
alter table public.occurrence_images enable row level security;
alter table public.occurrence_logs enable row level security;
alter table public.ratings enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
using (
  auth.uid() = id
  or public.current_role() = 'gestor'
);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
using (auth.uid() = id or public.current_role() = 'gestor')
with check (auth.uid() = id or public.current_role() = 'gestor');

drop policy if exists occurrences_insert_any on public.occurrences;
create policy occurrences_insert_any
on public.occurrences
for insert
with check (
  (auth.uid() is null and user_id is null)
  or (auth.uid() = user_id)
  or public.current_role() = 'gestor'
);

drop policy if exists occurrences_select_owner on public.occurrences;
create policy occurrences_select_owner
on public.occurrences
for select
using (auth.uid() = user_id);

drop policy if exists occurrences_select_agent on public.occurrences;
drop policy if exists occurrences_select_admin on public.occurrences;
drop policy if exists occurrences_select_gestor on public.occurrences;
create policy occurrences_select_gestor
on public.occurrences
for select
using (public.current_role() = 'gestor');

drop policy if exists occurrences_update_manager on public.occurrences;
create policy occurrences_update_manager
on public.occurrences
for update
using (
  public.current_role() = 'gestor'
)
with check (
  public.current_role() = 'gestor'
);

drop policy if exists occurrences_delete_admin on public.occurrences;
create policy occurrences_delete_admin
on public.occurrences
for delete
using (public.current_role() = 'gestor');

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
      )
  )
);

drop policy if exists occurrence_images_insert_authenticated on public.occurrence_images;
drop policy if exists occurrence_images_insert_public on public.occurrence_images;
create policy occurrence_images_insert_public
on public.occurrence_images
for insert
with check (
  exists (
    select 1
    from public.occurrences o
    where o.id = occurrence_id
      and (
        (auth.uid() is null and o.user_id is null and image_type = 'report')
        or o.user_id = auth.uid()
        or public.can_manage_occurrence(o.id)
        or public.current_role() = 'gestor'
      )
  )
);

drop policy if exists occurrence_images_update_manager on public.occurrence_images;
create policy occurrence_images_update_manager
on public.occurrence_images
for update
using (
  public.can_manage_occurrence(occurrence_id)
  or public.current_role() = 'gestor'
)
with check (
  public.can_manage_occurrence(occurrence_id)
  or public.current_role() = 'gestor'
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
  or public.can_manage_occurrence(occurrence_id)
  or public.current_role() = 'gestor'
);

drop policy if exists occurrence_logs_insert_manager on public.occurrence_logs;
create policy occurrence_logs_insert_manager
on public.occurrence_logs
for insert
with check (
  auth.uid() is not null
  and (
    public.can_manage_occurrence(occurrence_id)
    or public.current_role() = 'gestor'
  )
);

drop policy if exists ratings_select_owner_or_manager on public.ratings;
create policy ratings_select_owner_or_manager
on public.ratings
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
      )
  )
);

drop policy if exists ratings_insert_owner on public.ratings;
create policy ratings_insert_owner
on public.ratings
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.occurrences o
    where o.id = occurrence_id
      and o.user_id = auth.uid()
      and o.status = 'resolvido'
  )
);

-- Supabase storage bucket for occurrence images
insert into storage.buckets (id, name, public)
values ('occurrence-images', 'occurrence-images', true)
on conflict (id) do nothing;

drop policy if exists storage_occurrence_images_read on storage.objects;
create policy storage_occurrence_images_read
on storage.objects
for select
using (bucket_id = 'occurrence-images');

drop policy if exists storage_occurrence_images_insert_auth on storage.objects;
create policy storage_occurrence_images_insert_auth
on storage.objects
for insert
to authenticated
with check (bucket_id = 'occurrence-images');

drop policy if exists storage_occurrence_images_insert_anon on storage.objects;
create policy storage_occurrence_images_insert_anon
on storage.objects
for insert
to anon
with check (
  bucket_id = 'occurrence-images'
  and position('/report/' in name) > 0
);

drop policy if exists storage_occurrence_images_update_auth on storage.objects;
create policy storage_occurrence_images_update_auth
on storage.objects
for update
to authenticated
using (bucket_id = 'occurrence-images')
with check (bucket_id = 'occurrence-images');

drop policy if exists storage_occurrence_images_delete_auth on storage.objects;
create policy storage_occurrence_images_delete_auth
on storage.objects
for delete
to authenticated
using (bucket_id = 'occurrence-images');

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'occurrences'
  ) then
    alter publication supabase_realtime add table public.occurrences;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'occurrence_logs'
  ) then
    alter publication supabase_realtime add table public.occurrence_logs;
  end if;
end $$;

-- Seed data: 20 sample occurrences in Caratinga/MG
insert into public.occurrences (
  id,
  title,
  description,
  category,
  status,
  latitude,
  longitude,
  neighborhood,
  sla_deadline,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000201',
    'Buraco na Rua Joao Pinheiro',
    'Buraco grande em frente ao numero 315 da Rua Joao Pinheiro, Centro, Caratinga.',
    'buraco',
    'aberto',
    -19.7908,
    -42.1392,
    'Centro',
    now() + interval '5 days',
    now() - interval '20 days',
    now() - interval '20 days'
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    'Postes apagados na Olegario Maciel',
    'Trecho sem iluminacao entre os numeros 120 e 180 da Avenida Olegario Maciel.',
    'iluminacao',
    'em_analise',
    -19.7921,
    -42.1410,
    'Centro',
    now() + interval '4 days',
    now() - interval '19 days',
    now() - interval '18 days'
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    'Lixo acumulado na Rua Raul Soares',
    'Ponto de descarte irregular de lixo na esquina com Rua Jose de Anchieta.',
    'lixo',
    'em_execucao',
    -19.7887,
    -42.1364,
    'Santa Cruz',
    now() + interval '2 days',
    now() - interval '18 days',
    now() - interval '17 days'
  ),
  (
    '00000000-0000-0000-0000-000000000204',
    'Entulho na Praca Cesario Alvim',
    'Restos de obra ocupando parte da calcada ao lado da banca de jornais.',
    'entulho',
    'aberto',
    -19.7915,
    -42.1381,
    'Centro',
    now() + interval '6 days',
    now() - interval '17 days',
    now() - interval '17 days'
  ),
  (
    '00000000-0000-0000-0000-000000000205',
    'Vazamento de esgoto no Limoeiro',
    'Esgoto correndo a ceu aberto na Rua Coronel Chiquinho, proximo ao numero 88.',
    'esgoto',
    'resolvido',
    -19.7960,
    -42.1452,
    'Limoeiro',
    now() - interval '1 day',
    now() - interval '16 days',
    now() - interval '3 days'
  ),
  (
    '00000000-0000-0000-0000-000000000206',
    'Asfalto afundando na Avenida Dario Grossi',
    'Afundamento no asfalto em frente ao ponto de onibus no bairro Santa Zita.',
    'buraco',
    'em_analise',
    -19.7849,
    -42.1428,
    'Santa Zita',
    now() + interval '3 days',
    now() - interval '15 days',
    now() - interval '14 days'
  ),
  (
    '00000000-0000-0000-0000-000000000207',
    'Falta de luz publica na Rua Niteroi',
    'Tres postes apagados em sequencia na Rua Niteroi, altura do numero 240.',
    'iluminacao',
    'aberto',
    -19.7998,
    -42.1470,
    'Esperanca',
    now() + interval '7 days',
    now() - interval '14 days',
    now() - interval '14 days'
  ),
  (
    '00000000-0000-0000-0000-000000000208',
    'Lixo em calcada da Rua Professor Olinto',
    'Sacos de lixo rasgados gerando mau cheiro e atraindo animais no local.',
    'lixo',
    'em_execucao',
    -19.7933,
    -42.1376,
    'Centro',
    now() + interval '2 days',
    now() - interval '13 days',
    now() - interval '12 days'
  ),
  (
    '00000000-0000-0000-0000-000000000209',
    'Entulho em esquina da Catarina Cimini',
    'Pilhas de entulho ocupando metade da via na Avenida Catarina Cimini.',
    'entulho',
    'aberto',
    -19.8012,
    -42.1493,
    'Santo Antonio',
    now() + interval '5 days',
    now() - interval '12 days',
    now() - interval '12 days'
  ),
  (
    '00000000-0000-0000-0000-000000000210',
    'Mau cheiro de esgoto na Jose Belegard',
    'Bueiro transbordando na Rua Jose Belegard, em frente ao numero 57.',
    'esgoto',
    'resolvido',
    -19.7874,
    -42.1441,
    'Santa Cruz',
    now() - interval '2 days',
    now() - interval '11 days',
    now() - interval '4 days'
  ),
  (
    '00000000-0000-0000-0000-000000000211',
    'Buraco profundo na Marechal Deodoro',
    'Buraco profundo na faixa da direita, dificultando passagem de motos e carros.',
    'buraco',
    'em_analise',
    -19.7902,
    -42.1404,
    'Centro',
    now() + interval '4 days',
    now() - interval '10 days',
    now() - interval '9 days'
  ),
  (
    '00000000-0000-0000-0000-000000000212',
    'Iluminacao fraca na Tancredo Neves',
    'Luminarias com baixa intensidade na Avenida Tancredo Neves apos as 19h.',
    'iluminacao',
    'aberto',
    -19.8055,
    -42.1516,
    'Anapolis',
    now() + interval '6 days',
    now() - interval '9 days',
    now() - interval '9 days'
  ),
  (
    '00000000-0000-0000-0000-000000000213',
    'Descarte irregular na Padre Raul Motta',
    'Sacolas e restos de poda acumulados no canteiro central da via.',
    'lixo',
    'em_execucao',
    -19.7986,
    -42.1463,
    'Nossa Senhora Aparecida',
    now() + interval '1 day',
    now() - interval '8 days',
    now() - interval '7 days'
  ),
  (
    '00000000-0000-0000-0000-000000000214',
    'Entulho de reforma na Rua Belo Horizonte',
    'Materiais de construcao abandonados obstruindo parte da sarjeta.',
    'entulho',
    'aberto',
    -19.7944,
    -42.1437,
    'Limoeiro',
    now() + interval '5 days',
    now() - interval '7 days',
    now() - interval '7 days'
  ),
  (
    '00000000-0000-0000-0000-000000000215',
    'Buraco em cruzamento da Joaquim Carlos',
    'Buraco no cruzamento da Rua Joaquim Carlos com Rua Sete de Setembro.',
    'buraco',
    'resolvido',
    -19.8024,
    -42.1502,
    'Santa Zita',
    now() - interval '3 days',
    now() - interval '6 days',
    now() - interval '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000216',
    'Esgoto vazando na Travessa do Rosario',
    'Vazamento constante em frente ao numero 12, formando pocas na calcada.',
    'esgoto',
    'em_analise',
    -19.7891,
    -42.1388,
    'Centro',
    now() + interval '2 days',
    now() - interval '5 days',
    now() - interval '4 days'
  ),
  (
    '00000000-0000-0000-0000-000000000217',
    'Acumulo de lixo na Rua Manoel Goncalves',
    'Coleta atrasada ha tres dias na Rua Manoel Goncalves, quadra 2.',
    'lixo',
    'aberto',
    -19.8061,
    -42.1530,
    'Esplanada',
    now() + interval '4 days',
    now() - interval '4 days',
    now() - interval '4 days'
  ),
  (
    '00000000-0000-0000-0000-000000000218',
    'Poste apagado na Moacyr de Mattos',
    'Sem iluminacao no trecho comercial da Avenida Moacyr de Mattos.',
    'iluminacao',
    'em_execucao',
    -19.8073,
    -42.1552,
    'Zacarias',
    now() + interval '1 day',
    now() - interval '3 days',
    now() - interval '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000219',
    'Buraco na Deputado Djalma Marinho',
    'Buraco junto ao meio-fio causando risco para ciclistas no bairro Santa Cruz.',
    'buraco',
    'aberto',
    -19.7972,
    -42.1450,
    'Santa Cruz',
    now() + interval '6 days',
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000220',
    'Entulho removido na Rua Pedro de Oliveira',
    'Ocorrencia finalizada apos retirada de entulho proximo ao numero 410.',
    'entulho',
    'resolvido',
    -19.8005,
    -42.1484,
    'Esperanca',
    now() - interval '1 day',
    now() - interval '1 day',
    now() - interval '12 hours'
  )
on conflict (id) do nothing;

