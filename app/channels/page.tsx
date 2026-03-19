'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import {
  ChannelFilterPanel,
  type ChannelSearchFilters,
} from '@/components/search/ChannelFilterPanel';
import { ChannelCard } from '@/components/channel/ChannelCard';
import { ChannelModal } from '@/components/channel/ChannelModal';
import { ChannelSortControls } from '@/components/channel/ChannelSortControls';
import { Spinner, ErrorMessage } from '@/components/ui';
import { mergeSearchWithChannels } from '@/lib/transform';
import { sortChannels, type ChannelSortKey } from '@/lib/sort-channels';
import { formatNumber } from '@/lib/format';
import { Tv } from 'lucide-react';
import type { ChannelWithStats } from '@/types/youtube';

const defaultFilters: ChannelSearchFilters = {
  order: 'relevance',
  regionCode: 'US',
};

/* ─── Stat pill ─────────────────────────────────────────── */
function StatPill({
  label,
  value,
  color = '#F0EEE8',
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <span
        className='text-[9px] uppercase tracking-[0.18em] text-[#3E3C38]'
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {label}
      </span>
      <span
        className='text-[14px] font-semibold leading-none'
        style={{ fontFamily: "'Syne', sans-serif", color }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Page content ──────────────────────────────────────── */
function ChannelsPageContent() {
  const [filters, setFilters] = useState<ChannelSearchFilters>(defaultFilters);
  const [channels, setChannels] = useState<ChannelWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelWithStats | null>(null);
  const [sortBy, setSortBy] = useState<ChannelSortKey>('subscribers');
  const searchParams = useSearchParams();

  const doSearch = useCallback(
    async (
      searchQuery: string,
      pageToken?: string,
      append = false,
      overrides?: Partial<ChannelSearchFilters>,
    ) => {
      setError('');
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const effectiveFilters = { ...filters, ...overrides };

      try {
        const params = new URLSearchParams({
          q: searchQuery,
          order: effectiveFilters.order,
          regionCode: effectiveFilters.regionCode,
          maxResults: '24',
        });
        if (pageToken) params.set('pageToken', pageToken);

        const res = await fetch(`/api/youtube/channels-search?${params}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Pesquisa falhou');

        const merged = mergeSearchWithChannels(
          data.search.items,
          data.channels.items,
        );

        if (append) setChannels((prev) => [...prev, ...merged]);
        else setChannels(merged);

        setNextPageToken(data.search.nextPageToken);
        setQuery(searchQuery);

        if (!append) {
          await fetch('/api/search-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: searchQuery,
              filters: effectiveFilters,
              results: merged.length,
            }),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao pesquisar canais');
        if (!append) setChannels([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    const q = searchParams.get('q')?.trim() || query;
    if (!q?.trim()) return;
    doSearch(q.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- query intentionally omitted
  }, [filters, searchParams, doSearch]);

  const handleLoadMore = () => {
    if (nextPageToken && query) doSearch(query, nextPageToken, true);
  };

  const sortedChannels = sortChannels(channels, sortBy);

  const totalSubs =
    channels.length > 0
      ? channels.reduce((sum, c) => sum + c.subscriberCount, 0)
      : 0;
  const totalViews =
    channels.length > 0
      ? channels.reduce((sum, c) => sum + c.viewCount, 0)
      : 0;
  const totalVideos =
    channels.length > 0
      ? channels.reduce((sum, c) => sum + c.videoCount, 0)
      : 0;
  const avgSubs = channels.length > 0 ? totalSubs / channels.length : 0;
  const avgViews = channels.length > 0 ? totalViews / channels.length : 0;
  const avgViewsPerSub =
    channels.length > 0
      ? channels.reduce(
          (sum, c) =>
            sum +
            (c.subscriberCount > 0 ? c.viewCount / c.subscriberCount : 0),
          0
        ) / channels.length
      : 0;
  const bigChannelsCount = channels.filter(
    (c) => c.subscriberCount >= 100000
  ).length;

  const hasResults = channels.length > 0 && !loading;

  return (
    <div className='flex flex-col gap-6'>
      {/* ── Hero search panel ── */}
      <div className='relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8'>
        <div className='pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,rgba(232,68,28,0.08)_0%,transparent_70%)]' />

        <div className='mb-5'>
          <h2
            className='mb-1 text-[22px] font-extrabold leading-tight tracking-tight text-[#F0EEE8] sm:text-[26px]'
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Pesquisa de <span className='text-[#E8441C]'>canais</span>
          </h2>
          <p
            className='text-[11px] text-[#4A4845]'
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Encontra canais por nome, nicho ou tema. Filtra por região e ordena
            por relevância, views ou número de vídeos
          </p>
        </div>

        <div className='flex flex-wrap gap-2.5'>
          <SearchBar
            onSearch={doSearch}
            loading={loading}
            placeholder='Ex: receitas, gaming, tech, fitness...'
            defaultValue={searchParams.get('q') || ''}
          />
          <ChannelFilterPanel filters={filters} onChange={setFilters} />
        </div>
      </div>

      {/* ── Error ── */}
      {error && <ErrorMessage message={error} />}

      {/* ── Loading ── */}
      {loading && (
        <div className='flex flex-col items-center justify-center gap-3 py-20'>
          <Spinner />
          <p
            className='text-[11px] text-[#4A4845]'
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            A pesquisar canais no YouTube...
          </p>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && channels.length === 0 && !error && (
        <div className='flex flex-col items-center justify-center gap-3 py-20'>
          <div className='flex size-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]'>
            <Tv className='size-5 text-[#3E3C38]' strokeWidth={1.5} />
          </div>
          <div className='text-center'>
            <p
              className='text-[14px] font-semibold text-[#8A8880]'
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Pronto para pesquisar canais
            </p>
            <p
              className='mt-0.5 text-[11px] text-[#3E3C38]'
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Insere um tema, nicho ou nome de canal e escolhe os filtros para
              encontrar canais relevantes
            </p>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {hasResults && (
        <>
          {/* Results header */}
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p
                className='text-[15px] font-semibold tracking-tight text-[#F0EEE8]'
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Resultados para{' '}
                <span className='text-[#4A9EE8]'>&quot;{query}&quot;</span>
              </p>
              <p
                className='mt-0.5 text-[10px] text-[#3E3C38]'
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {channels.length} canais encontrados
              </p>
            </div>
            <ChannelSortControls value={sortBy} onChange={setSortBy} />
          </div>

          {/* Stats bar */}
          <div className='flex flex-wrap gap-x-6 gap-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4'>
            <StatPill label='Total' value={`${channels.length} canais`} />
            <div className='w-px self-stretch bg-white/[0.04]' />
            <StatPill
              label='Subs médios'
              value={formatNumber(avgSubs)}
              color='#E8441C'
            />
            <StatPill
              label='Views médias'
              value={formatNumber(avgViews)}
              color='#4A9EE8'
            />
            <StatPill
              label='Views/Sub médio'
              value={avgViewsPerSub >= 1 ? `${formatNumber(avgViewsPerSub)}x` : avgViewsPerSub.toFixed(2)}
              color='#9B6EE8'
            />
            <div className='w-px self-stretch bg-white/[0.04]' />
            <StatPill
              label='≥100K subs'
              value={bigChannelsCount}
              color='#3DBF7F'
            />
            <StatPill
              label='Total subs'
              value={formatNumber(totalSubs)}
              color='#3DBF7F'
            />
            <StatPill
              label='Total views'
              value={formatNumber(totalViews)}
              color='#8A8880'
            />
            <StatPill
              label='Total vídeos'
              value={formatNumber(totalVideos)}
              color='#8A8880'
            />
          </div>

          {/* Grid */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {sortedChannels.map((ch) => (
              <ChannelCard
                key={ch.channelId}
                channelId={ch.channelId}
                name={ch.name}
                thumbnail={ch.thumbnail}
                subscriberCount={ch.subscriberCount}
                videoCount={ch.videoCount}
                viewCount={ch.viewCount}
                description={
                  ch.description
                    ? ch.description.slice(0, 120) + (ch.description.length > 120 ? '…' : '')
                    : undefined
                }
                channel={ch}
                onChannelOpen={setSelectedChannel}
              />
            ))}
          </div>

          {/* Load more */}
          {nextPageToken && (
            <div className='flex justify-center pt-2'>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className='group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-3 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04] disabled:opacity-40'
              >
                {loadingMore ? <Spinner className='size-4' /> : null}
                <span
                  className='text-[12px] font-medium text-[#8A8880] transition-colors group-hover:text-[#F0EEE8]'
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {loadingMore ? 'A carregar...' : 'Carregar mais'}
                </span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de detalhes do canal */}
      {selectedChannel && (
        <ChannelModal
          channel={selectedChannel}
          onClose={() => setSelectedChannel(null)}
        />
      )}
    </div>
  );
}

/* ─── Suspense wrapper ──────────────────────────────────── */
export default function ChannelsPage() {
  return (
    <Suspense
      fallback={
        <div className='flex flex-col items-center justify-center gap-3 py-20'>
          <Spinner />
          <p
            className='text-[11px] text-[#4A4845]'
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            A carregar...
          </p>
        </div>
      }
    >
      <ChannelsPageContent />
    </Suspense>
  );
}
