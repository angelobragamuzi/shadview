-- Seed de 50 ocorrencias em localizacoes diferentes de Caratinga/MG.
-- Execute este arquivo no Supabase SQL Editor apos o schema.sql.
-- Idempotente para registros com tag [SEED-CARATINGA-50].

begin;

-- Limpeza de seeds anteriores.
delete from public.occurrences
where title like '[SEED-CARATINGA-50]%';

with seed_data as (
  select *
  from (
    values
      (1,  'Rua Joao Pinheiro',                       '315', 'Centro',                    'buraco',      'aberto',      3,  'Asfalto cedendo no cruzamento com risco para motos e ciclistas.'),
      (2,  'Avenida Olegario Maciel',                 '120', 'Centro',                    'iluminacao',  'aberto',      4,  'Postes apagados em sequencia no trecho mais movimentado da avenida.'),
      (3,  'Rua Raul Soares',                         '87',  'Santa Cruz',                'lixo',        'aberto',      5,  'Acumulo de residuos em calcada e via lateral proximo ao comercio local.'),
      (4,  'Rua Inacio Tome',                         '240', 'Centro',                    'esgoto',      'aberto',      6,  'Retorno de esgoto em frente a residencias apos chuva recente.'),
      (5,  'Rua Coronel Antonio da Silva',            '55',  'Salatiel',                  'entulho',     'em_analise',  7,  'Descarte de restos de obra bloqueando parte da passagem de pedestres.'),
      (6,  'Avenida Presidente Tancredo Neves',       '940', 'Santa Zita',                'iluminacao',  'em_analise',  8,  'Oscilacao de iluminacao em postes de esquina e risco de apagao noturno.'),
      (7,  'Rua Professor Olinto',                    '410', 'Centro',                    'buraco',      'em_analise',  9,  'Buraco profundo com aumento de tamanho por causa do trafego intenso.'),
      (8,  'Travessa Eduardo Otavio Boy',             '33',  'Jose Moyses Nacif',         'entulho',     'em_analise', 10,  'Pilhas de entulho e poda urbana acumuladas em area de retorno.'),
      (9,  'Rua Hilda Coelho Guimaraes',              '122', 'Prefeito Milton Chagas',    'esgoto',      'em_execucao',11,  'Vazamento continuo na rede de esgoto exigindo intervencao de campo.'),
      (10, 'Rua Joao Raimundo de Souza',              '78',  'Esplanada',                 'lixo',        'em_execucao',12,  'Lixo domiciliar fora do ponto de coleta com odor forte no local.'),
      (11, 'Rua Professor Colombo Etienne Arreguy',   '205', 'Nossa Senhora Aparecida',   'iluminacao',  'em_execucao',13,  'Pontos escuros entre duas quadras e luminarias com falha intermitente.'),
      (12, 'Rua Joao Horacio Alves',                  '390', 'Dario Grossi',              'buraco',      'resolvido',  14,  'Dano no pavimento foi corrigido e sinalizacao de alerta retirada.'),
      (13, 'Rua Doutor Maninho',                      '160', 'Anapolis',                  'lixo',        'resolvido',  15,  'Coleta corretiva realizada com limpeza de toda a extensao da rua.'),
      (14, 'Travessa Portes',                         '48',  'Santo Antonio',             'entulho',     'resolvido',  16,  'Material descartado removido e passeio liberado para circulacao.'),
      (15, 'Rua Jose Carlos Pereira',                 '502', 'Maria da Gloria',           'outros',      'aberto',     17,  'Solicitacao de poda e limpeza de galhos comprometendo visibilidade.'),
      (16, 'Avenida Joao Caetano do Nascimento',      '1001','Rafael Jose de Lima',      'buraco',      'em_execucao',18,  'Fissura extensa no asfalto com risco de dano em veiculos leves.'),
      (17, 'Rua Jequitiba',                           '66',  'Floresta',                  'iluminacao',  'resolvido',  19,  'Troca de reator e lampadas concluida em todo o quarteirao.'),
      (18, 'Rua Joaquim Carlos',                      '220', 'Limoeiro',                  'lixo',        'em_analise', 20,  'Ponto recorrente de descarte irregular de lixo e volumosos.'),
      (19, 'Praca Cesario Alvim',                     '12',  'Centro',                    'entulho',     'aberto',     21,  'Residuos de construcao em area publica com impacto visual e sanitario.'),
      (20, 'Rua Doutor Eduardo Cury',                 '340', 'Esperanca',                 'esgoto',      'aberto',     22,  'Tampa danificada e extravasamento de esgoto em horario de pico.'),
      (21, 'Rua Muriae',                              '89',  'Santa Cruz',                'buraco',      'aberto',     23,  'Depressao no leito da via dificultando passagem de onibus escolar.'),
      (22, 'Rua Coronel Chagas',                      '144', 'Nossa Senhora das Gracas',  'iluminacao',  'aberto',     24,  'Ausencia de iluminacao publica em trechos com comercio noturno.'),
      (23, 'Rua Maria da Conceicao',                  '201', 'Santo Antonio',             'lixo',        'aberto',     25,  'Sacos rompidos em via publica com presenca de animais no entorno.'),
      (24, 'Rua Niteroi',                             '77',  'Esperanca',                 'entulho',     'em_analise', 26,  'Entulho de reforma residencial acumulado ao lado de ponto de onibus.'),
      (25, 'Rua Ceara',                               '260', 'Santa Cruz',                'esgoto',      'em_analise', 27,  'Odor forte e vazamento em caixa de passagem na calcada.'),
      (26, 'Rua Bahia',                               '188', 'Anapolis',                  'outros',      'em_analise', 28,  'Solicitacao de capina e limpeza de area de servidao urbana.'),
      (27, 'Rua Minas Gerais',                        '320', 'Centro',                    'buraco',      'em_execucao',29,  'Buraco proximo ao semaforo com risco elevado para motociclistas.'),
      (28, 'Rua Espirito Santo',                      '95',  'Centro',                    'iluminacao',  'em_execucao',30,  'Poste sem funcionamento apos curto em rede de distribuicao.'),
      (29, 'Rua Padre Raul Motta',                    '432', 'Centro',                    'lixo',        'em_execucao',31,  'Acumulo de residuos em esquina de grande fluxo de pedestres.'),
      (30, 'Avenida Dario Grossi',                    '710', 'Dario Grossi',              'entulho',     'resolvido',  32,  'Retirada de restos de obra concluida com varricao final da area.'),
      (31, 'Rua Campina Verde',                       '58',  'Santa Zita',                'esgoto',      'resolvido',  33,  'Equipe realizou reparo da rede e normalizacao do escoamento.'),
      (32, 'Rua Lambari',                             '149', 'Santa Zita',                'buraco',      'aberto',     34,  'Desgaste no pavimento e surgimento de cratera apos periodo chuvoso.'),
      (33, 'Rua Timoteo',                             '275', 'Esplanada',                 'iluminacao',  'em_analise', 35,  'Trecho com baixa visibilidade e luminarias queimadas.'),
      (34, 'Rua Ipatinga',                            '118', 'Esplanada',                 'lixo',        'aberto',     36,  'Coleta irregular gerando concentracao de residuos na via.'),
      (35, 'Rua Carangola',                           '402', 'Floresta',                  'entulho',     'em_execucao',37,  'Descarte clandestino de entulho em lote de esquina.'),
      (36, 'Rua Uba',                                 '84',  'Floresta',                  'esgoto',      'aberto',     38,  'Manilha rompida causando vazamento continuo para a sarjeta.'),
      (37, 'Rua Ponte Nova',                          '211', 'Limoeiro',                  'buraco',      'em_analise', 39,  'Buraco em faixa de rolamento com risco de acidentes.'),
      (38, 'Rua Sao Joao',                            '69',  'Santo Antonio',             'outros',      'aberto',     40,  'Solicitacao de poda preventiva proxima a rede eletrica.'),
      (39, 'Rua Sao Pedro',                           '156', 'Salatiel',                  'iluminacao',  'resolvido',  41,  'Iluminacao restabelecida apos substituicao de cabos e luminarias.'),
      (40, 'Rua Sao Paulo',                           '500', 'Anapolis',                  'lixo',        'em_execucao',42,  'Mutirao de limpeza em andamento para retirada de residuos.'),
      (41, 'Rua Belo Horizonte',                      '271', 'Centro',                    'entulho',     'em_analise', 43,  'Entulho e madeira descartados irregularmente em area comercial.'),
      (42, 'Rua Uberlandia',                          '92',  'Nossa Senhora Aparecida',   'esgoto',      'resolvido',  44,  'Intervencao concluida na rede de esgoto com teste de vazao.'),
      (43, 'Rua Araguari',                            '333', 'Nossa Senhora Aparecida',   'buraco',      'aberto',     45,  'Asfalto afundando proximo a rotatoria do bairro.'),
      (44, 'Rua Alvinopolis',                         '47',  'Esperanca',                 'iluminacao',  'aberto',     46,  'Dois postes sem luz em area de travessia de estudantes.'),
      (45, 'Rua Coronel Chiquinho',                   '280', 'Limoeiro',                  'lixo',        'em_analise', 47,  'Descarte de lixo e galhos em frente a area residencial.'),
      (46, 'Rua Jose de Anchieta',                    '135', 'Santa Cruz',                'entulho',     'aberto',     48,  'Sobra de material de obra obstruindo metade da calcada.'),
      (47, 'Avenida Moacyr de Mattos',                '820', 'Centro',                    'esgoto',      'em_execucao',49,  'Equipe em campo para conter extravasamento em caixa coletora.'),
      (48, 'Rua Jose Belegard',                       '61',  'Centro',                    'buraco',      'resolvido',  50,  'Pavimento recomposto e nivelamento da via finalizado.'),
      (49, 'Rua Marechal Deodoro',                    '190', 'Centro',                    'iluminacao',  'em_analise', 51,  'Relato de intermitencia no sistema de iluminacao publica.'),
      (50, 'Rua Silva Jardim',                        '410', 'Centro',                    'outros',      'aberto',     52,  'Pedido de limpeza de ponto critico com vegetacao e residuos.' )
  ) as t(
    seq,
    street,
    address_number,
    neighborhood,
    category,
    status,
    created_days,
    detail
  )
),
prepared as (
  select
    left(
      format(
        '[SEED-CARATINGA-50] %s - %s',
        case category
          when 'buraco' then 'Buraco em via'
          when 'iluminacao' then 'Falha de iluminacao publica'
          when 'lixo' then 'Acumulo de lixo urbano'
          when 'entulho' then 'Descarte de entulho'
          when 'esgoto' then 'Vazamento de esgoto'
          else 'Demanda urbana'
        end,
        street
      ),
      120
    ) as title,
    format(
      '%s, numero %s, bairro %s, Caratinga/MG. %s',
      street,
      address_number,
      neighborhood,
      detail
    ) as description,
    category::public.occurrence_category as category,
    status::public.occurrence_status as status,
    (
      -19.7920
      + ((seq % 10) - 5) * 0.00115
      + ((seq - 1) / 10) * 0.00032
    )::double precision as latitude,
    (
      -42.1405
      + ((seq % 8) - 4) * 0.00105
      - ((seq - 1) / 10) * 0.00027
    )::double precision as longitude,
    neighborhood,
    (now() - (created_days || ' days')::interval) as created_at,
    (
      now() - (
        case status
          when 'aberto' then created_days
          when 'em_analise' then greatest(created_days - 1, 1)
          when 'em_execucao' then greatest(created_days - 2, 1)
          when 'resolvido' then greatest(created_days - 5, 1)
          else created_days
        end || ' days'
      )::interval
    ) as updated_at
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
  p.created_at
  + case p.category
    when 'buraco' then interval '72 hours'
    when 'iluminacao' then interval '48 hours'
    when 'lixo' then interval '36 hours'
    when 'entulho' then interval '96 hours'
    when 'esgoto' then interval '24 hours'
    else interval '120 hours'
  end as sla_deadline,
  p.created_at,
  p.updated_at
from prepared p;

-- Vinculo operacional para ocorrencias em andamento/concluidas (se houver cadastro operacional).
with default_seed_agent as (
  select
    id as agent_id,
    institution_id,
    team_id
  from public.operational_agents
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
  'Vinculo operacional gerado pelo seed [SEED-CARATINGA-50].',
  o.created_at + interval '6 hours'
from public.occurrences o
cross join default_seed_agent a
where o.title like '[SEED-CARATINGA-50]%'
  and o.status in ('em_analise', 'em_execucao', 'resolvido');

-- Ajusta o log inicial criado por trigger.
update public.occurrence_logs l
set created_at = o.created_at + interval '15 minutes'
from public.occurrences o
where l.occurrence_id = o.id
  and o.title like '[SEED-CARATINGA-50]%'
  and l.comment = 'Ocorrencia registrada no portal.';

-- Logs de evolucao por status.
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
where o.title like '[SEED-CARATINGA-50]%'
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
where o.title like '[SEED-CARATINGA-50]%'
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
where o.title like '[SEED-CARATINGA-50]%'
  and o.status = 'resolvido';

commit;

-- Checagens rapidas:
-- select count(*) from public.occurrences where title like '[SEED-CARATINGA-50]%';
-- select status, count(*) from public.occurrences where title like '[SEED-CARATINGA-50]%' group by status order by status;
