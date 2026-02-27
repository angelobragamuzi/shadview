# ShadBoard

Plataforma inteligente de gestão de demandas urbanas para prefeituras e órgãos públicos.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Storage, Realtime)
- React Hook Form + Zod
- Google Maps JavaScript API
- Recharts

## Funcionalidades (MVP atual)

### Portal do cidadão

- Formulário público de ocorrência (sem login)
- Abertura por CEP + número com preenchimento automático de endereço
- Geocodificação de endereço para posicionamento no mapa
- Acompanhamento por protocolo
- Avaliação após resolução

### Painel administrativo (gestor)

- Login restrito para perfil `gestor`
- Dashboard executivo com KPIs e gráficos
- Gestão de ocorrências com filtros e atualização de status
- Mapa operacional com modos:
  - Calor
  - Ponteiros com detalhes e atalho para Street View
- Relatórios com exportação CSV e PDF

## Estrutura

```txt
/app
  /dashboard
  /login
  /occurrence
/components
/lib
/hooks
/services
/types
/supabase
```

## Variáveis de ambiente

Crie um arquivo `.env.local` (ou `.env`) na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SEU_SUPABASE_ANON_KEY
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=SUA_GOOGLE_MAPS_API_KEY
```

Arquivo de exemplo:

- `.env.example`

## Setup local

1. Instale dependências:

```bash
npm install
```

2. Crie o arquivo de ambiente:

```bash
cp .env.example .env.local
```

3. Execute o schema no Supabase SQL Editor:

- Arquivo: `supabase/schema.sql`

4. Inicie o projeto:

```bash
npm run dev
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Deploy (Vercel)

1. Suba o repositório no GitHub.
2. Importe o projeto na Vercel.
3. Configure as mesmas variáveis de ambiente.
4. Faça o deploy.
