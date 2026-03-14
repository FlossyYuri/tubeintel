"use client";

import { StudyVideoCard, type StudyMode, type StudyFormat } from "./StudyVideoCard";
import { cn } from "@/lib/utils";
import type { VideoWithStats } from "@/types/youtube";

interface StudyVideoGridProps {
  videos: VideoWithStats[];
  mode: StudyMode;
  format: StudyFormat;
  onVideoOpen?: (video: VideoWithStats) => void;
}

export function StudyVideoGrid({
  videos,
  mode,
  format,
  onVideoOpen,
}: StudyVideoGridProps) {
  const isTitlesMode = mode === "titles";

  return (
    <div
      className={cn(
        "grid gap-4",
        isTitlesMode
          ? "grid-cols-1 lg:grid-cols-2"
          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
      )}
    >
      {videos.map((video) => (
        <StudyVideoCard
          key={video.videoId}
          video={video}
          mode={mode}
          format={format}
          onOpen={onVideoOpen}
        />
      ))}
    </div>
  );
}
