import type { ChannelWithStats } from "@/types/youtube";

export type ChannelSortKey =
  | "subscribers"
  | "views"
  | "videos"
  | "viewsPerSub"
  | "name"
  | "recent";

export const CHANNEL_SORT_OPTIONS: { value: ChannelSortKey; label: string }[] = [
  { value: "subscribers", label: "Subs" },
  { value: "views", label: "Views" },
  { value: "videos", label: "Vídeos" },
  { value: "viewsPerSub", label: "Views/Sub" },
  { value: "name", label: "Nome" },
  { value: "recent", label: "Recente" },
];

/** Views por subscritor – proxy de engagement do canal */
function getViewsPerSub(ch: ChannelWithStats): number {
  if (ch.subscriberCount <= 0) return 0;
  return ch.viewCount / ch.subscriberCount;
}

export function sortChannels<T extends ChannelWithStats>(
  channels: T[],
  sortBy: ChannelSortKey
): T[] {
  const copy = [...channels];
  switch (sortBy) {
    case "subscribers":
      return copy.sort((a, b) => b.subscriberCount - a.subscriberCount);
    case "views":
      return copy.sort((a, b) => b.viewCount - a.viewCount);
    case "videos":
      return copy.sort((a, b) => b.videoCount - a.videoCount);
    case "viewsPerSub":
      return copy.sort(
        (a, b) => getViewsPerSub(b) - getViewsPerSub(a)
      );
    case "name":
      return copy.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", "pt")
      );
    case "recent":
      return copy.sort((a, b) => {
        const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return db - da;
      });
    default:
      return copy;
  }
}
