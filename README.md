# TubeIntel — YouTube Research Platform

Plataforma de pesquisa e inteligência para criadores de conteúdo YouTube. Usa directamente a **YouTube Data API v3** para encontrar vídeos virais, analisar canais e descobrir tendências.

## Funcionalidades

- **Pesquisa de Vídeos** — Filtros por keyword, país, data, tipo (Shorts/Long Form), viral score
- **Trending** — Vídeos em alta por país e categoria
- **Análise de Canal** — Métricas, gráficos, vídeos recentes, Rising Score
- **Canais em Ascensão** — Detecta canais novos com crescimento explosivo
- **Comparação de Canais** — Análise competitiva lado a lado com radar chart
- **Shorts Virais** — Secção dedicada a Shorts
- **Explorador de Nichos** — 20+ nichos pré-definidos
- **Colecções** — Guarda vídeos em pastas
- **Alertas** — Monitoriza keywords e canais

## Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- Prisma + SQLite
- YouTube Data API v3

## Setup

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local e adicionar DATABASE_URL se necessário

# Criar base de dados
npx prisma migrate dev

# Iniciar desenvolvimento
npm run dev
```

Abre a aplicação em `http://localhost:3000` e configura a tua YouTube API Key em **Configurações**.

## Como obter a API Key

1. Acede ao [Google Cloud Console](https://console.cloud.google.com/)
2. Cria um projecto ou selecciona um existente
3. Activa a API "YouTube Data API v3"
4. Cria credenciais → Chave de API
5. Cola a chave nas Configurações da aplicação

## Deploy com Docker

A aplicação expõe a porta **3005** por defeito:

```bash
# Configurar variáveis de ambiente
cp .env.docker.example .env
# Editar .env e preencher YOUTUBE_API_KEY, NEXTAUTH_SECRET, etc.

# Build e iniciar
docker compose up -d

# Aceder em http://localhost:3005
```

O volume `app_data` persiste a base de dados SQLite entre reinícios.

## Deploy (produção sem Docker)

Para produção com PostgreSQL em vez de SQLite:

```bash
# .env
DATABASE_URL="postgresql://user:pass@host:5432/tubeintel"
```

E actualiza o `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Depois: `npx prisma migrate deploy`

## Estrutura

```
tubeintel/
├── app/           # Páginas e API routes
├── components/    # Componentes React
├── lib/           # Utilitários, YouTube client, algoritmos
├── prisma/        # Schema e migrations
└── types/         # TypeScript types
```
