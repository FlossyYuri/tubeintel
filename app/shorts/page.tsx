"use client";

import { useState } from "react";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
import { PageHeader, Spinner, EmptyState, ErrorMessage } from "@/components/ui";
import { input, buttonPrimary } from "@/lib/design-tokens";
import { mergeSearchWithVideos } from "@/lib/transform";
import type { VideoWithStats } from "@/types/youtube";

const REGIONS = [
  { value: "PT", label: "🇵🇹 PT" },
  { value: "BR", label: "🇧🇷 BR" },
  { value: "US", label: "🇺🇸 US" },
  { value: "GB", label: "🇬🇧 UK" },
];

export default function ShortsPage() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("PT");
  const [videos, setVideos] = useState<VideoWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoWithStats | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setError("");
    setLoading(true);
    try {
      const publishedAfter = new Date(Date.now() - 14 * 86400000).toISOString();
      const params = new URLSearchParams({
        q: query + " #shorts",
        type: "video",
        videoDuration: "short",
        order: "viewCount",
        regionCode: region,
        maxResults: "24",
        publishedAfter,
      });
      const res = await fetch(`/api/youtube/search?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      const merged = mergeSearchWithVideos(data.search?.items || [], data.videos?.items || []);
      setVideos(merged.filter((v) => (v.duration && v.duration.match(/PT(\d+)S/) && parseInt(v.duration.match(/PT(\d+)S/)?.[1] || "0", 10) <= 60) || v.title.toLowerCase().includes("short")));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="⚡ Shorts Virais"
        description="Os shorts com maior taxa de viralidade"
      />

      <div className="bg-gradient-to-br from-[var(--card)] to-[var(--card2)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 mb-7">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-wrap">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Tema dos shorts que queres encontrar..."
            className={input}
          />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className={input}
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            disabled={loading}
            className={buttonPrimary}
          >
            ⚡ Buscar Shorts
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} className="mb-5" />}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <Spinner className="mb-4" />
          <p className="font-mono text-sm">A procurar Shorts virais...</p>
        </div>
      ) : videos.length === 0 && !loading ? (
        <EmptyState icon="⚡" title="Sem shorts encontrados" />
      ) : (
        <VideoGrid videos={videos} onVideoOpen={setSelectedVideo} />
      )}

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
}
