-- Seed data for Caratinga/MG occurrences.
-- Run this in Supabase SQL Editor after schema.sql.
-- This script is idempotent for records tagged with [SEED-CARATINGA].

begin;

-- Cleanup previous operational seed data.
delete from public.operational_agents
where email like '%@seed-caratinga.local';

delete from public.teams
where name like '[SEED-CARATINGA]%';

delete from public.institutions
where name like '[SEED-CARATINGA]%';

delete from public.occurrences
where title like '[SEED-CARATINGA]%';

-- Seed institutions.
with actor as (
  select id
  from public.profiles
  where role in ('agent', 'gestor', 'admin')
  order by created_at asc
  limit 1
),
institution_seed as (
  select *
  from (
    values
      ('[SEED-CARATINGA] Secretaria de Obras e Infraestrutura', 'SOI', 'obras@seed-caratinga.local', '(33) 3329-1001'),
      ('[SEED-CARATINGA] Secretaria de Servicos Urbanos', 'SSU', 'servicos@seed-caratinga.local', '(33) 3329-1002'),
      ('[SEED-CARATINGA] Secretaria de Meio Ambiente', 'SEMA', 'meioambiente@seed-caratinga.local', '(33) 3329-1003'),
      ('[SEED-CARATINGA] Defesa Civil Municipal', 'DCM', 'defesacivil@seed-caratinga.local', '(33) 3329-1004')
  ) as t(name, acronym, contact_email, contact_phone)
)
insert into public.institutions (
  name,
  acronym,
  contact_email,
  contact_phone,
  created_by
)
select
  s.name,
  s.acronym,
  s.contact_email,
  s.contact_phone,
  (select id from actor)
from institution_seed s;

-- Seed teams.
with actor as (
  select id
  from public.profiles
  where role in ('agent', 'gestor', 'admin')
  order by created_at asc
  limit 1
),
team_seed as (
  select *
  from (
    values
      ('[SEED-CARATINGA] Secretaria de Obras e Infraestrutura', '[SEED-CARATINGA] Equipe de Pavimentacao Centro', 'Atendimento a buracos e recomposicao asfaltica.'),
      ('[SEED-CARATINGA] Secretaria de Servicos Urbanos', '[SEED-CARATINGA] Equipe de Iluminacao Publica', 'Troca de luminarias, reatores e cabos.'),
      ('[SEED-CARATINGA] Secretaria de Servicos Urbanos', '[SEED-CARATINGA] Equipe de Limpeza Urbana', 'Coleta corretiva, varricao e remocao de descartes.'),
      ('[SEED-CARATINGA] Secretaria de Meio Ambiente', '[SEED-CARATINGA] Equipe de Fiscalizacao Ambiental', 'Apoio em descarte irregular e poda urbana.'),
      ('[SEED-CARATINGA] Defesa Civil Municipal', '[SEED-CARATINGA] Equipe de Drenagem e Esgoto', 'Resposta a pontos de alagamento e retorno de esgoto.')
  ) as t(institution_name, name, description)
)
insert into public.teams (
  institution_id,
  name,
  description,
  created_by
)
select
  i.id,
  s.name,
  s.description,
  (select id from actor)
from team_seed s
join public.institutions i
  on i.name = s.institution_name;

-- Seed operational agents.
with actor as (
  select id
  from public.profiles
  where role in ('agent', 'gestor', 'admin')
  order by created_at asc
  limit 1
),
agent_seed as (
  select *
  from (
    values
      ('Carlos Henrique Almeida', 'carlos.almeida@seed-caratinga.local', '(33) 99111-2001', '[SEED-CARATINGA] Secretaria de Obras e Infraestrutura', '[SEED-CARATINGA] Equipe de Pavimentacao Centro'),
      ('Fernanda Cristina Rocha', 'fernanda.rocha@seed-caratinga.local', '(33) 99111-2002', '[SEED-CARATINGA] Secretaria de Servicos Urbanos', '[SEED-CARATINGA] Equipe de Iluminacao Publica'),
      ('Leonardo Matias Silva', 'leonardo.silva@seed-caratinga.local', '(33) 99111-2003', '[SEED-CARATINGA] Secretaria de Servicos Urbanos', '[SEED-CARATINGA] Equipe de Limpeza Urbana'),
      ('Paula Regina Mendes', 'paula.mendes@seed-caratinga.local', '(33) 99111-2004', '[SEED-CARATINGA] Secretaria de Meio Ambiente', '[SEED-CARATINGA] Equipe de Fiscalizacao Ambiental'),
      ('Joao Victor Lacerda', 'joao.lacerda@seed-caratinga.local', '(33) 99111-2005', '[SEED-CARATINGA] Defesa Civil Municipal', '[SEED-CARATINGA] Equipe de Drenagem e Esgoto'),
      ('Renata Souza Braga', 'renata.braga@seed-caratinga.local', '(33) 99111-2006', '[SEED-CARATINGA] Secretaria de Obras e Infraestrutura', '[SEED-CARATINGA] Equipe de Pavimentacao Centro'),
      ('Marcos Antonio Teixeira', 'marcos.teixeira@seed-caratinga.local', '(33) 99111-2007', '[SEED-CARATINGA] Secretaria de Servicos Urbanos', '[SEED-CARATINGA] Equipe de Iluminacao Publica'),
      ('Juliana Nogueira Reis', 'juliana.reis@seed-caratinga.local', '(33) 99111-2008', '[SEED-CARATINGA] Secretaria de Servicos Urbanos', '[SEED-CARATINGA] Equipe de Limpeza Urbana')
  ) as t(full_name, email, phone, institution_name, team_name)
)
insert into public.operational_agents (
  full_name,
  email,
  phone,
  institution_id,
  team_id,
  is_active,
  created_by
)
select
  s.full_name,
  s.email,
  s.phone,
  i.id,
  tm.id,
  true,
  (select id from actor)
