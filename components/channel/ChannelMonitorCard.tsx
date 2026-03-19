"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Eye, Video } from "lucide-react";
import { formatNumber, parseDuration, isShort } from "@/lib/format";
import { estimateRevenue, DEFAULT_REVENUE_PARAMS } from "@/lib/revenue";
import { mergeSearchWithVideos } from "@/lib/transform";
import { VideoModal } from "@/components/video/VideoModal";
import { Spinner } from "@/components/ui";
import { card } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { VideoWithStats } from "@/types/youtube";

interface ChannelMonitorCardProps {
  channelId: string;
  compact?: boolean;
}

interface ChannelData {
  name: string;
  thumbnail: string;
  subscriberCount: number;
}

interface AnalyticsData {
  shorts: { views: number; videoCount: number };
  longForm: { views: number; videoCount: number };
  periodDays: number;
}

export function ChannelMonitorCard({
  channelId,
  compact = false,
}: ChannelMonitorCardProps) {
  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [videos, setVideos] = useState<VideoWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoWithStats | null>(null);

  useEffect(() => {
    if (!channelId) return;
    setLoading(true);
    setError("");

    Promise.all([
      fetch(`/api/youtube/channel?channelId=${channelId}`),
      fetch(`/api/youtube/channel-analytics?channelId=${channelId}&days=28`),
      fetch(
        `/api/youtube/channel-videos?channelId=${channelId}&maxResults=8&order=date`
      ),
    ])
      .then(async ([chRes, aRes, vRes]) => {
        const chData = await chRes.json();
        const aData = await aRes.json();
        const vData = await vRes.json();

        if (!chRes.ok) throw new Error(chData.error || "Channel failed");

        const ch = chData.channels?.items?.[0] ?? chData.items?.[0];
        if (ch) {
          setChannel({
            name: ch.snippet?.title || "",
            thumbnail:
              ch.snippet?.thumbnails?.medium?.url ||
              ch.snippet?.thumbnails?.high?.url ||
              "",
            subscriberCount: parseInt(ch.statistics?.subscriberCount || "0", 10),
          });
        }

        if (aRes.ok && aData.shorts != null && aData.longForm != null) {
          setAnalytics({
            shorts: { views: aData.shorts.views, videoCount: aData.shorts.videoCount },
            longForm: {
              views: aData.longForm.views,
              videoCount: aData.longForm.videoCount,
            },
            periodDays: aData.periodDays ?? 28,
          });
        }

        if (vRes.ok && vData.search?.items && vData.videos?.items) {
          const merged = mergeSearchWithVideos(
            vData.search.items,
            vData.videos.items
          );
          setVideos(merged.slice(0, 6));
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Erro ao carregar");
      })
      .finally(() => setLoading(false));
  }, [channelId]);

  if (loading) {
    return (
      <div
        className={cn(
          card,
          "p-6 flex flex-col items-center justify-center min-h-[200px]"
        )}
      >
        <Spinner className="mb-3" />
        <p className="text-xs text-[var(--text3)]">A carregar canal...</p>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div
        className={cn(
          card,
          "p-6 border-[var(--accent)]/30 text-[var(--accent)] text-sm"
        )}
      >
        {error || "Canal não encontrado"}
      </div>
    );
  }

  const totalViews28d =
    (analytics?.shorts.views || 0) + (analytics?.longForm.views || 0);
  const revenue = analytics
    ? estimateRevenue(
        analytics.shorts.views,
        analytics.longForm.views,
        DEFAULT_REVENUE_PARAMS
      )
    : null;

  return (
    <div className={cn(card, "overflow-hidden")}>
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-[var(--border)]">
        <div className="size-14 rounded-full bg-[var(--bg3)] overflow-hidden shrink-0">
          {channel.thumbnail && (
            <Image
              src={channel.thumbnail}
              alt=""
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold truncate text-[var(--text)]">
            {channel.name}
          </h3>
          <p className="text-xs text-[var(--text3)] font-mono">
            {formatNumber(channel.subscriberCount)} subs
          </p>
        </div>
        <Link
          href={`/channels/${channelId}`}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--blue2)] hover:border-[var(--blue2)] hover:bg-[var(--blue2)]/10 transition-colors text-sm font-medium"
        >
          <ExternalLink className="size-4" />
          Ver análise
        </Link>
      </div>

      {!compact && (
        <>
          {/* 28 days summary */}
          {analytics && (analytics.shorts.videoCount > 0 || analytics.longForm.videoCount > 0) && (
            <div className="p-4 border-b border-[var(--border)]">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-[var(--text3)] mb-3">
                Últimos {analytics.periodDays} dias
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                  <div className="flex items-center gap-1.5 text-[var(--accent)] mb-0.5">
                    <Eye className="size-3.5" />
                    <span className="text-[10px] font-mono uppercase">Views</span>
                  </div>
                  <div className="font-bold text-sm">
                    {formatNumber(totalViews28d)}
                  </div>
                </div>
                {analytics.shorts.videoCount > 0 && (
                  <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--purple)]">
                      Shorts
                    </span>
                    <div className="font-bold text-sm text-[var(--purple)]">
                      {formatNumber(analytics.shorts.views)}
                    </div>
                  </div>
                )}
                {analytics.longForm.videoCount > 0 && (
                  <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--blue2)]">
                      Long Form
                    </span>
                    <div className="font-bold text-sm text-[var(--blue2)]">
                      {formatNumber(analytics.longForm.views)}
                    </div>
                  </div>
                )}
                {revenue && revenue.totalRevenue > 0 && (
                  <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--green)]">
                      Receita est.
                    </span>
                    <div className="font-bold text-sm text-[var(--green)]">
                      ${revenue.totalRevenue.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent videos */}
          {videos.length > 0 && (
            <div className="p-4">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-[var(--text3)] mb-3 flex items-center gap-1.5">
                <Video className="size-3.5" />
                Vídeos recentes
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {videos.map((v) => (
                  <button
                    key={v.videoId}
                    onClick={() => setSelectedVideo(v)}
                    className="text-left rounded-lg border border-[var(--border)] overflow-hidden hover:border-[var(--border2)] transition-colors group"
                  >
                    <div className="relative aspect-video bg-[var(--bg3)]">
                      {v.thumbnail && (
                        <Image
                          src={v.thumbnail}
                          alt=""
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="120px"
                        />
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/85 text-white text-[9px] px-1 py-0.5 rounded font-mono">
                        {v.duration ? parseDuration(v.duration) : "—"}
                      </div>
                      {isShort(v.duration || "", v.title) && (
                        <div className="absolute top-1 right-1 bg-[var(--purple)] text-white text-[8px] px-1 rounded">
                          Short
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] font-medium line-clamp-2 mb-1">
                        {v.title}
                      </p>
                      <div className="flex gap-2 text-[10px] text-[var(--text3)] font-mono">
                        <span className="text-[var(--accent)]">
                          {formatNumber(v.viewCount)}
                        </span>
                        <span>Viral {v.viralScore}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
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
