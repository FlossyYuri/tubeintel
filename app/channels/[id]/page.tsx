"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChannelStats } from "@/components/channel/ChannelStats";
import { ChannelGrowthChart } from "@/components/channel/ChannelGrowthChart";
import { RisingBadge } from "@/components/channel/RisingBadge";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
import { mergeSearchWithVideos } from "@/lib/transform";
import { calcRisingScore } from "@/lib/rising-detector";
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
  } | null>(null);
  const [videos, setVideos] = useState<VideoWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoWithStats | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");

    Promise.all([
      fetch(`/api/youtube/channel?channelId=${id}`),
      fetch(`/api/youtube/channel-videos?channelId=${id}&maxResults=12`),
    ])
      .then(async ([chRes, vRes]) => {
        const chData = await chRes.json();
        const vData = await vRes.json();

        if (!chRes.ok) throw new Error(chData.error || "Channel failed");
        if (!vRes.ok) throw new Error(vData.error || "Videos failed");

        const ch = chData.items?.[0];
        if (!ch) throw new Error("Canal não encontrado");

        setChannel({
          name: ch.snippet?.title || "",
          thumbnail: ch.snippet?.thumbnails?.medium?.url || ch.snippet?.thumbnails?.high?.url || "",
          subscriberCount: parseInt(ch.statistics?.subscriberCount || "0", 10),
          videoCount: parseInt(ch.statistics?.videoCount || "0", 10),
          viewCount: parseInt(ch.statistics?.viewCount || "0", 10),
          publishedAt: ch.snippet?.publishedAt || new Date().toISOString(),
        });

        const merged = mergeSearchWithVideos(vData.search?.items || [], vData.videos?.items || []);
        setVideos(merged);
      })
      .catch((err) => {
        setError(err.message);
        setChannel(null);
        setVideos([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

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

  const chartData = videos
    .slice()
    .reverse()
    .map((v, i) => ({
      index: i,
      views: v.viewCount,
      label: `V${videos.length - i}`,
    }));

  if (loading) {
    return (
      <div className="text-center py-16 text-[var(--text3)]">
        <div className="w-9 h-9 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-4" />
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
        <div className="p-4 rounded-xl bg-[rgba(255,61,61,0.08)] border border-[rgba(255,61,61,0.3)] text-sm">
          ❌ {error || "Canal não encontrado"}
        </div>
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

      <div className="flex items-center gap-4 mb-6">
        <div className="size-16 rounded-full bg-[var(--card)] border-2 border-[var(--border2)] overflow-hidden shrink-0">
          {channel.thumbnail && (
            <img src={channel.thumbnail} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2" style={{ fontFamily: "Syne, sans-serif" }}>
            {channel.name}
            <RisingBadge score={risingScore} />
          </h2>
        </div>
      </div>

      <ChannelStats
        subscriberCount={channel.subscriberCount}
        viewCount={channel.viewCount}
        videoCount={channel.videoCount}
        avgViews={avgViews}
      />

      {chartData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3 text-[var(--text2)]">Performance dos últimos vídeos</h3>
          <ChannelGrowthChart data={chartData} />
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-[15px] font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
          📹 Vídeos mais recentes
        </h3>
      </div>
      <VideoGrid videos={videos} onVideoOpen={setSelectedVideo} />

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
}
