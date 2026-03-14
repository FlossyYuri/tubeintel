"use client";

import { useState, useEffect, useCallback } from "react";
import { StudyVideoGrid } from "@/components/video/StudyVideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
import { PageHeader, Spinner, EmptyState, ErrorMessage } from "@/components/ui";
import { mergeSearchWithVideos } from "@/lib/transform";
import { calcViralScore } from "@/lib/viral-score";
import { isShort, getDurationSeconds } from "@/lib/format";
import type { VideoWithStats } from "@/types/youtube";
import type { YouTubeVideoItem } from "@/types/youtube";
import type { StudyMode, StudyFormat } from "@/components/video/StudyVideoCard";

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

const STUDY_MODES: { value: StudyMode; format: StudyFormat; label: string }[] = [
  { value: "titles", format: "longform", label: "Títulos Long Form" },
  { value: "thumbnails", format: "longform", label: "Thumbnails Long Form" },
  { value: "thumbnails", format: "shorts", label: "Thumbnails Shorts" },
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

export default function StudyPage() {
  const [region, setRegion] = useState("PT");
  const [category, setCategory] = useState("0");
  const [studyModeIndex, setStudyModeIndex] = useState(0);
  const [videos, setVideos] = useState<VideoWithStats[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoWithStats | null>(null);

  const { value: mode, format } = STUDY_MODES[studyModeIndex];
  const isShorts = format === "shorts";

  const fetchVideos = useCallback(
    async (pageToken?: string, append = false) => {
      if (!append) {
        setError("");
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        if (isShorts) {
          const params = new URLSearchParams({
            q: "#shorts",
            videoDuration: "short",
            order: "viewCount",
            regionCode: region,
            maxResults: "24",
            publishedAfter: new Date(
              Date.now() - 14 * 86400000,
            ).toISOString(),
          });
          if (pageToken) params.set("pageToken", pageToken);
          if (category !== "0") params.set("videoCategoryId", category);

          const res = await fetch(`/api/youtube/search?${params}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Search failed");

          const merged = mergeSearchWithVideos(
            data.search?.items || [],
            data.videos?.items || [],
          );
          const filtered = merged.filter((v) =>
            isShort(v.duration || "", v.title),
          );

          if (append) {
            setVideos((prev) => [...prev, ...filtered]);
          } else {
            setVideos(filtered);
          }
          setNextPageToken(data.search?.nextPageToken);
        } else {
          const params = new URLSearchParams({
            regionCode: region,
            videoCategoryId: category,
          });
          if (pageToken) params.set("pageToken", pageToken);

          const res = await fetch(`/api/youtube/trending?${params}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Trending failed");

          const items = (data.items || []).map(transformVideo);
          const filtered = items.filter(
            (v) => getDurationSeconds(v.duration || "") > 240,
          );

          if (append) {
            setVideos((prev) => [...prev, ...filtered]);
          } else {
            setVideos(filtered);
          }
          setNextPageToken(data.nextPageToken);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar vídeos",
        );
        if (!append) setVideos([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [region, category, isShorts],
  );

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const loadMore = () => {
    if (nextPageToken && !loadingMore) fetchVideos(nextPageToken, true);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Estudo Viral"
        description="Analisa títulos e thumbnails de vídeos com muitas views"
      />

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,rgba(232,68,28,0.08)_0%,transparent_70%)]" />

        <div className="mb-4">
          <p
            className="mb-2 text-[9px] uppercase tracking-[0.18em] text-[#3E3C38]"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Modo de estudo
          </p>
          <div className="flex flex-wrap gap-2">
            {STUDY_MODES.map((opt, i) => (
              <button
                key={`${opt.value}-${opt.format}`}
                onClick={() => setStudyModeIndex(i)}
                className={`rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition-all ${
                  studyModeIndex === i
                    ? "border-[rgba(232,68,28,0.4)] bg-[rgba(232,68,28,0.12)] text-[#F0EEE8]"
                    : "border-white/[0.06] bg-white/[0.02] text-[#8A8880] hover:border-white/[0.1] hover:text-[#F0EEE8]"
                }`}
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p
            className="mb-2 text-[9px] uppercase tracking-[0.18em] text-[#3E3C38]"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Região
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setRegion(c.code)}
                className={`rounded-xl border p-3 text-center transition-all ${
                  region === c.code
                    ? "border-[rgba(232,68,28,0.4)] bg-[rgba(232,68,28,0.08)]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
                }`}
              >
                <span className="text-2xl block mb-1">{c.flag}</span>
                <span
                  className={`text-[11px] font-mono ${
                    region === c.code ? "text-[#E8441C]" : "text-[#8A8880]"
                  }`}
                >
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p
            className="mb-2 text-[9px] uppercase tracking-[0.18em] text-[#3E3C38]"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Categoria
          </p>
          <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] w-fit">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`rounded-lg px-3 py-2 text-[12px] font-semibold transition-all ${
                  category === c.id
                    ? "bg-white/[0.08] text-[#F0EEE8]"
                    : "text-[#8A8880] hover:text-[#F0EEE8]"
                }`}
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Spinner />
          <p
            className="text-[11px] text-[#4A4845]"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            A carregar vídeos virais...
          </p>
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          icon="📚"
          title="Sem vídeos encontrados"
        />
      ) : (
        <>
          <p
            className="text-[11px] text-[#4A4845]"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {videos.length} vídeos · duração visível em todos
          </p>
          <StudyVideoGrid
            videos={videos}
            mode={mode}
            format={format}
            onVideoOpen={setSelectedVideo}
          />
          {nextPageToken && (
            <div className="flex justify-center pt-2">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-3 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04] disabled:opacity-40"
              >
                {loadingMore ? <Spinner className="size-4" /> : null}
                <span
                  className="text-[12px] font-medium text-[#8A8880] transition-colors group-hover:text-[#F0EEE8]"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {loadingMore ? "A carregar..." : "Carregar mais"}
                </span>
              </button>
            </div>
          )}
        </>
      )}

      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}
