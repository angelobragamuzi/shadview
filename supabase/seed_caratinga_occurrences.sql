-- Seed data for Caratinga/MG occurrences.
-- Run this in Supabase SQL Editor after schema.sql.
-- This script is idempotent for records tagged with [SEED-CARATINGA].

begin;

delete from public.occurrences
where title like '[SEED-CARATINGA]%';

with seed_data as (
  select *
  from (
    values
      (
        '[SEED-CARATINGA] Buraco em cruzamento da Rua João Pinheiro',
        'Trecho com asfalto cedendo no cruzamento da Rua João Pinheiro, com risco para motos e ciclistas.',
        'buraco'::public.occurrence_category,
        'aberto'::public.occurrence_status,
        -19.789500::double precision,
        -42.142200::double precision,
        'Centro',
        interval '1 day',
        interval '1 day'
      ),
      (
        '[SEED-CARATINGA] Iluminacao instavel na Rua Inacio Tome',
        'Postes com oscilacao de energia na Rua Inacio Tome, deixando a via escura em varios periodos da noite.',
        'iluminacao'::public.occurrence_category,
        'aberto'::public.occurrence_status,
        -19.794100::double precision,
        -42.138000::double precision,
        'Centro',
        interval '3 days',
        interval '3 days'
      ),
      (
        '[SEED-CARATINGA] Acumulo de lixo na Avenida Presidente Tancredo Neves',
        'Ponto de descarte irregular com sacos e restos organicos na Avenida Presidente Tancredo Neves.',
        'lixo'::public.occurrence_category,
        'aberto'::public.occurrence_status,
        -19.786500::double precision,
        -42.134800::double precision,
        'Santa Zita',
        interval '6 days',
        interval '6 days'
      ),
      (
        '[SEED-CARATINGA] Esgoto retornando na Travessa Eduardo Otavio Boy',
        'Moradores relataram retorno de esgoto em dias de chuva na Travessa Eduardo Otavio Boy.',
        'esgoto'::public.occurrence_category,
        'aberto'::public.occurrence_status,
        -19.788300::double precision,
        -42.136800::double precision,
        'Jose Moyses Nacif',
        interval '9 days',
        interval '9 days'
      ),
      (
        '[SEED-CARATINGA] Entulho ocupando passeio na Rua Hilda Coelho Guimaraes',
        'Restos de obra obstruindo passagem de pedestres na Rua Hilda Coelho Guimaraes.',
        'entulho'::public.occurrence_category,
        'em_analise'::public.occurrence_status,
        -19.791800::double precision,
        -42.132800::double precision,
        'Prefeito Milton Chagas',
        interval '12 days',
        interval '11 days'
      ),
      (
        '[SEED-CARATINGA] Falta de iluminacao na Rua Joao Raimundo de Souza',
        'Luminarias apagadas em sequencia na Rua Joao Raimundo de Souza, prejudicando seguranca noturna.',
        'iluminacao'::public.occurrence_category,
        'em_analise'::public.occurrence_status,
        -19.785000::double precision,
        -42.131000::double precision,
        'Esplanada',
        interval '15 days',
        interval '14 days'
      ),
      (
        '[SEED-CARATINGA] Buraco profundo na Rua Professor Colombo Etienne Arreguy',
        'Buraco com grande profundidade em frente a area esportiva na Rua Professor Colombo Etienne Arreguy.',
        'buraco'::public.occurrence_category,
        'em_analise'::public.occurrence_status,
        -19.795800::double precision,
        -42.146000::double precision,
        'Nossa Senhora Aparecida',
        interval '20 days',
        interval '19 days'
      ),
      (
        '[SEED-CARATINGA] Entulho descartado na Rua Joao Horacio Alves',
        'Pilhas de restos de poda e construcao na Rua Joao Horacio Alves bloqueando parte da via.',
        'entulho'::public.occurrence_category,
        'em_analise'::public.occurrence_status,
        -19.783800::double precision,
        -42.144800::double precision,
        'Dario Grossi',
        interval '24 days',
        interval '23 days'
      ),
      (
        '[SEED-CARATINGA] Esgoto a ceu aberto na Rua Coronel Antonio da Silva',
        'Trecho com vazamento constante de esgoto na Rua Coronel Antonio da Silva.',
        'esgoto'::public.occurrence_category,
        'em_execucao'::public.occurrence_status,
        -19.781800::double precision,
        -42.137500::double precision,
        'Salatiel',
        interval '28 days',
        interval '26 days'
      ),
      (
        '[SEED-CARATINGA] Lixo acumulado na Rua Doutor Maninho',
        'Acumulo de lixo domiciliar em ponto sem coleta regular na Rua Doutor Maninho.',
        'lixo'::public.occurrence_category,
        'em_execucao'::public.occurrence_status,
        -19.787800::double precision,
        -42.145800::double precision,
        'Anapolis',
        interval '32 days',
        interval '30 days'
      ),
      (
        '[SEED-CARATINGA] Reparo de iluminacao na Travessa Portes',
        'Equipe de campo iniciou troca de luminarias e cabos na Travessa Portes.',
        'iluminacao'::public.occurrence_category,
        'em_execucao'::public.occurrence_status,
        -19.790600::double precision,
        -42.147800::double precision,
        'Santo Antonio',
        interval '36 days',
        interval '34 days'
      ),
      (
        '[SEED-CARATINGA] Buraco corrigido na Rua Jose Carlos Pereira',
        'Servico de tapa-buraco concluido e sinalizacao retirada na Rua Jose Carlos Pereira.',
        'buraco'::public.occurrence_category,
        'resolvido'::public.occurrence_status,
        -19.793000::double precision,
        -42.149300::double precision,
        'Maria da Gloria',
        interval '42 days',
        interval '39 days'
      ),
      (
        '[SEED-CARATINGA] Limpeza concluida na Avenida Joao Caetano do Nascimento',
        'Remocao de lixo e varricao concluida na Avenida Joao Caetano do Nascimento.',
        'lixo'::public.occurrence_category,
        'resolvido'::public.occurrence_status,
        -19.802000::double precision,
        -42.135000::double precision,
        'Rafael Jose de Lima',
        interval '48 days',
        interval '45 days'
      ),
      (
        '[SEED-CARATINGA] Entulho removido na Rua Jequitiba',
        'Retirada de entulho finalizada e passeio liberado para pedestres na Rua Jequitiba.',
        'entulho'::public.occurrence_category,
        'resolvido'::public.occurrence_status,
        -19.800800::double precision,
        -42.141800::double precision,
        'Floresta',
        interval '55 days',
        interval '51 days'
      )
  ) as t(
    title,
    description,
    category,
    status,
    latitude,
    longitude,
    neighborhood,
    created_ago,
    updated_ago
  )
),
prepared as (
  select
    title,
    description,
    category,
    status,
    latitude,
    longitude,
    neighborhood,
    (now() - created_ago) as created_at,
    (now() - updated_ago) as updated_at,
    (now() - created_ago)
    + case category
      when 'buraco' then interval '72 hours'
      when 'iluminacao' then interval '48 hours'
      when 'lixo' then interval '36 hours'
      when 'entulho' then interval '96 hours'
      when 'esgoto' then interval '24 hours'
      else interval '120 hours'
    end as sla_deadline
  from seed_data
),
assignee as (
  select id
  from public.profiles
  where role in ('agent', 'gestor', 'admin')
  order by created_at asc
  limit 1
)
insert into public.occurrences (
  title,
  description,
  category,
  status,
  latitude,
  longitude,
  neighborhood,
  user_id,
  assigned_to,
  sla_deadline,
  created_at,
  updated_at
)
select
  p.title,
  p.description,
  p.category,
  p.status,
  p.latitude,
  p.longitude,
  p.neighborhood,
  null::uuid as user_id,
  case
    when p.status in ('em_execucao', 'resolvido') then (select id from assignee)
    else null::uuid
  end as assigned_to,
  p.sla_deadline,
  p.created_at,
  p.updated_at
