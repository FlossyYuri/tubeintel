"use client";

import { useState } from "react";
import { VideoCard } from "./VideoCard";
import { LayoutGrid, List } from "lucide-react";
import type { VideoWithStats } from "@/types/youtube";

interface VideoGridProps {
  videos: VideoWithStats[];
  onVideoOpen?: (video: VideoWithStats) => void;
}

export function VideoGrid({ videos, onVideoOpen }: VideoGridProps) {
  const [listView, setListView] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-4">
        <div className="flex gap-1 bg-[var(--card)] p-1 rounded-lg border border-[var(--border)]">
          <button
            onClick={() => setListView(false)}
            className={`p-1.5 rounded transition-colors ${
              !listView ? "bg-[var(--card2)] text-[var(--text)]" : "text-[var(--text3)]"
            }`}
            aria-label="Vista em grelha"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setListView(true)}
            className={`p-1.5 rounded transition-colors ${
              listView ? "bg-[var(--card2)] text-[var(--text)]" : "text-[var(--text3)]"
            }`}
            aria-label="Vista em lista"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>
      <div
        className={`grid gap-4 ${
          listView
            ? "grid-cols-1"
            : "grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
        }`}
      >
        {videos.map((video) => (
          <VideoCard
            key={video.videoId}
            video={video}
            listView={listView}
            onOpen={onVideoOpen}
          />
        ))}
      </div>
    </div>
  );
}
