"use client";

import { useState, useEffect, useMemo } from "react";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
import { SortControls } from "@/components/video/SortControls";
import { Spinner, EmptyState, ErrorMessage } from "@/components/ui";
import { PageHeader } from "@/components/ui";
import { sectionTitle } from "@/lib/design-tokens";
import { calcViralScore } from "@/lib/viral-score";
import { parseDuration, isShort, getDurationSeconds } from "@/lib/format";
import { sortVideos, type VideoSortKey } from "@/lib/sort-videos";
import type { VideoWithStats } from "@/types/youtube";
import type { YouTubeVideoItem } from "@/types/youtube";

// PT, BR, US, GB são suportados pelo chart mostPopular da YouTube API
// AO e MZ não são suportados para trending
const COUNTRIES = [
  { code: "PT", flag: "🇵🇹", name: "Portugal" },
  { code: "BR", flag: "🇧🇷", name: "Brasil" },
  { code: "US", flag: "🇺🇸", name: "USA" },
  { code: "GB", flag: "🇬🇧", name: "UK" },
];

const CATEGORIES = [
  { id: "0", name: "Todos" },
  { id: "10", name: "Música" },
  { id: "20", name: "Gaming" },
  { id: "22", name: "People" },
  { id: "23", name: "Comédia" },
  { id: "24", name: "Entretenimento" },
  { id: "25", name: "Notícias" },
  { id: "28", name: "Tecnologia" },
];

function transformVideo(v: YouTubeVideoItem): VideoWithStats {
  const stats = v.statistics;
  const viewCount = parseInt(stats?.viewCount || "0", 10);
  const likeCount = parseInt(stats?.likeCount || "0", 10);
  const commentCount = parseInt(stats?.commentCount || "0", 10);
  const publishedAt = v.snippet?.publishedAt || "";
  return {
    id: v.id,
    videoId: v.id,
    title: v.snippet?.title || "",
    channelTitle: v.snippet?.channelTitle || "",
    channelId: v.snippet?.channelId || "",
    publishedAt,
    thumbnail:
      v.snippet?.thumbnails?.medium?.url ||
      v.snippet?.thumbnails?.high?.url ||
      v.snippet?.thumbnails?.default?.url ||
      "",
    viewCount,
    likeCount,
    commentCount,
    duration: v.contentDetails?.duration,
    viralScore: calcViralScore(viewCount, likeCount, commentCount, publishedAt),
    tags: v.snippet?.tags,
    categoryId: v.snippet?.categoryId,
    definition: v.contentDetails?.definition,
    caption: v.contentDetails?.caption,
    liveBroadcastContent: v.snippet?.liveBroadcastContent,
  };
}

export default function TrendingPage() {
  const [country, setCountry] = useState("PT");
  const [category, setCategory] = useState("0");
  const [videos, setVideos] = useState<VideoWithStats[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoWithStats | null>(null);
  const [formatFilter, setFormatFilter] = useState<"all" | "shorts" | "longform">("all");
  const [sortBy, setSortBy] = useState<VideoSortKey>("views");

  useEffect(() => {
    setLoading(true);
    setError("");
    setNextPageToken(undefined);
    fetch(
      `/api/youtube/trending?regionCode=${country}&videoCategoryId=${category}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const items = (data.items || []).map(transformVideo);
        setVideos(items);
        setNextPageToken(data.nextPageToken);
      })
      .catch((err) => {
        setError(err.message);
        setVideos([]);
      })
      .finally(() => setLoading(false));
  }, [country, category]);

  const loadMore = async () => {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/youtube/trending?regionCode=${country}&videoCategoryId=${category}&pageToken=${encodeURIComponent(nextPageToken)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const items = (data.items || []).map(transformVideo);
      setVideos((prev) => [...prev, ...items]);
      setNextPageToken(data.nextPageToken);
    } catch {
      // Silently fail
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredVideos =
    formatFilter === "shorts"
      ? videos.filter((v) => isShort(v.duration || "", v.title))
      : formatFilter === "longform"
        ? videos.filter((v) => getDurationSeconds(v.duration || "") > 240)
        : videos;

  const sortedVideos = useMemo(
    () => sortVideos(filteredVideos, sortBy),
    [filteredVideos, sortBy]
  );

  return (
    <div>
      <PageHeader
        title="🔥 Trending Agora"
        description="Vídeos em alta por país — actualizado em tempo real"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
        {COUNTRIES.map((c) => (
          <button
            key={c.code}
            onClick={() => setCountry(c.code)}
            className={`p-3 rounded-xl text-center transition-all border ${
              country === c.code
                ? "bg-[rgba(255,61,61,0.1)] border-[var(--accent)]"
                : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--border2)]"
            }`}
          >
            <span className="text-2xl block mb-1">{c.flag}</span>
            <span className={`text-[11px] font-mono ${country === c.code ? "text-[var(--accent)]" : "text-[var(--text2)]"}`}>
              {c.name}
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-1 flex-wrap mb-5 p-1.5 bg-[var(--card)] rounded-xl border border-[var(--border)] w-fit">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-4 py-2 text-sm rounded-lg transition-all font-semibold ${
              category === c.id
                ? "bg-[var(--card2)] text-[var(--text)] shadow-sm"
                : "text-[var(--text2)] hover:text-[var(--text)]"
            }`}
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="flex gap-1 p-1 bg-[var(--card)] rounded-lg border border-[var(--border)]">
          {(["all", "shorts", "longform"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormatFilter(f)}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                formatFilter === f
                  ? "bg-[var(--card2)] text-[var(--text)]"
                  : "text-[var(--text3)] hover:text-[var(--text)]"
              }`}
            >
              {f === "all" ? "Todos" : f === "shorts" ? "⚡ Shorts" : "📺 Long Form"}
            </button>
          ))}
        </div>
        {!loading && filteredVideos.length > 0 && (
          <SortControls value={sortBy} onChange={setSortBy} />
        )}
      </div>

      {error && <ErrorMessage message={error} className="mb-5" />}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <Spinner className="mb-4" />
          <p className="font-mono text-sm">A carregar trending...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <EmptyState
          icon="📭"
          title="Sem trending disponível"
        />
      ) : (
        <>
          <div className="mb-4">
            <div className={sectionTitle}>
              Trending em {country}
            </div>
            <div className="text-[11px] text-[var(--text3)] font-mono">
              {filteredVideos.length} vídeos em alta
            </div>
          </div>
          <VideoGrid videos={sortedVideos} onVideoOpen={setSelectedVideo} />
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
