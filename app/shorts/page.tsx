"use client";

import { useState } from "react";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
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
      <h2 className="text-[22px] font-extrabold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        ⚡ Shorts Virais
      </h2>
      <p className="text-[13px] text-[var(--text2)] mb-6">
        Os shorts com maior taxa de viralidade
      </p>

      <div className="bg-gradient-to-br from-[var(--card)] to-[var(--card2)] border border-[var(--border)] rounded-2xl p-8 mb-7">
        <div className="flex gap-2.5 flex-wrap">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Tema dos shorts que queres encontrar..."
            className="flex-1 min-w-[200px] bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-4 py-3 rounded-xl"
          />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-4 py-3 rounded-xl"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-[var(--accent)] text-white font-bold rounded-xl hover:bg-[#ff5555] disabled:opacity-50"
          >
            ⚡ Buscar Shorts
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-xl bg-[rgba(255,61,61,0.08)] border border-[rgba(255,61,61,0.3)] text-sm">
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-[var(--text3)]">
          <div className="w-9 h-9 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-sm">A procurar Shorts virais...</p>
        </div>
      ) : videos.length === 0 && !loading ? (
        <div className="text-center py-20 text-[var(--text3)]">
          <div className="text-5xl mb-4 opacity-30">⚡</div>
          <p className="font-semibold text-base text-[var(--text2)]">Sem shorts encontrados</p>
        </div>
      ) : (
        <VideoGrid videos={videos} onVideoOpen={setSelectedVideo} />
      )}

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
}
