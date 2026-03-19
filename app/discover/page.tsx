"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
import { SortControls } from "@/components/video/SortControls";
import { PageHeader, Spinner, EmptyState, ErrorMessage, FilterSelect } from "@/components/ui";
import { sectionTitle } from "@/lib/design-tokens";
import type { VideoSortKey } from "@/lib/sort-videos";
import { YOUTUBE_CATEGORY_OPTIONS } from "@/lib/categories";
import { SELECT_REGIONS } from "@/lib/regions";
import type { VideoWithStats } from "@/types/youtube";
import type { VideoWithOutperformance } from "@/app/api/youtube/outperformers/route";

const PERIODS = [
  { value: "week", label: "7 dias" },
  { value: "month", label: "30 dias" },
  { value: "year", label: "1 ano" },
];

const MULTIPLIERS = [
  { value: "1.5", label: "1.5x" },
  { value: "2", label: "2x" },
  { value: "3", label: "3x" },
  { value: "5", label: "5x" },
];

const SORT_TO_API_ORDER: Record<VideoSortKey, string> = {
  ratio: "ratio",
  views: "viewCount",
  recent: "date",
  viral: "viralScore",
  likes: "likeCount",
  engagement: "engagement",
};

export default function DiscoverPage() {
  const [keyword, setKeyword] = useState("viral");
  const [searchKeyword, setSearchKeyword] = useState("viral");
  const [region, setRegion] = useState("US");
  const [category, setCategory] = useState("");
  const [period, setPeriod] = useState("week");
  const [minMultiplier, setMinMultiplier] = useState("2");
  const [videos, setVideos] = useState<VideoWithOutperformance[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoWithStats | null>(null);
  const [sortBy, setSortBy] = useState<VideoSortKey>("ratio");

  useEffect(() => {
    setLoading(true);
    setError("");
    setNextPageToken(undefined);
    const params = new URLSearchParams({
      keyword: searchKeyword,
      regionCode: region,
      publishedAfter: period,
      minMultiplier,
      maxResults: "24",
      order: SORT_TO_API_ORDER[sortBy] || "ratio",
    });
    if (category) params.set("videoCategoryId", category);

    fetch(`/api/youtube/outperformers?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setVideos(data.videos || []);
        setNextPageToken(data.nextPageToken);
      })
      .catch((err) => {
        setError(err.message);
        setVideos([]);
      })
      .finally(() => setLoading(false));
  }, [searchKeyword, region, category, period, minMultiplier, sortBy]);

  const loadMore = async () => {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        keyword: searchKeyword,
        regionCode: region,
        publishedAfter: period,
        minMultiplier,
        maxResults: "24",
        pageToken: nextPageToken,
        order: SORT_TO_API_ORDER[sortBy] || "ratio",
      });
      if (category) params.set("videoCategoryId", category);
      const res = await fetch(`/api/youtube/outperformers?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVideos((prev) => [...prev, ...(data.videos || [])]);
      setNextPageToken(data.nextPageToken);
    } catch {
      // Silently fail
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (q: string) => {
    setSearchKeyword(q.trim() || "viral");
  };

  return (
    <div>
      <PageHeader
        title="🚀 Discover Outperformers"
        description="Vídeos que superaram a média do seu canal"
      />

      <div className="bg-gradient-to-br from-[var(--card)] to-[var(--card2)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 mb-7">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2.5">
            <SearchBar
              onSearch={handleSearch}
              loading={loading}
              placeholder="Nicho ou keyword (ex: viral, receitas...)"
            />
          </div>
          <div className="flex flex-wrap gap-2.5 items-end">
            <FilterSelect
              label="Região"
              value={region}
              onChange={setRegion}
              options={SELECT_REGIONS}
            />
            <FilterSelect
              label="Categoria"
              value={category}
              onChange={setCategory}
              options={YOUTUBE_CATEGORY_OPTIONS}
            />
            <FilterSelect
              label="Período"
              value={period}
              onChange={setPeriod}
              options={PERIODS}
            />
            <FilterSelect
              label="Mín. multiplicador"
              value={minMultiplier}
              onChange={setMinMultiplier}
              options={MULTIPLIERS.map((m) => ({
                value: m.value,
                label: `${m.label} média`,
              }))}
            />
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} className="mb-5" />}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <Spinner className="mb-4" />
          <p className="font-mono text-sm">A procurar vídeos que superaram...</p>
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          icon="📭"
          title="Sem resultados"
          description="Tenta outra keyword ou reduz o multiplicador mínimo"
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className={sectionTitle}>
                {videos.length} vídeos superaram a média do canal
              </div>
              <p className="text-[11px] text-[var(--text3)] font-mono mt-1">
                {sortBy === "ratio"
                  ? "Ordenados por ratio (views / média do canal)"
                  : `Ordenados por ${sortBy}`}
              </p>
            </div>
            <SortControls
              value={sortBy}
              onChange={setSortBy}
              options={["ratio", "views", "recent", "viral", "likes", "engagement"]}
            />
          </div>
          <VideoGrid
            videos={videos}
            onVideoOpen={setSelectedVideo}
            getVideoCardProps={(v) => {
              const ov = v as VideoWithOutperformance;
              return { outperformanceRatio: ov.outperformanceRatio };
            }}
          />
          {nextPageToken && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
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
