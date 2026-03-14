import { calcEngagementRate } from "@/lib/viral-score";
import type { VideoWithStats } from "@/types/youtube";

export type VideoSortKey =
  | "views"
  | "recent"
  | "viral"
  | "likes"
  | "engagement"
  | "ratio";

export const SORT_OPTIONS: { value: VideoSortKey; label: string }[] = [
  { value: "views", label: "Views" },
  { value: "recent", label: "Recente" },
  { value: "viral", label: "Viral" },
  { value: "likes", label: "Likes" },
  { value: "engagement", label: "Engagement" },
];

export function sortVideos<T extends VideoWithStats>(
  videos: T[],
  sortBy: VideoSortKey,
  getRatio?: (v: T) => number
): T[] {
  const copy = [...videos];
  switch (sortBy) {
    case "views":
      return copy.sort((a, b) => b.viewCount - a.viewCount);
    case "recent":
      return copy.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    case "viral":
      return copy.sort((a, b) => b.viralScore - a.viralScore);
    case "likes":
      return copy.sort((a, b) => b.likeCount - a.likeCount);
    case "engagement":
      return copy.sort(
        (a, b) =>
          calcEngagementRate(b.viewCount, b.likeCount, b.commentCount) -
          calcEngagementRate(a.viewCount, a.likeCount, a.commentCount)
      );
    case "ratio":
      if (!getRatio) return copy;
      return copy.sort((a, b) => getRatio(b) - getRatio(a));
    default:
      return copy;
  }
}
