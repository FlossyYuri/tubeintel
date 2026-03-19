"use client";

import Image from "next/image";
import { formatNumber, parseDuration } from "@/lib/format";
import { cardClasses } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { VideoWithStats } from "@/types/youtube";

export type StudyMode = "titles" | "thumbnails";
export type StudyFormat = "longform" | "shorts";

interface StudyVideoCardProps {
  video: VideoWithStats;
  mode: StudyMode;
  format: StudyFormat;
  onOpen?: (video: VideoWithStats) => void;
}

export function StudyVideoCard({
  video,
  mode,
  format,
  onOpen,
}: StudyVideoCardProps) {
  const isShorts = format === "shorts";
  const durationStr = video.duration
    ? parseDuration(video.duration)
    : "—";

  if (mode === "titles") {
    return (
      <div
        className={cn(
          cardClasses("overflow-hidden cursor-pointer group flex flex-row"),
        )}
        onClick={() => onOpen?.(video)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onOpen?.(video)}
      >
        <div className="relative w-24 min-w-24 sm:w-[120px] sm:min-w-[120px] aspect-video bg-[var(--bg3)] overflow-hidden shrink-0">
          {video.thumbnail && (
            <Image
              src={video.thumbnail}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="120px"
            />
          )}
          <div className="absolute bottom-1 right-1 bg-black/85 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
            {durationStr}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center p-3 min-w-0">
          <h3 className="text-[14px] font-semibold leading-snug line-clamp-3 mb-1">
            {video.title}
          </h3>
          <p className="text-[11px] text-[var(--blue2)] truncate mb-2">
            📺 {video.channelTitle}
          </p>
          <div className="flex gap-2.5 text-[10px] font-mono">
            <span className="text-[var(--accent)]">
              👁 {formatNumber(video.viewCount)}
            </span>
            <span className="text-[var(--text3)]">⏱ {durationStr}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        cardClasses("overflow-hidden cursor-pointer group flex flex-col"),
      )}
      onClick={() => onOpen?.(video)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen?.(video)}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-[var(--bg3)]",
          isShorts ? "aspect-[9/16]" : "aspect-video",
        )}
      >
        {video.thumbnail && (
          <Image
            src={video.thumbnail}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={isShorts ? "200px" : "280px"}
          />
        )}
        <div className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
          {durationStr}
        </div>
      </div>
      <div className="p-3 min-w-0">
        <h3 className="text-[12px] font-semibold leading-snug line-clamp-1 mb-1">
          {video.title}
        </h3>
        <div className="flex gap-2.5 text-[10px] font-mono">
          <span className="text-[var(--accent)]">
            👁 {formatNumber(video.viewCount)}
          </span>
          <span className="text-[var(--text3)]">⏱ {durationStr}</span>
        </div>
      </div>
    </div>
  );
}
