# Plano: Melhorar Alertas – Channel Spy / Monitor

## Objetivo

Transformar os alertas de canais numa funcionalidade de **monitorização ativa**: poder visualizar conteúdo, vídeos, estatísticas dos últimos 28 dias e performance de cada canal monitorizado, sem sair da área de alertas.

---

## Estado Atual

| Componente | Estado |
|------------|--------|
| Alert (channel) | Guarda `channelId` em `value` |
| Página `/alerts` | Lista alertas, sem dados do canal |
| Canal detalhe `/channels/[id]` | Tem analytics 28d, vídeos, revenue, performance |
| `MonitoredChannel` (Prisma) | Modelo existe mas não é usado |

**Problema:** Os alertas de canal são apenas IDs. Não há forma de ver o que o canal está a fazer sem ir manualmente a `/channels/[id]`.

---

## Visão da Solução

### 1. Página "Monitor" ou "Spy" (`/monitor`)

Nova página dedicada a canais monitorizados (alertas tipo `channel`):

- **Lista de canais** em cards expandíveis ou em grid
- **Cada card** mostra:
  - Thumbnail, nome, link para análise completa
  - **Resumo 28 dias:** total views, shorts vs long form, revenue estimado
  - **Vídeos recentes:** últimos 5–8 vídeos com views, duração, viral score
  - Botão "Ver análise completa" → `/channels/[id]`

### 2. Melhorias na Página de Alertas (`/alerts`)

- Para alertas **channel**: botão "Espiar" / "Ver canal" que abre:
  - **Opção A:** Modal com resumo (stats 28d, vídeos recentes)
  - **Opção B:** Navega para `/monitor` com o canal em destaque
  - **Opção C:** Link direto para `/channels/[id]` (já existe, mas sem contexto)
- Mostrar **thumbnail e nome do canal** em vez de só o `channelId` (fetch ao carregar)

### 3. Componente Reutilizável: `ChannelMonitorCard`

Card compacto que exibe:

- Header: thumbnail, nome, subs, link "Ver análise"
- Secção colapsável "Últimos 28 dias":
  - Views totais, shorts vs long form (views)
  - Revenue estimado (com defaults)
  - Performance breakdown (opcional, resumido)
- Secção "Vídeos recentes": mini-grid de 4–6 vídeos (thumbnail, título, views, duração, viral)
- Botão "Expandir" para ver mais vídeos ou ir para a análise completa

---

## Arquitetura de Dados

### APIs Existentes (reutilizar)

| API | Uso |
|-----|-----|
| `GET /api/youtube/channel?channelId=X` | Dados do canal (nome, thumbnail, stats) |
| `GET /api/youtube/channel-analytics?channelId=X&days=28` | Shorts/long form, views, duration, likes, comments |
| `GET /api/youtube/channel-videos?channelId=X&maxResults=12&order=date` | Vídeos recentes |

### Nova API (opcional): `GET /api/alerts/channel-summary`

Agregação para reduzir chamadas no frontend:

```
GET /api/alerts/channel-summary?channelIds=id1,id2,id3
```

Retorna, para cada `channelId`:

- Dados do canal (nome, thumbnail, subs)
- Analytics 28d (shorts, longForm)
- Últimos 6 vídeos

**Alternativa:** O frontend chama em paralelo `channel`, `channel-analytics` e `channel-videos` por canal. Para 5–10 canais, são 15–30 requests. Com cache, é aceitável. A API agregada pode ser uma otimização posterior.

---

## Fluxo de Utilizador

```mermaid
flowchart TB
    subgraph Alerts [Página Alertas]
        AlertList[Lista de alertas]
        ChannelAlert[Alerta canal]
        BtnSpy[Botão Espiar]
    end

    subgraph Monitor [Página Monitor]
        ChannelCards[Cards de canais]
        ChannelCard[ChannelMonitorCard]
        Expand[Expandir / Ver análise]
    end

    AlertList --> ChannelAlert
    ChannelAlert --> BtnSpy
    BtnSpy -->|navega| Monitor
    BtnSpy -->|ou abre modal| ChannelCard

    Monitor --> ChannelCards
    ChannelCards --> ChannelCard
    ChannelCard --> Expand
    Expand --> ChannelsPage[/channels/id]
```

---

## Implementação Detalhada

### Fase 1: Enriquecer a Lista de Alertas

**Objetivo:** Mostrar nome e thumbnail dos canais na lista de alertas.

