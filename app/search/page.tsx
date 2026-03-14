'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import {
  FilterPanel,
  type SearchFilters,
} from '@/components/search/FilterPanel';
import { DateFilter } from '@/components/search/DateFilter';
import { VideoGrid } from '@/components/video/VideoGrid';
import { VideoModal } from '@/components/video/VideoModal';
import { Spinner, ErrorMessage } from '@/components/ui';
import { SortControls } from '@/components/video/SortControls';
import { mergeSearchWithVideos } from '@/lib/transform';
import { isShort, getDurationSeconds, formatNumber } from '@/lib/format';
import { calcEngagementRate } from '@/lib/viral-score';
import { sortVideos, type VideoSortKey } from '@/lib/sort-videos';
import { SearchX } from 'lucide-react';
import type { VideoWithStats } from '@/types/youtube';

const defaultFilters: SearchFilters = {
  order: 'date',
  regionCode: 'PT',
  videoDuration: '',
  videoFormat: '',
  videoCategoryId: '',
  videoDefinition: '',
  videoCaption: '',
  publishedAfter: 'week',
};

function getPublishedAfter(dateFilter: string): string {
  if (!dateFilter) return '';
  const now = new Date();
  const map: Record<string, number> = {
    hour: 1 / 24,
    week: 7,
    month: 30,
    year: 365,
  };
  const days = map[dateFilter] || 7;
  return new Date(now.getTime() - days * 86400000).toISOString();
}

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
function SearchPageContent() {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [videos, setVideos] = useState<VideoWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoWithStats | null>(
    null,
  );
  const [sortBy, setSortBy] = useState<VideoSortKey>('recent');
  const searchParams = useSearchParams();

  const doSearch = useCallback(
    async (
      searchQuery: string,
      pageToken?: string,
      append = false,
      overrides?: Partial<SearchFilters>,
    ) => {
      setError('');
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const effectiveFilters = { ...filters, ...overrides };

      try {
        let apiVideoDuration = effectiveFilters.videoDuration;
        if (effectiveFilters.videoFormat === 'shorts') apiVideoDuration = 'short';
        else if (effectiveFilters.videoFormat === 'longform')
          apiVideoDuration = '';

        const params = new URLSearchParams({
          q: searchQuery,
          order: effectiveFilters.order,
          regionCode: effectiveFilters.regionCode,
          videoDuration: apiVideoDuration,
          maxResults: '24',
        });
        const publishedAfter = getPublishedAfter(effectiveFilters.publishedAfter);
        if (publishedAfter) params.set('publishedAfter', publishedAfter);
        if (effectiveFilters.videoCategoryId)
          params.set('videoCategoryId', effectiveFilters.videoCategoryId);
        if (effectiveFilters.videoDefinition)
          params.set('videoDefinition', effectiveFilters.videoDefinition);
        if (effectiveFilters.videoCaption)
          params.set('videoCaption', effectiveFilters.videoCaption);
        if (pageToken) params.set('pageToken', pageToken);

        const res = await fetch(`/api/youtube/search?${params}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Search failed');

        let merged = mergeSearchWithVideos(
          data.search.items,
          data.videos.items,
        );
        if (effectiveFilters.videoFormat === 'shorts')
          merged = merged.filter((v) => isShort(v.duration || '', v.title));
        else if (effectiveFilters.videoFormat === 'longform')
          merged = merged.filter(
            (v) => getDurationSeconds(v.duration || '') > 240,
          );

        if (append) setVideos((prev) => [...prev, ...merged]);
        else setVideos(merged);

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
        setError(err instanceof Error ? err.message : 'Erro ao pesquisar');
        if (!append) setVideos([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters],
  );

  // Refetch when filters change; also handles initial load from ?q= URL
  useEffect(() => {
    const q = searchParams.get('q')?.trim() || query;
    if (!q?.trim()) return;
    doSearch(q.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- query intentionally omitted to avoid refetch loop
  }, [filters, searchParams, doSearch]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (newFilters.order !== filters.order) {
      const orderToSort: Record<string, VideoSortKey> = {
        viewCount: 'views',
        date: 'recent',
      };
      const s = orderToSort[newFilters.order];
      if (s) setSortBy(s);
    }
  };

  const handleSortChange = (newSort: VideoSortKey) => {
    setSortBy(newSort);
    const q = searchParams.get('q')?.trim() || query;
    if (!q?.trim()) return;
    if (newSort === 'views') {
      setFilters((f) => ({ ...f, order: 'viewCount' }));
    } else if (newSort === 'recent') {
      setFilters((f) => ({ ...f, order: 'date' }));
    } else {
      // viral, likes, engagement: refetch with viewCount, then sort client-side
      doSearch(q, undefined, false, { order: 'viewCount' });
    }
  };

  const handleLoadMore = () => {
    if (nextPageToken && query) doSearch(query, nextPageToken, true);
  };

  const sortedVideos = sortVideos(videos, sortBy);

  const viralCount = videos.filter((v) => v.viralScore >= 70).length;
  const shortsCount = videos.filter((v) =>
    isShort(v.duration || '', v.title),
  ).length;
  const longFormCount = videos.filter(
    (v) => getDurationSeconds(v.duration || '') > 240,
  ).length;
  const avgEngagement =
    videos.length > 0
      ? videos.reduce(
          (sum, v) =>
            sum + calcEngagementRate(v.viewCount, v.likeCount, v.commentCount),
          0,
        ) / videos.length
      : 0;
  const avgViews =
    videos.length > 0
      ? videos.reduce((sum, v) => sum + v.viewCount, 0) / videos.length
      : 0;

  const hasResults = videos.length > 0 && !loading;

  return (
    <div className='flex flex-col gap-6'>
      {/* ── Hero search panel ── */}
      <div className='relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8'>
        {/* Ambient glow */}
        <div className='pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,rgba(232,68,28,0.08)_0%,transparent_70%)]' />

        <div className='mb-5'>
          <h2
            className='mb-1 text-[22px] font-extrabold leading-tight tracking-tight text-[#F0EEE8] sm:text-[26px]'
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Encontra vídeos <span className='text-[#E8441C]'>virais</span>
          </h2>
          <p
            className='text-[11px] text-[#4A4845]'
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Pesquisa avançada com métricas de viralidade, engagement e
            crescimento
          </p>
        </div>

        <div className='flex flex-wrap gap-2.5'>
          <SearchBar onSearch={doSearch} loading={loading} />
          <FilterPanel filters={filters} onChange={handleFiltersChange} />
        </div>

        <DateFilter
          value={filters.publishedAfter}
          onChange={(v) => setFilters((f) => ({ ...f, publishedAfter: v }))}
        />
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
            A pesquisar no YouTube...
          </p>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && videos.length === 0 && !error && (
        <div className='flex flex-col items-center justify-center gap-3 py-20'>
          <div className='flex size-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]'>
            <SearchX className='size-5 text-[#3E3C38]' strokeWidth={1.5} />
          </div>
          <div className='text-center'>
            <p
              className='text-[14px] font-semibold text-[#8A8880]'
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Pronto para pesquisar
            </p>
            <p
              className='mt-0.5 text-[11px] text-[#3E3C38]'
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Insere um tema e escolhe os filtros para encontrar vídeos virais
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
                {videos.length} vídeos · {viralCount} virais
              </p>
            </div>

            <SortControls value={sortBy} onChange={handleSortChange} />
          </div>

          {/* Stats bar */}
          <div className='flex flex-wrap gap-x-6 gap-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4'>
            <StatPill label='Total' value={`${videos.length} vídeos`} />
            <div className='w-px self-stretch bg-white/[0.04]' />
            <StatPill label='Virais ≥70' value={viralCount} color='#E8441C' />
            <div className='w-px self-stretch bg-white/[0.04]' />
            <StatPill label='Shorts' value={shortsCount} color='#9B6EE8' />
            <StatPill label='Long Form' value={longFormCount} color='#4A9EE8' />
            <div className='w-px self-stretch bg-white/[0.04]' />
            <StatPill
              label='Engagement médio'
              value={`${avgEngagement.toFixed(2)}%`}
              color='#3DBF7F'
            />
            <StatPill
              label='Views médias'
              value={formatNumber(avgViews)}
              color='#4A9EE8'
            />
          </div>

          {/* Grid */}
          <VideoGrid videos={sortedVideos} onVideoOpen={setSelectedVideo} />

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

      {/* Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}

/* ─── Suspense wrapper ──────────────────────────────────── */
export default function SearchPage() {
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
      <SearchPageContent />
    </Suspense>
  );
}
