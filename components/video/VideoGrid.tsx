"use client";

import { useState } from "react";
import { VideoCard } from "./VideoCard";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoWithStats } from "@/types/youtube";

interface VideoGridProps {
  videos: VideoWithStats[];
  onVideoOpen?: (video: VideoWithStats) => void;
  /** Optional extra props per video (e.g. outperformanceRatio) */
  getVideoCardProps?: (video: VideoWithStats) => { outperformanceRatio?: number };
}

export function VideoGrid({ videos, onVideoOpen, getVideoCardProps }: VideoGridProps) {
  const [listView, setListView] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-4">
        <div className="flex gap-1 bg-[var(--card)] p-1 rounded-lg border border-[var(--border)]">
          <button
            onClick={() => setListView(false)}
            className={cn(
              "p-2.5 sm:p-1.5 rounded transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
              !listView
                ? "bg-[var(--card2)] text-[var(--text)]"
                : "text-[var(--text3)] hover:text-[var(--text)]"
            )}
            aria-label="Vista em grelha"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setListView(true)}
            className={cn(
              "p-2.5 sm:p-1.5 rounded transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
              listView
                ? "bg-[var(--card2)] text-[var(--text)]"
                : "text-[var(--text3)] hover:text-[var(--text)]"
            )}
            aria-label="Vista em lista"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>
      <div
        className={cn(
          "grid gap-4",
          listView
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}
      >
        {videos.map((video) => (
          <VideoCard
            key={video.videoId}
            video={video}
            listView={listView}
            onOpen={onVideoOpen}
            {...getVideoCardProps?.(video)}
          />
        ))}
      </div>
    </div>
  );
}