from agent_seed s
left join public.institutions i
  on i.name = s.institution_name
left join public.teams tm
  on tm.name = s.team_name;

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
      ),
      (
        '[SEED-CARATINGA] Vazamento de esgoto na Rua Joaquim Carlos',
        'Tampa de rede danificada e extravasamento frequente na Rua Joaquim Carlos, proximo a escola do bairro.',
        'esgoto'::public.occurrence_category,
        'aberto'::public.occurrence_status,
        -19.796400::double precision,
        -42.133900::double precision,
        'Limoeiro',
        interval '2 days',
        interval '2 days'
      ),
      (
        '[SEED-CARATINGA] Solicitacao de poda na Praca Cesario Alvim',
        'Arvores com galhos baixos obstruindo iluminacao publica e passagem de pedestres na Praca Cesario Alvim.',
        'outros'::public.occurrence_category,
        'aberto'::public.occurrence_status,
        -19.789900::double precision,
        -42.139600::double precision,
        'Centro',
        interval '5 days',
        interval '5 days'
      ),
      (
        '[SEED-CARATINGA] Buraco extenso na Rua Doutor Eduardo Cury',
        'Trecho com cratera apos chuva forte na Rua Doutor Eduardo Cury, com risco de danos a veiculos.',
        'buraco'::public.occurrence_category,
        'em_execucao'::public.occurrence_status,
        -19.784700::double precision,
        -42.136200::double precision,
        'Esperanca',
        interval '18 days',
        interval '16 days'
      ),
      (
        '[SEED-CARATINGA] Iluminacao restaurada na Rua Muriae',
        'Substituicao de reator e lampadas concluida na Rua Muriae, com normalizacao do trecho noturno.',
        'iluminacao'::public.occurrence_category,
        'resolvido'::public.occurrence_status,
        -19.799200::double precision,
        -42.130700::double precision,
        'Santa Cruz',
        interval '58 days',
        interval '54 days'
      ),
      (
        '[SEED-CARATINGA] Coleta irregular na Rua Coronel Chagas',
        'Moradores relatam acumulo de residuos por falha recorrente de coleta na Rua Coronel Chagas.',
        'lixo'::public.occurrence_category,
        'em_analise'::public.occurrence_status,
        -19.792600::double precision,
        -42.134100::double precision,
        'Nossa Senhora das Gracas',
        interval '22 days',
        interval '21 days'
      ),
      (
        '[SEED-CARATINGA] Entulho em lote na Rua Maria da Conceicao',
        'Descarte irregular de restos de obra em lote aberto na Rua Maria da Conceicao.',
        'entulho'::public.occurrence_category,
        'aberto'::public.occurrence_status,
        -19.801100::double precision,
        -42.146300::double precision,
        'Santo Antonio',
        interval '7 days',
        interval '7 days'
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

-- Seed operational assignment links for occurrences under internal handling.
delete from public.occurrence_assignments oa
using public.occurrences o
where oa.occurrence_id = o.id
  and o.title like '[SEED-CARATINGA]%';

with default_seed_agent as (
  select
    id as agent_id,
    institution_id,
    team_id
  from public.operational_agents
  where email like '%@seed-caratinga.local'
  order by created_at asc
  limit 1
)
insert into public.occurrence_assignments (
  occurrence_id,
  institution_id,
  team_id,
  agent_id,
  assigned_by,
  notes,
  assigned_at
)
select
  o.id,
  a.institution_id,
  a.team_id,
  a.agent_id,
  (select id from public.profiles where role in ('agent', 'gestor', 'admin') order by created_at asc limit 1),
  'Vinculo operacional inicial gerado pelo seed de Caratinga.',
  o.created_at + interval '6 hours'
from public.occurrences o
cross join default_seed_agent a
where o.title like '[SEED-CARATINGA]%'
  and o.status in ('em_analise', 'em_execucao', 'resolvido');

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
-- select count(*) from public.institutions where name like '[SEED-CARATINGA]%';
-- select count(*) from public.teams where name like '[SEED-CARATINGA]%';
-- select count(*) from public.operational_agents where email like '%@seed-caratinga.local';
