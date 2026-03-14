"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/search/SearchBar";
import { FilterPanel, type SearchFilters } from "@/components/search/FilterPanel";
import { DateFilter } from "@/components/search/DateFilter";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
import { Spinner, EmptyState, ErrorMessage } from "@/components/ui";
import { sectionTitle } from "@/lib/design-tokens";
import { mergeSearchWithVideos } from "@/lib/transform";
import type { VideoWithStats } from "@/types/youtube";

const defaultFilters: SearchFilters = {
  order: "relevance",
  regionCode: "PT",
  videoDuration: "",
  publishedAfter: "week",
};

function getPublishedAfter(dateFilter: string): string {
  if (!dateFilter) return "";
  const now = new Date();
  const map: Record<string, number> = {
    hour: 1 / 24,
    week: 7,
    month: 30,
    year: 365,
  };
  const days = map[dateFilter] || 7;
  const d = new Date(now.getTime() - days * 86400000);
  return d.toISOString();
}

function SearchPageContent() {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [videos, setVideos] = useState<VideoWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoWithStats | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "viral">("default");
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q?.trim()) {
      doSearch(q.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSearch = useCallback(
    async (searchQuery: string, pageToken?: string, append = false) => {
      setError("");
      if (!append) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          q: searchQuery,
          order: filters.order,
          regionCode: filters.regionCode,
          videoDuration: filters.videoDuration,
          maxResults: "24",
        });
        const publishedAfter = getPublishedAfter(filters.publishedAfter);
        if (publishedAfter) params.set("publishedAfter", publishedAfter);
        if (pageToken) params.set("pageToken", pageToken);

        const res = await fetch(`/api/youtube/search?${params}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Search failed");

        const merged = mergeSearchWithVideos(data.search.items, data.videos.items);

        if (append) {
          setVideos((prev) => [...prev, ...merged]);
        } else {
          setVideos(merged);
        }
        setNextPageToken(data.search.nextPageToken);
        setQuery(searchQuery);

        if (!append) {
          await fetch("/api/search-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: searchQuery,
              filters,
              results: merged.length,
            }),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao pesquisar");
        if (!append) setVideos([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters]
  );

  const handleSearch = (q: string) => {
    doSearch(q);
  };

  const handleLoadMore = () => {
    if (nextPageToken && query) doSearch(query, nextPageToken, true);
  };

  const sortedVideos =
    sortBy === "viral"
      ? [...videos].sort((a, b) => b.viralScore - a.viralScore)
      : videos;

  return (
    <div>
      <div
        className="bg-gradient-to-br from-[var(--card)] to-[var(--card2)] border border-[var(--border)] rounded-2xl p-8 mb-7 relative overflow-hidden"
      >
        <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(255,61,61,0.1)_0%,transparent_70%)] pointer-events-none" />
        <h2 className="text-xl sm:text-2xl font-extrabold mb-1.5 font-display">
          Encontra vídeos <span className="text-[var(--accent)]">virais</span>
        </h2>
        <p className="text-[var(--text2)] text-sm mb-5">
          Pesquisa avançada com métricas de viralidade, engagement e crescimento
        </p>
        <div className="flex flex-wrap gap-2.5">
          <SearchBar onSearch={handleSearch} loading={loading} />
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>
        <DateFilter
          value={filters.publishedAfter}
          onChange={(v) => setFilters((f) => ({ ...f, publishedAfter: v }))}
        />
      </div>

      {error && (
        <ErrorMessage message={error} className="mb-5" />
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <Spinner className="mb-4" />
          <p className="font-mono text-sm">A pesquisar no YouTube...</p>
        </div>
      ) : videos.length === 0 && !loading ? (
        <EmptyState
          icon="🔍"
          title="Pronto para pesquisar"
          description="Insere um tema e escolhe os filtros para encontrar vídeos virais"
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className={sectionTitle}>
                Resultados para &quot;<span className="text-[var(--blue2)]">{query}</span>&quot;
              </h3>
              <p className="text-[11px] text-[var(--text3)] font-mono">
                {videos.length} vídeos · {videos.filter((v) => v.viralScore >= 70).length} virais
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy(sortBy === "viral" ? "default" : "viral")}
                className="px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text2)] hover:border-[var(--blue)] hover:text-[var(--blue)] transition-colors"
              >
                {sortBy === "viral" ? "Ordenar: Viral ↑" : "Ordenar: Viral"}
              </button>
            </div>
          </div>
          <VideoGrid videos={sortedVideos} onVideoOpen={setSelectedVideo} />
          {nextPageToken && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-[var(--card2)] border border-[var(--border2)] text-[var(--text)] text-sm font-semibold rounded-xl hover:bg-[var(--border)] transition-colors duration-200 disabled:opacity-50 font-display"
              >
                {loadingMore ? "A carregar..." : "Carregar mais"}
              </button>
            </div>
          )}
        </>
      )}

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center py-16"><Spinner className="mb-4" /><p className="text-[var(--text3)]">A carregar...</p></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
