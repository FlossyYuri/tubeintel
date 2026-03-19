"use client";

import Image from "next/image";
import { ViralScore } from "./ViralScore";
import { formatNumber, formatDate, formatAbsoluteDate, parseDuration, isShort } from "@/lib/format";
import {
  badge,
  badgeViral,
  badgeShort,
  badgeNew,
  badgeLongForm,
  cardClasses,
} from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { VideoWithStats } from "@/types/youtube";

interface VideoCardProps {
  video: VideoWithStats;
  listView?: boolean;
  onOpen?: (video: VideoWithStats) => void;
  /** When set, shows "X.Xx média do canal" badge */
  outperformanceRatio?: number;
}

export function VideoCard({ video, listView = false, onOpen, outperformanceRatio }: VideoCardProps) {
  const score = video.viralScore;
  const short = isShort(video.duration || "", video.title);
  const pub = formatDate(video.publishedAt);
  const isNew = pub.includes("h atrás") || pub.includes("m atrás");

  return (
    <div
      className={cn(
        cardClasses("overflow-hidden cursor-pointer group"),
        listView && "flex flex-col sm:flex-row sm:items-center"
      )}
      onClick={() => onOpen?.(video)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen?.(video)}
    >
      <div
        className={cn(
          "relative aspect-video bg-[var(--bg3)] overflow-hidden shrink-0",
          listView && "w-full sm:w-[180px] sm:min-w-[180px]"
        )}
      >
        {video.thumbnail && (
          <Image
            src={video.thumbnail}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={listView ? "(max-width: 640px) 100vw, 180px" : "(max-width: 400px) 100vw, 280px"}
          />
        )}
        {score >= 75 && (
          <div className="absolute top-2 left-2 bg-[var(--accent)] text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
            viral
          </div>
        )}
        {short && (
          <div className="absolute top-2 right-2 bg-[var(--purple)] text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
            Short
          </div>
        )}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
            {parseDuration(video.duration)}
          </div>
        )}
      </div>
      <div className={cn("p-3 sm:p-3.5", listView && "flex-1 min-w-0")}>
        <div className="flex gap-1 flex-wrap mb-2">
          {outperformanceRatio != null && outperformanceRatio >= 1.5 && (
            <span className={cn(badge, "bg-[rgba(0,217,126,0.15)] text-[var(--green)] border border-[rgba(0,217,126,0.3)]")}>
              {outperformanceRatio.toFixed(1)}x média
            </span>
          )}
          {short ? (
            <span className={cn(badge, badgeShort)}>Short</span>
          ) : (
            <span className={cn(badge, badgeLongForm)}>Long Form</span>
          )}
          {score >= 75 && <span className={cn(badge, badgeViral)}>Viral</span>}
          {isNew && <span className={cn(badge, badgeNew)}>Novo</span>}
        </div>
        <h3 className="text-[13px] font-semibold leading-snug mb-2 line-clamp-2">
          {video.title}
        </h3>
        <p className="text-[11px] text-[var(--blue2)] mb-2.5">
          📺 {video.channelTitle}
        </p>
        <div className="flex gap-2.5 flex-wrap text-[10px] font-mono">
          {video.viewCount > 0 && (
            <span className="text-[var(--accent)]">
              👁 {formatNumber(video.viewCount)}
            </span>
          )}
          {video.likeCount > 0 && (
            <span className="text-[var(--green)]">
              👍 {formatNumber(video.likeCount)}
            </span>
          )}
          {video.commentCount > 0 && (
            <span className="text-[var(--text3)]">
              💬 {formatNumber(video.commentCount)}
            </span>
          )}
          {pub && (
            <span className="text-[var(--text3)]" title={formatAbsoluteDate(video.publishedAt)}>
              🕐 {pub}
              <span className="ml-1 opacity-70">({formatAbsoluteDate(video.publishedAt)})</span>
            </span>
          )}
        </div>
        <ViralScore score={score} />
      </div>
    </div>
  );
}
