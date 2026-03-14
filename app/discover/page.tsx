"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
import { SortControls } from "@/components/video/SortControls";
import { PageHeader, Spinner, EmptyState, ErrorMessage } from "@/components/ui";
import { sectionTitle } from "@/lib/design-tokens";
import { input } from "@/lib/design-tokens";
import type { VideoSortKey } from "@/lib/sort-videos";
import { cn } from "@/lib/utils";
import type { VideoWithStats } from "@/types/youtube";
import type { VideoWithOutperformance } from "@/app/api/youtube/outperformers/route";

const REGIONS = [
  { value: "PT", label: "🇵🇹 PT" },
  { value: "BR", label: "🇧🇷 BR" },
  { value: "US", label: "🇺🇸 US" },
  { value: "GB", label: "🇬🇧 UK" },
];

const CATEGORIES = [
  { value: "", label: "Todas" },
  { value: "10", label: "Música" },
  { value: "20", label: "Gaming" },
  { value: "23", label: "Comédia" },
  { value: "24", label: "Entretenimento" },
  { value: "25", label: "Notícias" },
  { value: "28", label: "Tecnologia" },
];

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
  const [region, setRegion] = useState("PT");
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
          <div className="flex flex-wrap gap-2.5 items-center">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={cn(input, "cursor-pointer")}
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={cn(input, "cursor-pointer")}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value || "all"} value={c.value}>{c.label}</option>
              ))}
            </select>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={cn(input, "cursor-pointer")}
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <span className="text-[var(--text3)] text-sm">Mín. </span>
            <select
              value={minMultiplier}
              onChange={(e) => setMinMultiplier(e.target.value)}
              className={cn(input, "cursor-pointer")}
            >
              {MULTIPLIERS.map((m) => (
                <option key={m.value} value={m.value}>{m.label} média</option>
              ))}
            </select>
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