from prepared p;

-- Align trigger-created initial logs to each seeded occurrence timeline.
update public.occurrence_logs l
set created_at = o.created_at + interval '15 minutes'
from public.occurrences o
where l.occurrence_id = o.id
  and o.title like '[SEED-CARATINGA]%'
  and l.comment = 'Ocorrencia registrada no portal.';

-- Add progression logs by situation.
insert into public.occurrence_logs (
  occurrence_id,
  actor_id,
  status,
  comment,
  is_internal,
  created_at
)
select
  o.id,
  (select id from public.profiles where role in ('agent', 'gestor', 'admin') order by created_at asc limit 1),
  'em_analise'::public.occurrence_status,
  'Triagem inicial realizada e encaminhamento para equipe tecnica.',
  true,
  o.created_at + interval '4 hours'
from public.occurrences o
where o.title like '[SEED-CARATINGA]%'
  and o.status in ('em_analise', 'em_execucao', 'resolvido');

insert into public.occurrence_logs (
  occurrence_id,
  actor_id,
  status,
  comment,
  is_internal,
  created_at
)
select
  o.id,
  (select id from public.profiles where role in ('agent', 'gestor', 'admin') order by created_at asc limit 1),
  'em_execucao'::public.occurrence_status,
  'Servico agendado e equipe de campo em execucao.',
  true,
  o.created_at + interval '1 day'
from public.occurrences o
where o.title like '[SEED-CARATINGA]%'
  and o.status in ('em_execucao', 'resolvido');

insert into public.occurrence_logs (
  occurrence_id,
  actor_id,
  status,
  comment,
  is_internal,
  created_at
)
select
  o.id,
  (select id from public.profiles where role in ('agent', 'gestor', 'admin') order by created_at asc limit 1),
  'resolvido'::public.occurrence_status,
  'Demanda finalizada com registro de conclusao pela equipe.',
  false,
  o.updated_at
from public.occurrences o
where o.title like '[SEED-CARATINGA]%'
  and o.status = 'resolvido';

commit;

-- Quick check:
-- select status, count(*) from public.occurrences
-- where title like '[SEED-CARATINGA]%'
-- group by status
-- order by status;
