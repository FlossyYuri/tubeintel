"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
import { PageHeader, Spinner, EmptyState, ErrorMessage, FilterSelect } from "@/components/ui";
import { sectionTitle } from "@/lib/design-tokens";
import { input } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { YOUTUBE_CATEGORY_OPTIONS } from "@/lib/categories";
import { TRENDING_SELECT_REGIONS } from "@/lib/regions";
import { calcViralScore } from "@/lib/viral-score";
import { isShort, getDurationSeconds } from "@/lib/format";
import { useUrlState } from "@/hooks/useUrlState";
import { RANKINGS_SCHEMA, RANKINGS_DEFAULTS } from "@/lib/url-params";
import type { VideoWithStats } from "@/types/youtube";
import type { YouTubeVideoItem } from "@/types/youtube";

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

type Tab = "videos" | "channels";

function RankingsPageContent() {
  const [urlState, updateParams] = useUrlState(RANKINGS_SCHEMA, RANKINGS_DEFAULTS);
  const { tab, region, category, keyword: searchKeyword, format: formatFilter } = urlState;
  const [keyword, setKeyword] = useState(searchKeyword);
  const [videos, setVideos] = useState<VideoWithStats[]>([]);
  const [videosNextToken, setVideosNextToken] = useState<string | undefined>();
  const [videosLoadingMore, setVideosLoadingMore] = useState(false);
  const [channels, setChannels] = useState<
    Array<{
      channelId: string;
      name: string;
      thumbnail: string;
      subscriberCount: number;
      viewCount: number;
      videoCount: number;
      risingScore: number;
    }>
  >([]);
  const [channelsNextToken, setChannelsNextToken] = useState<string | undefined>();
  const [channelsLoadingMore, setChannelsLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoWithStats | null>(null);

  useEffect(() => {
    setKeyword(searchKeyword);
  }, [searchKeyword]);

  useEffect(() => {
    if (tab === "videos") {
      setLoading(true);
      setError("");
      setVideosNextToken(undefined);
      fetch(
        `/api/youtube/trending?regionCode=${region}&videoCategoryId=${category}`
      )
        .then((r) => r.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          const items = (data.items || []).map(transformVideo);
          setVideos(items);
          setVideosNextToken(data.nextPageToken);
        })
        .catch((err) => {
          setError(err.message);
          setVideos([]);
        })
        .finally(() => setLoading(false));
    }
  }, [tab, region, category]);

  useEffect(() => {
    if (tab === "channels") {
      setLoading(true);
      setError("");
      setChannelsNextToken(undefined);
      fetch(
        `/api/youtube/rising?keyword=${encodeURIComponent(searchKeyword)}&regionCode=${region}`
      )
        .then((r) => r.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setChannels(data.channels || []);
          setChannelsNextToken(data.nextPageToken);
        })
        .catch((err) => {
          setError(err.message);
          setChannels([]);
        })
        .finally(() => setLoading(false));
    }
  }, [tab, searchKeyword, region]);

  const loadMoreVideos = async () => {
    if (!videosNextToken || videosLoadingMore) return;
    setVideosLoadingMore(true);
    try {
      const res = await fetch(
        `/api/youtube/trending?regionCode=${region}&videoCategoryId=${category}&pageToken=${encodeURIComponent(videosNextToken)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const items = (data.items || []).map(transformVideo);
      setVideos((prev) => [...prev, ...items]);
      setVideosNextToken(data.nextPageToken);
    } catch {
      // Silently fail
    } finally {
      setVideosLoadingMore(false);
    }
  };

  const loadMoreChannels = async () => {
    if (!channelsNextToken || channelsLoadingMore) return;
    setChannelsLoadingMore(true);
    try {
      const res = await fetch(
        `/api/youtube/rising?keyword=${encodeURIComponent(searchKeyword)}&regionCode=${region}&pageToken=${encodeURIComponent(channelsNextToken)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChannels((prev) => [...prev, ...(data.channels || [])]);
      setChannelsNextToken(data.nextPageToken);
    } catch {
      // Silently fail
    } finally {
      setChannelsLoadingMore(false);
    }
  };

  const filteredVideos =
    tab === "videos" && formatFilter === "shorts"
      ? videos.filter((v) => isShort(v.duration || "", v.title))
      : tab === "videos" && formatFilter === "longform"
        ? videos.filter((v) => getDurationSeconds(v.duration || "") > 240)
        : videos;

  return (
    <div>
      <PageHeader
        title="🏆 Rankings"
        description="Top vídeos e top canais com filtros"
      />

      <div className="flex gap-1 mb-6 p-1.5 bg-[var(--card)] rounded-xl border border-[var(--border)] w-fit">
        <button
          onClick={() => updateParams({ tab: "videos" })}
          className={cn(
            "px-4 py-2 text-sm rounded-lg transition-all font-semibold",
            tab === "videos"
              ? "bg-[var(--card2)] text-[var(--text)] shadow-sm"
              : "text-[var(--text2)] hover:text-[var(--text)]"
          )}
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Top Vídeos
        </button>
        <button
          onClick={() => updateParams({ tab: "channels" })}
          className={cn(
            "px-4 py-2 text-sm rounded-lg transition-all font-semibold",
            tab === "channels"
              ? "bg-[var(--card2)] text-[var(--text)] shadow-sm"
              : "text-[var(--text2)] hover:text-[var(--text)]"
          )}
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Top Canais
        </button>
      </div>

      <div className="bg-gradient-to-br from-[var(--card)] to-[var(--card2)] border border-[var(--border)] rounded-2xl p-6 mb-7">
        <div className="flex flex-wrap gap-2.5 items-end">
          {tab === "videos" ? (
            <>
              <FilterSelect
                label="Região"
                value={region}
                onChange={(v) => updateParams({ region: v })}
                options={TRENDING_SELECT_REGIONS}
              />
              <FilterSelect
                label="Categoria"
                value={category}
                onChange={(v) => updateParams({ category: v })}
                options={YOUTUBE_CATEGORY_OPTIONS}
              />
              <div className="flex flex-col gap-1.5">
                <p className="text-[9px] uppercase tracking-[0.18em] text-[var(--text3)] font-mono">
                  Formato
                </p>
                <div className="flex gap-1 p-1 bg-[var(--card)] rounded-lg border border-[var(--border)]">
                  {(["all", "shorts", "longform"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => updateParams({ format: f })}
                      className={cn(
                        "px-3 py-1.5 text-xs font-mono rounded transition-colors",
                        formatFilter === f
                          ? "bg-[var(--card2)] text-[var(--text)]"
                          : "text-[var(--text3)] hover:text-[var(--text)]"
                      )}
                    >
                      {f === "all" ? "Todos" : f === "shorts" ? "⚡ Shorts" : "📺 Long Form"}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="rankings-keyword" className="text-[9px] uppercase tracking-[0.18em] text-[var(--text3)] font-mono">
                  Keyword
                </label>
                <input
                  id="rankings-keyword"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && updateParams({ keyword: keyword.trim() || "viral" })}
                  placeholder="Nicho ou keyword..."
                  className={input}
                />
              </div>
              <button
                onClick={() => updateParams({ keyword: keyword.trim() || "viral" })}
                className="px-4 py-2 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:bg-[#ff5555] transition-all"
              >
                Buscar
              </button>
              <FilterSelect
                label="Região"
                value={region}
                onChange={(v) => updateParams({ region: v })}
                options={TRENDING_SELECT_REGIONS}
              />
            </>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} className="mb-5" />}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <Spinner className="mb-4" />
          <p className="font-mono text-sm">
            {tab === "videos" ? "A carregar top vídeos..." : "A carregar top canais..."}
          </p>
        </div>
      ) : tab === "videos" ? (
        filteredVideos.length === 0 ? (
          <EmptyState icon="📭" title="Sem vídeos" />
        ) : (
          <>
            <div className="mb-4">
              <div className={sectionTitle}>
                Top vídeos em {region}
              </div>
              <p className="text-[11px] text-[var(--text3)] font-mono">
                {filteredVideos.length} vídeos
              </p>
            </div>
            <VideoGrid videos={filteredVideos} onVideoOpen={setSelectedVideo} />
            {videosNextToken && (
              <div className="mt-6 text-center">
                <button
                  onClick={loadMoreVideos}
                  disabled={videosLoadingMore}
                  className="px-6 py-3 bg-[var(--card2)] border border-[var(--border2)] text-[var(--text)] text-sm font-semibold rounded-xl hover:bg-[var(--border)] transition-colors duration-200 disabled:opacity-50 font-display"
                >
                  {videosLoadingMore ? "A carregar..." : "Carregar mais"}
                </button>
              </div>
            )}
          </>
        )
      ) : channels.length === 0 ? (
        <EmptyState icon="📭" title="Sem canais" />
      ) : (
        <div className="space-y-3">
          <div className={sectionTitle}>Top canais em ascensão</div>
          <p className="text-[11px] text-[var(--text3)] font-mono mb-4">
            {channels.length} canais
          </p>
          {channels.map((ch) => (
            <Link
              key={ch.channelId}
              href={`/channels/${ch.channelId}`}
              className="block"
            >
              <div className="flex items-center gap-4 p-5 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-[var(--border2)] transition-all">
                <div className="size-14 rounded-full bg-[var(--bg3)] overflow-hidden shrink-0">
                  {ch.thumbnail && (
                    <img
                      src={ch.thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-2">
                    {ch.name}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--green)]/20 text-[var(--green)]">
                      Rising {ch.risingScore}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text3)] font-mono mt-1">
                    {ch.subscriberCount.toLocaleString()} subs ·{" "}
                    {(ch.viewCount / Math.max(ch.videoCount, 1)).toLocaleString()} views/vídeo
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">
                    {ch.subscriberCount.toLocaleString()} subs
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {channelsNextToken && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMoreChannels}
                disabled={channelsLoadingMore}
                className="px-6 py-3 bg-[var(--card2)] border border-[var(--border2)] text-[var(--text)] text-sm font-semibold rounded-xl hover:bg-[var(--border)] transition-colors duration-200 disabled:opacity-50 font-display"
              >
                {channelsLoadingMore ? "A carregar..." : "Carregar mais"}
              </button>
            </div>
          )}
        </div>
      )}

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
}

export default function RankingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <Spinner className="mb-4" />
          <p className="font-mono text-sm">A carregar...</p>
        </div>
      }
    >
      <RankingsPageContent />
    </Suspense>
  );
}