1. **API `GET /api/alerts`** – Manter como está (retorna alertas).
2. **Página `/alerts`** – Para cada alerta `type=channel`:
   - Fetch `GET /api/youtube/channel?channelId={value}` para obter nome e thumbnail
   - Mostrar card com thumbnail, nome e botão "Espiar"
   - Lazy load: só fazer fetch quando o alerta está visível (ou em batch ao carregar)

3. **Componente `ChannelAlertCard`** (ou estender o card atual):
   - Se `type=channel`: mostrar thumbnail, nome (ou "Canal {channelId}" se fetch falhar)
   - Botão "Espiar" → abre modal ou navega para `/monitor?channelId=X`

### Fase 2: Componente `ChannelMonitorCard`

**Ficheiro:** `components/channel/ChannelMonitorCard.tsx`

**Props:**

- `channelId: string`
- `compact?: boolean` – se true, só header + link; se false, mostra analytics e vídeos

**Comportamento:**

- Fetch em paralelo: `channel`, `channel-analytics`, `channel-videos`
- Estados: loading, error, success
- Render:
  - Header: thumbnail, nome, subs, "Ver análise completa"
  - Se `!compact`: secção 28d (views, shorts/long, revenue) + grid de vídeos recentes

**Reutilização:** Usado na página Monitor e no modal "Espiar" da página de Alertas.

### Fase 3: Página `/monitor`

**Ficheiro:** `app/monitor/page.tsx`

**Lógica:**

1. Fetch `GET /api/alerts` (ou `?type=channel` se existir filtro)
2. Filtrar alertas com `type=channel` e `active=true`
3. Para cada canal, renderizar `ChannelMonitorCard` com `compact={false}`
4. Query param `?channelId=X`: scroll ou expandir o card desse canal

**Layout:**

- Título: "Canais Monitorizados" ou "Channel Spy"
- Grid ou lista de `ChannelMonitorCard`
- Empty state: "Sem canais para monitorizar. Adiciona alertas de canal em Alertas."

### Fase 4: Integração no Sidebar

- Adicionar link "Monitor" ou "Channel Spy" na secção Organização (junto a Alertas e Colecções)
- Ou: renomear "Alertas" para "Alertas e Monitor" e fazer a página de alertas ter tabs: "Alertas" | "Monitor"

**Recomendação:** Página separada `/monitor` para manter a página de alertas focada em criar/gerir alertas.

### Fase 5: Modal "Espiar" na Página de Alertas (opcional)

- Ao clicar "Espiar" num alerta de canal: abrir modal com `ChannelMonitorCard` em modo expandido
- Evita sair da página de alertas para uma pré-visualização rápida

---

## Resumo de Ficheiros

| Acção | Ficheiro |
|-------|----------|
| Criar | `components/channel/ChannelMonitorCard.tsx` |
| Criar | `app/monitor/page.tsx` |
| Modificar | `app/alerts/page.tsx` – enriquecer cards de canal, botão Espiar |
| Modificar | `components/layout/Sidebar.tsx` – link "Monitor" |
| Opcional | `app/api/alerts/channel-summary/route.ts` – API agregada |

---

## Ordem de Implementação

1. **ChannelMonitorCard** – componente base que faz fetch e mostra stats + vídeos
2. **Página `/monitor`** – lista canais de alertas, usa `ChannelMonitorCard`
3. **Sidebar** – link para `/monitor`
4. **Página `/alerts`** – fetch nome/thumbnail para alertas channel, botão "Espiar" → `/monitor?channelId=X` ou modal
5. **Otimização** – API `channel-summary` se necessário (muitos canais, muitos requests)

---

## Métricas a Mostrar no ChannelMonitorCard

| Métrica | Fonte | Exibição |
|---------|-------|----------|
| Nome, thumbnail, subs | `channel` | Header |
| Total views 28d | `channel-analytics` (shorts.views + longForm.views) | Card |
| Shorts vs Long Form (views) | `channel-analytics` | Mini breakdown ou badges |
| Revenue estimado 28d | `channel-analytics` + `estimateRevenue()` | Valor com defaults |
| Vídeos recentes | `channel-videos` | Grid 4–6 vídeos |
| Viral score, duração | Por vídeo em `channel-videos` | No card de cada vídeo |

---

## Keyword Alerts (Fase Futura)

Para alertas `type=keyword`:

- Botão "Ver resultados" → pesquisa com a keyword
- Ou página `/monitor?keyword=X` com resultados da pesquisa
- Threshold (viral score) pode filtrar vídeos exibidos

Não incluído na primeira iteração; foco em channel spy.
