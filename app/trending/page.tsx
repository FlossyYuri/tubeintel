"use client";

import { useState, useEffect } from "react";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
import { calcViralScore } from "@/lib/viral-score";
import { parseDuration, isShort } from "@/lib/format";
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
  };
}

export default function TrendingPage() {
  const [country, setCountry] = useState("PT");
  const [category, setCategory] = useState("0");
  const [videos, setVideos] = useState<VideoWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoWithStats | null>(null);
  const [shortsOnly, setShortsOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(
      `/api/youtube/trending?regionCode=${country}&videoCategoryId=${category}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const items = (data.items || []).map(transformVideo);
        setVideos(items);
      })
      .catch((err) => {
        setError(err.message);
        setVideos([]);
      })
      .finally(() => setLoading(false));
  }, [country, category]);

  const filteredVideos = shortsOnly
    ? videos.filter((v) => isShort(v.duration || "", v.title))
    : videos;

  return (
    <div>
      <h2 className="text-[22px] font-extrabold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        🔥 Trending Agora
      </h2>
      <p className="text-[13px] text-[var(--text2)] mb-6">
        Vídeos em alta por país — actualizado em tempo real
      </p>

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

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShortsOnly(!shortsOnly)}
          className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors ${
            shortsOnly
              ? "bg-[rgba(176,109,255,0.15)] border-[var(--purple)] text-[var(--purple)]"
              : "border-[var(--border)] text-[var(--text2)] hover:border-[var(--purple)]"
          }`}
        >
          ⚡ Shorts apenas
        </button>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-xl bg-[rgba(255,61,61,0.08)] border border-[rgba(255,61,61,0.3)] text-sm text-[var(--text2)]">
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-[var(--text3)]">
          <div className="w-9 h-9 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-sm">A carregar trending...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-20 text-[var(--text3)]">
          <div className="text-5xl mb-4 opacity-30">📭</div>
          <p className="font-semibold text-base text-[var(--text2)]">Sem trending disponível</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="text-[15px] font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
              Trending em {country}
            </div>
            <div className="text-[11px] text-[var(--text3)] font-mono">
              {filteredVideos.length} vídeos em alta
            </div>
          </div>
          <VideoGrid videos={filteredVideos} onVideoOpen={setSelectedVideo} />
        </>
      )}

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
}
