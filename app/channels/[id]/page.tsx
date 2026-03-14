"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ChannelStats } from "@/components/channel/ChannelStats";
import { ChannelGrowthChart } from "@/components/channel/ChannelGrowthChart";
import { RisingBadge } from "@/components/channel/RisingBadge";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
import { SortControls } from "@/components/video/SortControls";
import { Spinner, ErrorMessage } from "@/components/ui";
import { sectionTitle } from "@/lib/design-tokens";
import { mergeSearchWithVideos } from "@/lib/transform";
import { calcRisingScore } from "@/lib/rising-detector";
import { calcEngagementRate } from "@/lib/viral-score";
import { sortVideos, type VideoSortKey } from "@/lib/sort-videos";
import type { VideoWithStats } from "@/types/youtube";

export default function ChannelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [channel, setChannel] = useState<{
    name: string;
    thumbnail: string;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
    publishedAt: string;
    description: string;
  } | null>(null);
  const [videos, setVideos] = useState<VideoWithStats[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoWithStats | null>(null);
  const [videoSort, setVideoSort] = useState<VideoSortKey>("recent");

  const apiOrder =
    videoSort === "views"
      ? "viewCount"
      : videoSort === "recent"
        ? "date"
        : "viewCount";

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    setNextPageToken(undefined);

    Promise.all([
      fetch(`/api/youtube/channel?channelId=${id}`),
      fetch(
        `/api/youtube/channel-videos?channelId=${id}&maxResults=12&order=${apiOrder}`
      ),
    ])
      .then(async ([chRes, vRes]) => {
        const chData = await chRes.json();
        const vData = await vRes.json();

        if (!chRes.ok) throw new Error(chData.error || "Channel failed");
        if (!vRes.ok) throw new Error(vData.error || "Videos failed");

        const ch = chData.items?.[0] ?? chData.channels?.items?.[0];
        if (!ch) throw new Error("Canal não encontrado");

        setChannel({
          name: ch.snippet?.title || "",
          thumbnail: ch.snippet?.thumbnails?.medium?.url || ch.snippet?.thumbnails?.high?.url || "",
          subscriberCount: parseInt(ch.statistics?.subscriberCount || "0", 10),
          videoCount: parseInt(ch.statistics?.videoCount || "0", 10),
          viewCount: parseInt(ch.statistics?.viewCount || "0", 10),
          publishedAt: ch.snippet?.publishedAt || new Date().toISOString(),
          description: ch.snippet?.description || "",
        });

        const merged = mergeSearchWithVideos(vData.search?.items || [], vData.videos?.items || []);
        setVideos(merged);
        setNextPageToken(vData.nextPageToken);
      })
      .catch((err) => {
        setError(err.message);
        setChannel(null);
        setVideos([]);
      })
      .finally(() => setLoading(false));
  }, [id, apiOrder]);

  const loadMoreVideos = useCallback(async () => {
    if (!id || !nextPageToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/youtube/channel-videos?channelId=${id}&maxResults=12&order=${apiOrder}&pageToken=${encodeURIComponent(nextPageToken)}`
      );
      const vData = await res.json();
      if (!res.ok) throw new Error(vData.error || "Failed");
      const merged = mergeSearchWithVideos(vData.search?.items || [], vData.videos?.items || []);
      setVideos((prev) => [...prev, ...merged]);
      setNextPageToken(vData.nextPageToken);
    } catch {
      // Silently fail
    } finally {
      setLoadingMore(false);
    }
  }, [id, nextPageToken, loadingMore, apiOrder]);

  const risingScore = channel
    ? calcRisingScore({
        subscriberCount: channel.subscriberCount,
        viewCount: channel.viewCount,
        videoCount: channel.videoCount,
        publishedAt: channel.publishedAt,
      })
    : 0;

  const avgViews = channel && channel.videoCount > 0
    ? Math.round(channel.viewCount / channel.videoCount)
    : 0;

  const avgEngagement =
    videos.length > 0
      ? videos.reduce(
          (sum, v) =>
            sum + calcEngagementRate(v.viewCount, v.likeCount, v.commentCount),
          0
        ) / videos.length
      : 0;

  const chartData = videos
    .slice()
    .reverse()
    .map((v, i) => ({
      index: i,
      views: v.viewCount,
      label: `V${videos.length - i}`,
    }));

  const outperformingVideos = useMemo(() => {
    if (!channel || videos.length === 0) return [];
    const avg = channel.viewCount / Math.max(channel.videoCount, 1);
    return videos
      .map((v) => ({
        ...v,
        ratio: avg > 0 ? v.viewCount / avg : 0,
      }))
      .filter((v) => v.ratio >= 1.5)
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 5);
  }, [channel, videos]);

  const sortedVideos = useMemo(() => {
    if (videoSort === "views" || videoSort === "recent") {
      return videos;
    }
    return sortVideos(videos, videoSort);
  }, [videos, videoSort]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
        <Spinner className="mb-4" />
        <p className="font-mono text-sm">A carregar canal...</p>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--blue2)] hover:underline mb-4"
        >
          <ArrowLeft className="size-4" /> Voltar
        </button>
        <ErrorMessage message={error || "Canal não encontrado"} />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push("/channels")}
        className="flex items-center gap-2 text-[var(--blue2)] hover:underline mb-4"
      >
        <ArrowLeft className="size-4" /> Voltar
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="size-16 rounded-full bg-[var(--card)] border-2 border-[var(--border2)] overflow-hidden shrink-0">
          {channel.thumbnail && (
            <img src={channel.thumbnail} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-extrabold flex items-center gap-2 font-display">
            {channel.name}
            <RisingBadge score={risingScore} />
          </h2>
          <a
            href={`https://www.youtube.com/channel/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-sm text-[var(--blue2)] hover:text-[var(--blue)] transition-colors"
          >
            <ExternalLink className="size-4" />
            Abrir no YouTube
          </a>
        </div>
      </div>

      {channel.description && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text3)] mb-2">
            Sobre
          </h3>
          <p className="text-sm text-[var(--text2)] line-clamp-4 whitespace-pre-wrap">
            {channel.description}
          </p>
        </div>
      )}

      <ChannelStats
        subscriberCount={channel.subscriberCount}
        viewCount={channel.viewCount}
        videoCount={channel.videoCount}
        avgViews={avgViews}
        avgEngagement={avgEngagement}
      />

      {chartData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3 text-[var(--text2)]">Performance dos últimos vídeos</h3>
          <ChannelGrowthChart data={chartData} />
        </div>
      )}

      {outperformingVideos.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3 text-[var(--text2)]">
            Vídeos que superaram a média do canal
          </h3>
          <VideoGrid
            videos={outperformingVideos.map(({ ratio, ...v }) => v)}
            onVideoOpen={setSelectedVideo}
            getVideoCardProps={(v) => {
              const ov = outperformingVideos.find((o) => o.videoId === v.videoId);
              return { outperformanceRatio: ov?.ratio };
            }}
          />
        </div>
      )}

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className={sectionTitle}>
          📹 Vídeos
        </h3>
        <div className="flex items-center gap-2">
          <SortControls value={videoSort} onChange={setVideoSort} />
          {videos.length > 0 && (
            <span className="text-[11px] text-[var(--text3)] font-mono">
              {videos.length} vídeos
            </span>
          )}
        </div>
      </div>
      <VideoGrid videos={sortedVideos} onVideoOpen={setSelectedVideo} />

      {nextPageToken && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMoreVideos}
            disabled={loadingMore}
            className="px-6 py-3 bg-[var(--card2)] border border-[var(--border2)] text-[var(--text)] text-sm font-semibold rounded-xl hover:bg-[var(--border)] transition-colors duration-200 disabled:opacity-50 font-display"
          >
            {loadingMore ? "A carregar..." : "Carregar mais vídeos"}
          </button>
        </div>
      )}

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
}
